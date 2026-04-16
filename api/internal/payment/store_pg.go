package payment

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Store defines the persistence interface for payments.
type Store interface {
	InsertPayment(ctx context.Context, p Payment) error
	UpdateStatus(ctx context.Context, razorpayOrderID, status string) error
	ListByUser(ctx context.Context, userID uuid.UUID) ([]Payment, error)
	GetPendingDue(ctx context.Context, userID uuid.UUID) (*PendingDue, error)
	AuditInsert(ctx context.Context, actorID uuid.UUID, action, target string, meta map[string]any) error
}

// PGStore implements Store using pgx.
type PGStore struct {
	pool *pgxpool.Pool
}

// NewPGStore returns a postgres-backed Store.
func NewPGStore(pool *pgxpool.Pool) *PGStore {
	return &PGStore{pool: pool}
}

func (s *PGStore) InsertPayment(ctx context.Context, p Payment) error {
	_, err := s.pool.Exec(ctx,
		`INSERT INTO payments (id, user_id, razorpay_order_id, amount_paise, status, period, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		p.ID, p.UserID, p.RazorpayOrderID, p.AmountPaise, p.Status, p.Period, p.CreatedAt,
	)
	return err
}

func (s *PGStore) UpdateStatus(ctx context.Context, razorpayOrderID, status string) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE payments SET status = $1 WHERE razorpay_order_id = $2`,
		status, razorpayOrderID,
	)
	return err
}

func (s *PGStore) ListByUser(ctx context.Context, userID uuid.UUID) ([]Payment, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, user_id, razorpay_order_id, amount_paise, status, period, created_at
		 FROM payments WHERE user_id = $1 ORDER BY created_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Payment
	for rows.Next() {
		var p Payment
		if err := rows.Scan(&p.ID, &p.UserID, &p.RazorpayOrderID, &p.AmountPaise, &p.Status, &p.Period, &p.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (s *PGStore) GetPendingDue(ctx context.Context, userID uuid.UUID) (*PendingDue, error) {
	// Look for the most recent created (unpaid) payment for this user.
	var period string
	var amount int64
	err := s.pool.QueryRow(ctx,
		`SELECT period, amount_paise FROM payments
		 WHERE user_id = $1 AND status = 'created'
		 ORDER BY created_at DESC LIMIT 1`, userID,
	).Scan(&period, &amount)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &PendingDue{Period: period, AmountPaise: amount}, nil
}

func (s *PGStore) AuditInsert(ctx context.Context, actorID uuid.UUID, action, target string, meta map[string]any) error {
	metaJSON, _ := time.Now().MarshalJSON() // placeholder
	_ = metaJSON
	_, err := s.pool.Exec(ctx,
		`INSERT INTO audit_log (actor_id, action, target, meta) VALUES ($1, $2, $3, $4)`,
		actorID, action, target, nil,
	)
	return err
}
