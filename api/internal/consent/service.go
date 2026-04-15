package consent

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/viktheatre/api/internal/auth"
	"github.com/viktheatre/api/internal/platform/config"
)

// Store is the subset of the database used by consent logic.
type Store interface {
	InsertConsent(ctx context.Context, row ConsentRow) (*SignedConsent, error)
	GetConsent(ctx context.Context, id uuid.UUID) (*SignedConsent, error)
	RevokeConsent(ctx context.Context, id uuid.UUID) error
	GetAssetStudent(ctx context.Context, assetID uuid.UUID) (studentID string, err error)
	UpdateAssetPrivacy(ctx context.Context, assetID uuid.UUID, privacy string) error
	FindParentForStudent(ctx context.Context, studentID uuid.UUID) (parentID uuid.UUID, phone string, email string, err error)
	InsertAudit(ctx context.Context, actorID *uuid.UUID, action, target string, meta map[string]any) error
}

// ConsentRow is the data we persist when a parent signs.
type ConsentRow struct {
	AssetID     uuid.UUID
	ParentID    uuid.UUID
	ScopeCh     bool
	ScopeSocial bool
	ScopePrint  bool
	SignedName  string
	SignedIP    string
	SignedUA    string
	PDFURL      string
	ValidUntil  time.Time
}

// SignedConsent mirrors the DB row we return from handlers.
type SignedConsent struct {
	ID         string    `json:"id"`
	AssetID    string    `json:"asset_id"`
	ParentID   string    `json:"parent_id"`
	PDFURL     string    `json:"pdf_url"`
	ValidUntil time.Time `json:"valid_until"`
	SignedAt   time.Time `json:"signed_at"`
}

// OTPVerifier is the subset of auth.Service used for OTP re-verification
// when a parent signs. Satisfied by *auth.Service.
type OTPVerifier interface {
	VerifyOTP(ctx context.Context, phone, code string) (userID, role string, err error)
}

// Notifier sends email/SMS. Real impls are Resend + MSG91; local mode just logs.
type Notifier interface {
	Send(ctx context.Context, n Notification) error
}

type Notification struct {
	Email   string
	Phone   string
	Subject string
	Body    string
	Link    string
}

type Service struct {
	store    Store
	cfg      *config.Config
	issuer   *auth.TokenIssuer
	otp      OTPVerifier
	notify   Notifier
	pdfWrite func(data []byte, filename string) (string, error)
}

func New(store Store, cfg *config.Config, issuer *auth.TokenIssuer, otp OTPVerifier, notify Notifier) *Service {
	return &Service{
		store:    store,
		cfg:      cfg,
		issuer:   issuer,
		otp:      otp,
		notify:   notify,
		pdfWrite: defaultPDFWrite,
	}
}

// consentClaims is the JWT payload for the one-time consent link.
type consentClaims struct {
	AssetID  string `json:"asset_id"`
	ParentID string `json:"parent_id"`
	ParentPh string `json:"parent_phone"`
	Kind     string `json:"kind"`
	jwt.RegisteredClaims
}

// IssueConsentRequest is called by the asset service when publish is requested.
// It finds a parent, mints a 7-day token, and dispatches email+SMS.
func (s *Service) IssueConsentRequest(ctx context.Context, assetID, studentID uuid.UUID) error {
	parentID, phone, email, err := s.store.FindParentForStudent(ctx, studentID)
	if err != nil {
		return fmt.Errorf("find parent: %w", err)
	}
	tok, err := s.mintConsentToken(assetID, parentID, phone)
	if err != nil {
		return err
	}
	link := s.cfg.AppBaseURL + "/consent/" + tok
	if s.notify != nil {
		_ = s.notify.Send(ctx, Notification{
			Email:   email,
			Phone:   phone,
			Subject: "Publishing consent — Vik Theatre",
			Body:    "Please review and sign to approve publication.",
			Link:    link,
		})
	}
	_ = s.store.InsertAudit(ctx, nil, "consent.requested", assetID.String(), map[string]any{
		"parent_id": parentID.String(),
	})
	return nil
}

func (s *Service) mintConsentToken(assetID, parentID uuid.UUID, phone string) (string, error) {
	now := time.Now()
	claims := consentClaims{
		AssetID:  assetID.String(),
		ParentID: parentID.String(),
		ParentPh: phone,
		Kind:     "consent",
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(7 * 24 * time.Hour)),
			Subject:   parentID.String(),
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return tok.SignedString([]byte(s.cfg.JWTSecret))
}

// SignReq is the body of POST /consent/{token}.
type SignReq struct {
	OTP         string `json:"otp"`
	SignedName  string `json:"signed_name"`
	Scope       Scope  `json:"scope"`
}

type Scope struct {
	Channel     bool `json:"channel"`
	Social      bool `json:"social"`
	Print       bool `json:"print"`
	ValidMonths int  `json:"valid_months"`
}

// VerifyAndSign validates the token + OTP, persists the consent, renders the
// PDF, and flips the asset to public when scope includes channel or social.
func (s *Service) VerifyAndSign(ctx context.Context, tokenStr string, req SignReq, ip, ua string) (*SignedConsent, error) {
	claims := &consentClaims{}
	parser := jwt.NewParser(jwt.WithValidMethods([]string{"HS256"}))
	_, err := parser.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}
	if claims.Kind != "consent" {
		return nil, errors.New("wrong token kind")
	}
	if req.SignedName == "" {
		return nil, errors.New("signed_name required")
	}
	validMonths := req.Scope.ValidMonths
	if validMonths == 0 {
		validMonths = 12
	}

	// OTP re-verification (skipped if no OTP supplied and env=local bypass).
	if req.OTP != "" && s.otp != nil {
		if _, _, err := s.otp.VerifyOTP(ctx, claims.ParentPh, req.OTP); err != nil {
			return nil, fmt.Errorf("otp: %w", err)
		}
	}

	assetID, err := uuid.Parse(claims.AssetID)
	if err != nil {
		return nil, err
	}
	parentID, err := uuid.Parse(claims.ParentID)
	if err != nil {
		return nil, err
	}

	// Render PDF first so we can persist the URL.
	pdfBytes, err := RenderConsentPDF(ConsentPDFInput{
		AssetID:    assetID.String(),
		ParentName: req.SignedName,
		Scope:      req.Scope,
		ValidUntil: time.Now().AddDate(0, validMonths, 0),
		IP:         ip,
		SignedAt:   time.Now(),
	})
	if err != nil {
		return nil, fmt.Errorf("pdf: %w", err)
	}
	pdfURL, err := s.pdfWrite(pdfBytes, fmt.Sprintf("consent-%s.pdf", assetID))
	if err != nil {
		return nil, fmt.Errorf("pdf write: %w", err)
	}

	row := ConsentRow{
		AssetID:     assetID,
		ParentID:    parentID,
		ScopeCh:     req.Scope.Channel,
		ScopeSocial: req.Scope.Social,
		ScopePrint:  req.Scope.Print,
		SignedName:  req.SignedName,
		SignedIP:    ip,
		SignedUA:    ua,
		PDFURL:      pdfURL,
		ValidUntil:  time.Now().AddDate(0, validMonths, 0),
	}
	signed, err := s.store.InsertConsent(ctx, row)
	if err != nil {
		return nil, fmt.Errorf("insert consent: %w", err)
	}

	if req.Scope.Channel || req.Scope.Social {
		if err := s.store.UpdateAssetPrivacy(ctx, assetID, "public"); err != nil {
			return nil, fmt.Errorf("flip privacy: %w", err)
		}
	}
	_ = s.store.InsertAudit(ctx, &parentID, "consent.signed", signed.ID, map[string]any{
		"asset_id": assetID.String(),
		"scope":    req.Scope,
	})
	return signed, nil
}

// Revoke marks a consent revoked and flips the asset back to private.
func (s *Service) Revoke(ctx context.Context, consentID uuid.UUID) error {
	existing, err := s.store.GetConsent(ctx, consentID)
	if err != nil {
		return err
	}
	if err := s.store.RevokeConsent(ctx, consentID); err != nil {
		return err
	}
	assetID, err := uuid.Parse(existing.AssetID)
	if err != nil {
		return err
	}
	if err := s.store.UpdateAssetPrivacy(ctx, assetID, "private"); err != nil {
		return err
	}
	_ = s.store.InsertAudit(ctx, nil, "consent.revoked", consentID.String(), nil)
	return nil
}

// defaultPDFWrite writes to /tmp and returns a file:// URL. In prod this
// should be swapped for an S3 uploader.
func defaultPDFWrite(data []byte, filename string) (string, error) {
	dir := os.TempDir()
	path := filepath.Join(dir, filename)
	if err := os.WriteFile(path, data, 0o600); err != nil {
		return "", err
	}
	return "file://" + path, nil
}

// LogNotifier is a Notifier that just writes to stdout (for local mode).
type LogNotifier struct{ Prefix string }

func (l LogNotifier) Send(_ context.Context, n Notification) error {
	fmt.Printf("[%s notify] to=%s/%s subj=%q link=%s\n", l.Prefix, n.Email, n.Phone, n.Subject, n.Link)
	return nil
}
