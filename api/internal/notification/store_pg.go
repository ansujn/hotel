package notification

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Store is the persistence interface for notifications.
type Store interface {
	List(ctx context.Context, userID uuid.UUID) ([]Notification, error)
	UnreadCount(ctx context.Context, userID uuid.UUID) (int, error)
	MarkRead(ctx context.Context, id, userID uuid.UUID) error
	MarkAllRead(ctx context.Context, userID uuid.UUID) error
	Create(ctx context.Context, n Notification) error
}

// PGStore is a pgx-backed Store.
type PGStore struct {
	pool *pgxpool.Pool
}

// NewPGStore returns a Postgres-backed Store.
func NewPGStore(pool *pgxpool.Pool) *PGStore {
	return &PGStore{pool: pool}
}

func (s *PGStore) List(ctx context.Context, userID uuid.UUID) ([]Notification, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, user_id, kind::text, title, COALESCE(body,''), meta, read_at, created_at
		 FROM notifications
		 WHERE user_id = $1
		 ORDER BY created_at DESC
		 LIMIT 100`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Kind, &n.Title, &n.Body, &n.Meta, &n.ReadAt, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}

func (s *PGStore) UnreadCount(ctx context.Context, userID uuid.UUID) (int, error) {
	var n int
	err := s.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
		userID,
	).Scan(&n)
	return n, err
}

func (s *PGStore) MarkRead(ctx context.Context, id, userID uuid.UUID) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE notifications SET read_at = NOW()
		 WHERE id = $1 AND user_id = $2 AND read_at IS NULL`,
		id, userID,
	)
	return err
}

func (s *PGStore) MarkAllRead(ctx context.Context, userID uuid.UUID) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE notifications SET read_at = NOW()
		 WHERE user_id = $1 AND read_at IS NULL`,
		userID,
	)
	return err
}

func (s *PGStore) Create(ctx context.Context, n Notification) error {
	meta := n.Meta
	if len(meta) == 0 {
		meta = []byte("{}")
	}
	_, err := s.pool.Exec(ctx,
		`INSERT INTO notifications (id, user_id, kind, title, body, meta, created_at)
		 VALUES ($1, $2, $3, $4, NULLIF($5,''), $6, NOW())`,
		n.ID, n.UserID, n.Kind, n.Title, n.Body, meta,
	)
	return err
}
