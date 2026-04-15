package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	AccessTokenTTL  = time.Hour
	RefreshTokenTTL = 30 * 24 * time.Hour
)

// Claims is the JWT payload for access & refresh tokens.
type Claims struct {
	UserID string `json:"sub"`
	Role   string `json:"role"`
	Phone  string `json:"phone"`
	Kind   string `json:"kind"` // "access" | "refresh"
	jwt.RegisteredClaims
}

// TokenIssuer issues and verifies HS256 tokens.
type TokenIssuer struct {
	secret []byte
	now    func() time.Time
}

func NewTokenIssuer(secret string) *TokenIssuer {
	return &TokenIssuer{secret: []byte(secret), now: time.Now}
}

func (t *TokenIssuer) issue(userID, role, phone, kind string, ttl time.Duration) (string, error) {
	now := t.now()
	claims := Claims{
		UserID: userID,
		Role:   role,
		Phone:  phone,
		Kind:   kind,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			NotBefore: jwt.NewNumericDate(now),
			Subject:   userID,
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := tok.SignedString(t.secret)
	if err != nil {
		return "", fmt.Errorf("sign token: %w", err)
	}
	return s, nil
}

func (t *TokenIssuer) IssueAccess(userID, role, phone string) (string, error) {
	return t.issue(userID, role, phone, "access", AccessTokenTTL)
}

func (t *TokenIssuer) IssueRefresh(userID, role, phone string) (string, error) {
	return t.issue(userID, role, phone, "refresh", RefreshTokenTTL)
}

// Verify parses and validates a token. Returns the claims if valid.
func (t *TokenIssuer) Verify(tokenStr string) (*Claims, error) {
	parser := jwt.NewParser(jwt.WithValidMethods([]string{"HS256"}))
	claims := &Claims{}
	_, err := parser.ParseWithClaims(tokenStr, claims, func(tok *jwt.Token) (any, error) {
		return t.secret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("verify token: %w", err)
	}
	return claims, nil
}
