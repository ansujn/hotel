package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/viktheatre/api/internal/platform/config"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// User is the DTO returned by /me.
type User struct {
	ID     string  `json:"id"`
	Phone  string  `json:"phone"`
	Role   string  `json:"role"`
	Name   *string `json:"name,omitempty"`
	Email  *string `json:"email,omitempty"`
	Locale string  `json:"locale"`
}

// Service holds auth dependencies and exposes auth use-cases.
type Service struct {
	pool   *pgxpool.Pool
	cfg    *config.Config
	msg91  MSG91Client
	issuer *TokenIssuer
}

func New(pool *pgxpool.Pool, cfg *config.Config, msg91 MSG91Client) *Service {
	return &Service{
		pool:   pool,
		cfg:    cfg,
		msg91:  msg91,
		issuer: NewTokenIssuer(cfg.JWTSecret),
	}
}

// Issuer exposes the token issuer for refresh flows.
func (s *Service) Issuer() *TokenIssuer { return s.issuer }

// SendOTP dispatches an OTP. In local mode it's a no-op.
func (s *Service) SendOTP(ctx context.Context, phone string) error {
	if phone == "" {
		return errors.New("phone required")
	}
	if s.cfg.AppEnv == "local" {
		return nil
	}
	if s.msg91 == nil {
		return errors.New("msg91 client not configured")
	}
	return s.msg91.SendOTP(ctx, phone)
}

// VerifyOTP validates the code, upserts the user, and returns id + role.
func (s *Service) VerifyOTP(ctx context.Context, phone, code string) (userID, role string, err error) {
	if phone == "" || code == "" {
		return "", "", errors.New("phone and code required")
	}

	if s.cfg.AppEnv == "local" {
		if code != DevBypassCode {
			return "", "", ErrInvalidOTP
		}
	} else {
		if s.msg91 == nil {
			return "", "", errors.New("msg91 client not configured")
		}
		if err := s.msg91.VerifyOTP(ctx, phone, code); err != nil {
			return "", "", err
		}
	}

	return s.upsertUser(ctx, phone)
}

// upsertUser inserts a new student if phone is unknown, else returns existing.
func (s *Service) upsertUser(ctx context.Context, phone string) (string, string, error) {
	const q = `
		INSERT INTO users (phone, role)
		VALUES ($1, 'student')
		ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
		RETURNING id::text, role::text
	`
	var id, role string
	err := s.pool.QueryRow(ctx, q, phone).Scan(&id, &role)
	if err != nil {
		return "", "", fmt.Errorf("upsert user: %w", err)
	}
	return id, role, nil
}

// LoadUser fetches the user row for /me.
func (s *Service) LoadUser(ctx context.Context, userID string) (*User, error) {
	const q = `
		SELECT id::text, phone, role::text, name, email, locale
		FROM users WHERE id = $1::uuid
	`
	u := &User{}
	err := s.pool.QueryRow(ctx, q, userID).Scan(&u.ID, &u.Phone, &u.Role, &u.Name, &u.Email, &u.Locale)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, fmt.Errorf("load user: %w", err)
	}
	return u, nil
}
