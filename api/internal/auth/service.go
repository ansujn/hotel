package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/viktheatre/api/internal/platform/config"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// User is the DTO returned by /me.
type User struct {
	ID                 string  `json:"id"`
	Phone              string  `json:"phone"`
	Role               string  `json:"role"`
	Name               *string `json:"name,omitempty"`
	Email              *string `json:"email,omitempty"`
	Locale             string  `json:"locale"`
	MustChangePassword bool    `json:"must_change_password"`
}

// Mailer delivers transactional emails. Injected so tests and local dev can
// use a no-op implementation while prod uses Brevo.
type Mailer interface {
	SendPasswordReset(ctx context.Context, toEmail, toName, resetURL string) error
	SendWelcome(ctx context.Context, toEmail, toName, loginURL, defaultPassword string) error
}

// Service holds auth dependencies and exposes auth use-cases.
type Service struct {
	pool   *pgxpool.Pool
	cfg    *config.Config
	mailer Mailer
	issuer *TokenIssuer
}

func New(pool *pgxpool.Pool, cfg *config.Config, mailer Mailer) *Service {
	return &Service{
		pool:   pool,
		cfg:    cfg,
		mailer: mailer,
		issuer: NewTokenIssuer(cfg.JWTSecret),
	}
}

// Issuer exposes the token issuer for refresh flows and signed links.
func (s *Service) Issuer() *TokenIssuer { return s.issuer }

// LoadUser fetches the user row for /me.
func (s *Service) LoadUser(ctx context.Context, userID string) (*User, error) {
	const q = `
		SELECT id::text, phone, role::text, name, email, locale, must_change_password
		FROM users WHERE id = $1::uuid
	`
	u := &User{}
	err := s.pool.QueryRow(ctx, q, userID).Scan(
		&u.ID, &u.Phone, &u.Role, &u.Name, &u.Email, &u.Locale, &u.MustChangePassword,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, fmt.Errorf("load user: %w", err)
	}
	return u, nil
}

// --- Admin user creation ---

type CreateUserInput struct {
	Name  string
	Email string
	Phone string
	Role  string // student | parent | instructor | admin
}

type CreateUserResult struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Email           string `json:"email"`
	Phone           string `json:"phone"`
	Role            string `json:"role"`
	DefaultPassword string `json:"default_password"`
}

var validRoles = map[string]struct{}{
	"student":    {},
	"parent":     {},
	"instructor": {},
	"admin":      {},
}

// CreateUserWithDefaultPassword is called from the admin dashboard.
// Generates a human-readable default password, bcrypts it, and returns the
// plaintext ONCE so the admin can share it with the user.
func (s *Service) CreateUserWithDefaultPassword(ctx context.Context, in CreateUserInput) (*CreateUserResult, error) {
	name := strings.TrimSpace(in.Name)
	email, emailKind := normalizeIdentifier(in.Email)
	phone, phoneKind := normalizeIdentifier(in.Phone)
	role := strings.ToLower(strings.TrimSpace(in.Role))

	if name == "" {
		return nil, errors.New("name required")
	}
	if emailKind != identEmail {
		return nil, errors.New("valid email required")
	}
	if phoneKind != identPhone {
		return nil, errors.New("valid phone required")
	}
	if _, ok := validRoles[role]; !ok {
		return nil, fmt.Errorf("invalid role %q", role)
	}

	defaultPwd := GenerateDefaultPassword(name)
	hash, err := hashPassword(defaultPwd)
	if err != nil {
		return nil, err
	}

	const q = `
		INSERT INTO users (name, email, phone, role, password_hash, must_change_password)
		VALUES ($1, $2, $3, $4::user_role, $5, TRUE)
		RETURNING id::text
	`
	var id string
	if err := s.pool.QueryRow(ctx, q, name, email, phone, role, hash).Scan(&id); err != nil {
		return nil, fmt.Errorf("insert user: %w", err)
	}

	// Best-effort welcome email. Do not fail the whole request on mailer issues.
	if s.mailer != nil {
		loginURL := strings.TrimRight(s.cfg.AppBaseURL, "/") + "/login"
		if err := s.mailer.SendWelcome(ctx, email, name, loginURL, defaultPwd); err != nil {
			fmt.Printf("[auth] welcome email failed for %s: %v\n", email, err)
		}
	}

	return &CreateUserResult{
		ID:              id,
		Name:            name,
		Email:           email,
		Phone:           phone,
		Role:            role,
		DefaultPassword: defaultPwd,
	}, nil
}
