package social

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Store is the database interface for the social service.
type Store interface {
	ListConsentedAssets(ctx context.Context) ([]ConsentedAsset, error)
	InsertPost(ctx context.Context, req CreatePostReq) (*SocialPost, error)
	ListPosts(ctx context.Context, weekStart time.Time) ([]SocialPost, error)
	GetPost(ctx context.Context, id uuid.UUID) (*SocialPost, error)
	UpdatePostBuffer(ctx context.Context, id uuid.UUID, bufferID string, status string) error
}

// PGStore implements Store with pgx.
type PGStore struct {
	pool *pgxpool.Pool
}

func NewPGStore(pool *pgxpool.Pool) *PGStore {
	return &PGStore{pool: pool}
}

func (s *PGStore) ListConsentedAssets(ctx context.Context) ([]ConsentedAsset, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT a.id, a.title, u.name, a.mux_playback_id, a.duration_s
		FROM assets a
		JOIN consents c ON c.asset_id = a.id
		JOIN users u ON u.id = a.student_id
		WHERE a.privacy = 'public'
		  AND c.scope_social = true
		  AND c.revoked_at IS NULL
		  AND c.valid_until > NOW()
		ORDER BY a.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []ConsentedAsset
	for rows.Next() {
		var a ConsentedAsset
		var pbID *string
		if err := rows.Scan(&a.ID, &a.Title, &a.StudentName, &pbID, &a.DurationS); err != nil {
			return nil, err
		}
		a.MuxPlaybackID = pbID
		if pbID != nil {
			t := "https://image.mux.com/" + *pbID + "/thumbnail.jpg"
			a.Thumbnail = &t
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

func (s *PGStore) InsertPost(ctx context.Context, req CreatePostReq) (*SocialPost, error) {
	var p SocialPost
	err := s.pool.QueryRow(ctx, `
		INSERT INTO social_posts (asset_id, platforms, caption, scheduled_at, status)
		VALUES ($1, $2, $3, $4, 'queued')
		RETURNING id, asset_id, platforms, caption, scheduled_at::text, buffer_id, status, created_at
	`, req.AssetID, req.Platforms, req.Caption, req.ScheduledAt).Scan(
		&p.ID, &p.AssetID, &p.Platforms, &p.Caption, &p.ScheduledAt, &p.BufferID, &p.Status, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *PGStore) ListPosts(ctx context.Context, weekStart time.Time) ([]SocialPost, error) {
	weekEnd := weekStart.AddDate(0, 0, 7)
	rows, err := s.pool.Query(ctx, `
		SELECT sp.id, sp.asset_id, sp.platforms, sp.caption, sp.scheduled_at::text,
		       sp.buffer_id, sp.status, sp.created_at,
		       a.title, u.name
		FROM social_posts sp
		LEFT JOIN assets a ON a.id = sp.asset_id
		LEFT JOIN users u ON u.id = a.student_id
		WHERE sp.scheduled_at >= $1 AND sp.scheduled_at < $2
		ORDER BY sp.scheduled_at ASC
	`, weekStart, weekEnd)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []SocialPost
	for rows.Next() {
		var p SocialPost
		if err := rows.Scan(
			&p.ID, &p.AssetID, &p.Platforms, &p.Caption, &p.ScheduledAt,
			&p.BufferID, &p.Status, &p.CreatedAt,
			&p.AssetTitle, &p.StudentName,
		); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (s *PGStore) GetPost(ctx context.Context, id uuid.UUID) (*SocialPost, error) {
	var p SocialPost
	err := s.pool.QueryRow(ctx, `
		SELECT id, asset_id, platforms, caption, scheduled_at::text, buffer_id, status, created_at
		FROM social_posts WHERE id = $1
	`, id).Scan(&p.ID, &p.AssetID, &p.Platforms, &p.Caption, &p.ScheduledAt, &p.BufferID, &p.Status, &p.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (s *PGStore) UpdatePostBuffer(ctx context.Context, id uuid.UUID, bufferID string, status string) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE social_posts SET buffer_id = $2, status = $3 WHERE id = $1
	`, id, bufferID, status)
	return err
}
