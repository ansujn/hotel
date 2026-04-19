package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"regexp"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	bcryptCost        = 12
	minPasswordLength = 8
	resetTokenTTL     = time.Hour
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrWeakPassword       = errors.New("password must be at least 8 chars with a letter and a number")
	ErrNoPasswordSet      = errors.New("no password set for user; admin must (re)set one")
	ErrResetInvalid       = errors.New("reset token invalid or expired")
	ErrEmailRequired      = errors.New("email required")

	phoneRe = regexp.MustCompile(`^\+?\d{10,15}$`)
	emailRe = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)
)

// hashPassword bcrypts a plaintext password.
func hashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcryptCost)
	if err != nil {
		return "", fmt.Errorf("bcrypt: %w", err)
	}
	return string(b), nil
}

// verifyPassword compares a plaintext to a bcrypt hash in constant time
// (bcrypt.CompareHashAndPassword is itself constant-time).
func verifyPassword(hash, plain string) error {
	if hash == "" {
		return ErrNoPasswordSet
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)); err != nil {
		return ErrInvalidCredentials
	}
	return nil
}

// validatePasswordStrength enforces min length + at least one letter and one digit.
func validatePasswordStrength(p string) error {
	if len(p) < minPasswordLength {
		return ErrWeakPassword
	}
	var hasLetter, hasDigit bool
	for _, r := range p {
		switch {
		case r >= '0' && r <= '9':
			hasDigit = true
		case (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z'):
			hasLetter = true
		}
	}
	if !hasLetter || !hasDigit {
		return ErrWeakPassword
	}
	return nil
}

// GenerateDefaultPassword returns a human-dictatable password like "Vik-2847".
// Prefix defaults to a capitalized short form; digits are 4 random decimals.
func GenerateDefaultPassword(prefix string) string {
	p := strings.TrimSpace(prefix)
	if p == "" {
		p = "Vik"
	}
	// Take first word, capitalize, keep letters only, cap at 6 chars.
	word := strings.Fields(p)[0]
	var b strings.Builder
	for _, r := range word {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') {
			b.WriteRune(r)
		}
		if b.Len() >= 6 {
			break
		}
	}
	clean := b.String()
	if clean == "" {
		clean = "Vik"
	}
	clean = strings.ToUpper(clean[:1]) + strings.ToLower(clean[1:])

	// 4 digits, avoid leading zero so it reads cleanly over phone.
	digits := randomDigits(4)
	return fmt.Sprintf("%s-%s", clean, digits)
}

func randomDigits(n int) string {
	out := make([]byte, n)
	for i := 0; i < n; i++ {
		// 1..9 for the first digit, 0..9 thereafter.
		max := int64(10)
		offset := int64(0)
		if i == 0 {
			max = 9
			offset = 1
		}
		x, err := rand.Int(rand.Reader, big.NewInt(max))
		if err != nil {
			// crypto/rand failure is unrecoverable; fall back to time-based jitter.
			out[i] = byte('0' + ((time.Now().UnixNano() + int64(i)) % 10))
			continue
		}
		out[i] = byte('0' + (x.Int64() + offset))
	}
	return string(out)
}

// normalizeIdentifier classifies a login identifier as email or phone and
// returns a canonical form for lookup.
type identifierKind int

const (
	identUnknown identifierKind = iota
	identEmail
	identPhone
)

func normalizeIdentifier(raw string) (string, identifierKind) {
	s := strings.TrimSpace(raw)
	if s == "" {
		return "", identUnknown
	}
	if emailRe.MatchString(s) {
		return strings.ToLower(s), identEmail
	}
	// Phone: allow optional leading +, and bare 10-digit (assume +91 India).
	digits := strings.TrimPrefix(s, "+")
	if phoneRe.MatchString(s) || phoneRe.MatchString("+"+digits) {
		if !strings.HasPrefix(s, "+") {
			if len(digits) == 10 {
				s = "+91" + digits
			} else {
				s = "+" + digits
			}
		}
		return s, identPhone
	}
	return s, identUnknown
}

// --- Password login ---

type LoginResult struct {
	AccessToken         string `json:"access_token"`
	RefreshToken        string `json:"refresh_token"`
	MustChangePassword  bool   `json:"must_change_password"`
	Role                string `json:"role"`
}

// LoginWithPassword looks up the user by email or phone and verifies the password.
// Returns ErrInvalidCredentials for ANY lookup/verify failure to avoid user enumeration.
func (s *Service) LoginWithPassword(ctx context.Context, identifier, password string) (*LoginResult, error) {
	norm, kind := normalizeIdentifier(identifier)
	if kind == identUnknown || password == "" {
		return nil, ErrInvalidCredentials
	}

	var (
		id, role, phone string
		email           *string
		hash            *string
		mustChange      bool
	)
	var q string
	switch kind {
	case identEmail:
		q = `SELECT id::text, role::text, phone, email, password_hash, must_change_password
		     FROM users WHERE LOWER(email) = $1`
	case identPhone:
		q = `SELECT id::text, role::text, phone, email, password_hash, must_change_password
		     FROM users WHERE phone = $1`
	}

	err := s.pool.QueryRow(ctx, q, norm).Scan(&id, &role, &phone, &email, &hash, &mustChange)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Still burn a bcrypt cycle to level timing across hit/miss.
			_ = bcrypt.CompareHashAndPassword([]byte("$2a$12$dummydummydummydummydummydummydummydummydummydummydum"), []byte(password))
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("lookup user: %w", err)
	}

	storedHash := ""
	if hash != nil {
		storedHash = *hash
	}
	if err := verifyPassword(storedHash, password); err != nil {
		return nil, ErrInvalidCredentials
	}

	access, err := s.issuer.IssueAccess(id, role, phone)
	if err != nil {
		return nil, fmt.Errorf("issue access: %w", err)
	}
	refresh, err := s.issuer.IssueRefresh(id, role, phone)
	if err != nil {
		return nil, fmt.Errorf("issue refresh: %w", err)
	}
	return &LoginResult{
		AccessToken:        access,
		RefreshToken:       refresh,
		MustChangePassword: mustChange,
		Role:               role,
	}, nil
}

// ChangePassword verifies the current password and sets a new one.
// Clears the must_change_password flag.
func (s *Service) ChangePassword(ctx context.Context, userID, current, next string) error {
	if err := validatePasswordStrength(next); err != nil {
		return err
	}
	var hash *string
	err := s.pool.QueryRow(ctx,
		`SELECT password_hash FROM users WHERE id = $1::uuid`, userID,
	).Scan(&hash)
	if err != nil {
		return fmt.Errorf("load user: %w", err)
	}
	stored := ""
	if hash != nil {
		stored = *hash
	}
	if err := verifyPassword(stored, current); err != nil {
		return ErrInvalidCredentials
	}
	// Block "same as before".
	if subtle.ConstantTimeCompare([]byte(current), []byte(next)) == 1 {
		return ErrWeakPassword
	}
	newHash, err := hashPassword(next)
	if err != nil {
		return err
	}
	_, err = s.pool.Exec(ctx, `
		UPDATE users
		SET password_hash = $2,
		    must_change_password = FALSE,
		    password_changed_at = NOW()
		WHERE id = $1::uuid`, userID, newHash)
	if err != nil {
		return fmt.Errorf("update password: %w", err)
	}
	return nil
}

// --- Password reset ---

// RequestPasswordReset generates a reset token and delivers it via email.
// Returns nil even if the email is unknown — to prevent user enumeration.
// The returned string is non-empty only when a token was actually created
// (useful for dev/logging; callers in prod should ignore it).
func (s *Service) RequestPasswordReset(ctx context.Context, rawEmail string) (string, error) {
	norm, kind := normalizeIdentifier(rawEmail)
	if kind != identEmail {
		return "", nil // pretend success; no leakage
	}
	var userID, name string
	var email *string
	err := s.pool.QueryRow(ctx, `
		SELECT id::text, COALESCE(name, ''), email
		FROM users WHERE LOWER(email) = $1`, norm,
	).Scan(&userID, &name, &email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", fmt.Errorf("lookup user: %w", err)
	}

	// Invalidate any outstanding tokens for this user.
	if _, err := s.pool.Exec(ctx,
		`UPDATE password_resets SET used_at = NOW()
		 WHERE user_id = $1::uuid AND used_at IS NULL`, userID,
	); err != nil {
		return "", fmt.Errorf("invalidate prior tokens: %w", err)
	}

	tok, hash, err := newResetToken()
	if err != nil {
		return "", err
	}
	expires := time.Now().Add(resetTokenTTL)

	if _, err := s.pool.Exec(ctx, `
		INSERT INTO password_resets (user_id, token_hash, expires_at)
		VALUES ($1::uuid, $2, $3)`, userID, hash, expires,
	); err != nil {
		return "", fmt.Errorf("insert reset: %w", err)
	}

	resetURL := fmt.Sprintf("%s/reset-password?token=%s", strings.TrimRight(s.cfg.AppBaseURL, "/"), tok)
	if s.mailer != nil && email != nil {
		if err := s.mailer.SendPasswordReset(ctx, *email, name, resetURL); err != nil {
			// Log only — do not reveal delivery failures to the caller.
			fmt.Printf("[auth] password reset email send failed for %s: %v\n", *email, err)
		}
	} else {
		// Dev mode: print the link so we can manually test.
		fmt.Printf("[auth] DEV password reset link (user=%s): %s\n", userID, resetURL)
	}
	return tok, nil
}

// ConfirmPasswordReset validates the token, updates the password, and marks the token used.
// Also clears must_change_password.
func (s *Service) ConfirmPasswordReset(ctx context.Context, rawToken, newPassword string) error {
	if err := validatePasswordStrength(newPassword); err != nil {
		return err
	}
	if rawToken == "" {
		return ErrResetInvalid
	}
	hash := hashResetToken(rawToken)

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("tx begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var resetID, userID string
	var expiresAt time.Time
	var usedAt *time.Time
	err = tx.QueryRow(ctx, `
		SELECT id::text, user_id::text, expires_at, used_at
		FROM password_resets
		WHERE token_hash = $1`, hash,
	).Scan(&resetID, &userID, &expiresAt, &usedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrResetInvalid
		}
		return fmt.Errorf("lookup reset: %w", err)
	}
	if usedAt != nil || time.Now().After(expiresAt) {
		return ErrResetInvalid
	}

	newHash, err := hashPassword(newPassword)
	if err != nil {
		return err
	}

	if _, err := tx.Exec(ctx,
		`UPDATE users
		 SET password_hash = $2, must_change_password = FALSE, password_changed_at = NOW()
		 WHERE id = $1::uuid`, userID, newHash,
	); err != nil {
		return fmt.Errorf("update password: %w", err)
	}
	if _, err := tx.Exec(ctx,
		`UPDATE password_resets SET used_at = NOW() WHERE id = $1::uuid`, resetID,
	); err != nil {
		return fmt.Errorf("mark used: %w", err)
	}
	return tx.Commit(ctx)
}

// newResetToken returns (rawTokenBase64URL, sha256HexHash, err).
// We store only the hash; the raw token only lives in the email + URL.
func newResetToken() (string, string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", "", fmt.Errorf("rand: %w", err)
	}
	raw := base64.RawURLEncoding.EncodeToString(buf)
	return raw, hashResetToken(raw), nil
}

func hashResetToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}
