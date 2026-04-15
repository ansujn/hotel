package asset

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PGStore is the pgx-backed implementation of Store. We can't use the sqlc
// generated code yet (queries are frozen but not generated into Go for this
// phase), so we hand-roll the queries. They match the names and shapes in
// api/internal/db/queries/assets.sql and audit.sql.
type PGStore struct{ pool *pgxpool.Pool }

func NewPGStore(pool *pgxpool.Pool) *PGStore { return &PGStore{pool: pool} }

func (s *PGStore) InsertAsset(ctx context.Context, studentID uuid.UUID, kind, title string) (*Asset, error) {
	const q = `
		INSERT INTO assets (student_id, type, title)
		VALUES ($1, $2::asset_type, $3)
		RETURNING id::text, student_id::text, type::text, title,
		          mux_playback_id, duration_s, privacy::text, created_at
	`
	a := &Asset{}
	var playback *string
	var dur *int32
	err := s.pool.QueryRow(ctx, q, studentID, kind, title).Scan(
		&a.ID, &a.StudentID, &a.Type, &a.Title, &playback, &dur, &a.Privacy, &a.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	a.MuxPlaybackID = playback
	a.DurationS = dur
	return a, nil
}

func (s *PGStore) GetAsset(ctx context.Context, id uuid.UUID) (*Asset, error) {
	const q = `
		SELECT id::text, student_id::text, type::text, title,
		       mux_playback_id, duration_s, privacy::text, created_at
		FROM assets WHERE id = $1
	`
	a := &Asset{}
	var playback *string
	var dur *int32
	err := s.pool.QueryRow(ctx, q, id).Scan(
		&a.ID, &a.StudentID, &a.Type, &a.Title, &playback, &dur, &a.Privacy, &a.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("asset not found")
		}
		return nil, err
	}
	a.MuxPlaybackID = playback
	a.DurationS = dur
	return a, nil
}

func (s *PGStore) SetMuxIDs(ctx context.Context, id uuid.UUID, muxAssetID, playback string, duration int32) error {
	const q = `UPDATE assets SET mux_asset_id=$2, mux_playback_id=$3, duration_s=$4 WHERE id=$1`
	_, err := s.pool.Exec(ctx, q, id, muxAssetID, playback, duration)
	return err
}

func (s *PGStore) UpdatePrivacy(ctx context.Context, id uuid.UUID, privacy string) error {
	const q = `UPDATE assets SET privacy=$2::asset_privacy WHERE id=$1`
	_, err := s.pool.Exec(ctx, q, id, privacy)
	return err
}

// SetUploadID stores the Mux upload id so we can reconcile on webhook.
// Schema doesn't have a dedicated column — we stash it in mux_asset_id
// temporarily (overwritten by the real asset id on video.asset.ready).
func (s *PGStore) SetUploadID(ctx context.Context, id uuid.UUID, uploadID string) error {
	const q = `UPDATE assets SET mux_asset_id=$2 WHERE id=$1`
	_, err := s.pool.Exec(ctx, q, id, "upload:"+uploadID)
	return err
}

func (s *PGStore) GetByUploadID(ctx context.Context, uploadID string) (*Asset, error) {
	const q = `
		SELECT id::text, student_id::text, type::text, title,
		       mux_playback_id, duration_s, privacy::text, created_at
		FROM assets WHERE mux_asset_id = $1
	`
	a := &Asset{}
	var playback *string
	var dur *int32
	err := s.pool.QueryRow(ctx, q, "upload:"+uploadID).Scan(
		&a.ID, &a.StudentID, &a.Type, &a.Title, &playback, &dur, &a.Privacy, &a.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	a.MuxPlaybackID = playback
	a.DurationS = dur
	return a, nil
}

func (s *PGStore) ListForStudent(ctx context.Context, studentID uuid.UUID, privateToo bool) ([]Asset, error) {
	q := `
		SELECT id::text, type::text, title, mux_playback_id, duration_s, privacy::text, created_at
		FROM assets WHERE student_id = $1
	`
	if !privateToo {
		q += ` AND privacy = 'public'`
	}
	q += ` ORDER BY created_at DESC`
	rows, err := s.pool.Query(ctx, q, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Asset
	for rows.Next() {
		var a Asset
		var playback *string
		var dur *int32
		if err := rows.Scan(&a.ID, &a.Type, &a.Title, &playback, &dur, &a.Privacy, &a.CreatedAt); err != nil {
			return nil, err
		}
		a.MuxPlaybackID = playback
		a.DurationS = dur
		out = append(out, a)
	}
	return out, rows.Err()
}

func (s *PGStore) LoadStudent(ctx context.Context, id uuid.UUID) (*StudentSummary, error) {
	const q = `SELECT id::text, name, role::text, locale FROM users WHERE id = $1`
	out := &StudentSummary{}
	var name *string
	err := s.pool.QueryRow(ctx, q, id).Scan(&out.ID, &name, &out.Role, &out.Locale)
	if err != nil {
		return nil, err
	}
	out.Name = name
	return out, nil
}

func (s *PGStore) InsertRubric(ctx context.Context, assetID uuid.UUID, rubric map[string]int, instructorID uuid.UUID) error {
	const q = `INSERT INTO rubric_scores (asset_id, dimension, score, instructor_id) VALUES ($1, $2, $3, $4)`
	for dim, score := range rubric {
		if _, err := s.pool.Exec(ctx, q, assetID, dim, score, instructorID); err != nil {
			return err
		}
	}
	return nil
}

func (s *PGStore) InsertAudit(ctx context.Context, actorID *uuid.UUID, action, target string, meta map[string]any) error {
	const q = `INSERT INTO audit_log (actor_id, action, target, meta) VALUES ($1, $2, $3, $4)`
	var metaJSON []byte
	if meta != nil {
		metaJSON, _ = json.Marshal(meta)
	}
	_, err := s.pool.Exec(ctx, q, actorID, action, target, metaJSON)
	return err
}
