package consent

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PGStore is the pgx-backed consent store.
type PGStore struct{ pool *pgxpool.Pool }

func NewPGStore(pool *pgxpool.Pool) *PGStore { return &PGStore{pool: pool} }

func (s *PGStore) InsertConsent(ctx context.Context, row ConsentRow) (*SignedConsent, error) {
	const q = `
		INSERT INTO consents (
			asset_id, parent_id, scope_channel, scope_social, scope_print,
			signed_name, signed_ip, signed_ua, pdf_url, valid_until
		) VALUES ($1,$2,$3,$4,$5,$6,$7::inet,$8,$9,$10)
		RETURNING id::text, asset_id::text, parent_id::text, pdf_url, valid_until, signed_at
	`
	var ip any
	if row.SignedIP != "" {
		ip = row.SignedIP
	}
	out := &SignedConsent{}
	var pdfURL *string
	err := s.pool.QueryRow(ctx, q,
		row.AssetID, row.ParentID, row.ScopeCh, row.ScopeSocial, row.ScopePrint,
		row.SignedName, ip, row.SignedUA, row.PDFURL, row.ValidUntil,
	).Scan(&out.ID, &out.AssetID, &out.ParentID, &pdfURL, &out.ValidUntil, &out.SignedAt)
	if err != nil {
		return nil, err
	}
	if pdfURL != nil {
		out.PDFURL = *pdfURL
	}
	return out, nil
}

func (s *PGStore) GetConsent(ctx context.Context, id uuid.UUID) (*SignedConsent, error) {
	const q = `SELECT id::text, asset_id::text, parent_id::text, COALESCE(pdf_url,''), valid_until, signed_at FROM consents WHERE id = $1`
	out := &SignedConsent{}
	err := s.pool.QueryRow(ctx, q, id).Scan(&out.ID, &out.AssetID, &out.ParentID, &out.PDFURL, &out.ValidUntil, &out.SignedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("consent not found")
		}
		return nil, err
	}
	return out, nil
}

func (s *PGStore) RevokeConsent(ctx context.Context, id uuid.UUID) error {
	_, err := s.pool.Exec(ctx, `UPDATE consents SET revoked_at = NOW() WHERE id = $1`, id)
	return err
}

func (s *PGStore) GetAssetStudent(ctx context.Context, assetID uuid.UUID) (string, error) {
	var sid string
	err := s.pool.QueryRow(ctx, `SELECT student_id::text FROM assets WHERE id = $1`, assetID).Scan(&sid)
	return sid, err
}

func (s *PGStore) UpdateAssetPrivacy(ctx context.Context, assetID uuid.UUID, privacy string) error {
	_, err := s.pool.Exec(ctx, `UPDATE assets SET privacy = $2::asset_privacy WHERE id = $1`, assetID, privacy)
	return err
}

func (s *PGStore) FindParentForStudent(ctx context.Context, studentID uuid.UUID) (uuid.UUID, string, string, error) {
	const q = `
		SELECT u.id, u.phone, COALESCE(u.email, '')
		FROM parents_students ps
		JOIN users u ON u.id = ps.parent_id
		WHERE ps.student_id = $1
		LIMIT 1
	`
	var pid uuid.UUID
	var phone, email string
	err := s.pool.QueryRow(ctx, q, studentID).Scan(&pid, &phone, &email)
	if err != nil {
		return uuid.Nil, "", "", err
	}
	return pid, phone, email, nil
}

func (s *PGStore) InsertAudit(ctx context.Context, actorID *uuid.UUID, action, target string, meta map[string]any) error {
	var metaJSON []byte
	if meta != nil {
		metaJSON, _ = json.Marshal(meta)
	}
	_, err := s.pool.Exec(ctx,
		`INSERT INTO audit_log (actor_id, action, target, meta) VALUES ($1,$2,$3,$4)`,
		actorID, action, target, metaJSON)
	return err
}
