package consent

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"

	"github.com/viktheatre/api/internal/auth"
	"github.com/viktheatre/api/internal/platform/config"
)

type fakeStore struct {
	consents map[string]*SignedConsent
	privacy  map[string]string
	audit    int
	parent   uuid.UUID
}

func newFakeStore(parent uuid.UUID) *fakeStore {
	return &fakeStore{
		consents: map[string]*SignedConsent{},
		privacy:  map[string]string{},
		parent:   parent,
	}
}

func (f *fakeStore) InsertConsent(_ context.Context, row ConsentRow) (*SignedConsent, error) {
	id := uuid.NewString()
	c := &SignedConsent{
		ID: id, AssetID: row.AssetID.String(), ParentID: row.ParentID.String(),
		PDFURL: row.PDFURL, ValidUntil: row.ValidUntil, SignedAt: time.Now(),
	}
	f.consents[id] = c
	return c, nil
}
func (f *fakeStore) GetConsent(_ context.Context, id uuid.UUID) (*SignedConsent, error) {
	c, ok := f.consents[id.String()]
	if !ok {
		return nil, nil
	}
	return c, nil
}
func (f *fakeStore) RevokeConsent(_ context.Context, id uuid.UUID) error {
	delete(f.consents, id.String())
	return nil
}
func (f *fakeStore) GetAssetStudent(_ context.Context, _ uuid.UUID) (string, error) {
	return uuid.NewString(), nil
}
func (f *fakeStore) UpdateAssetPrivacy(_ context.Context, assetID uuid.UUID, privacy string) error {
	f.privacy[assetID.String()] = privacy
	return nil
}
func (f *fakeStore) FindParentForStudent(_ context.Context, _ uuid.UUID) (uuid.UUID, string, string, error) {
	return f.parent, "+919999999999", "parent@example.com", nil
}
func (f *fakeStore) InsertAudit(_ context.Context, _ *uuid.UUID, _, _ string, _ map[string]any) error {
	f.audit++
	return nil
}

func newTestService(t *testing.T) (*Service, *fakeStore) {
	t.Helper()
	parent := uuid.New()
	store := newFakeStore(parent)
	cfg := &config.Config{AppEnv: "local", JWTSecret: "test-secret", AppBaseURL: "http://localhost:3000"}
	issuer := auth.NewTokenIssuer(cfg.JWTSecret)
	svc := New(store, cfg, issuer, nil, LogNotifier{Prefix: "test"})
	// Override pdf write to avoid touching disk across test sandboxes.
	svc.pdfWrite = func(_ []byte, filename string) (string, error) {
		return "memory://" + filename, nil
	}
	return svc, store
}

func TestConsent_RoundTripChannelFlipsPublic(t *testing.T) {
	svc, store := newTestService(t)
	assetID := uuid.New()
	studentID := uuid.New()

	ctx := context.Background()
	if err := svc.IssueConsentRequest(ctx, assetID, studentID); err != nil {
		t.Fatalf("issue: %v", err)
	}

	// Mint the token ourselves (same issuer) — IssueConsentRequest doesn't return it.
	tok, err := svc.mintConsentToken(assetID, store.parent, "+919999999999")
	if err != nil {
		t.Fatalf("mint: %v", err)
	}

	signed, err := svc.VerifyAndSign(ctx, tok, SignReq{
		SignedName: "Test Parent",
		Scope:      Scope{Channel: true, ValidMonths: 12},
	}, "127.0.0.1", "go-test")
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	if signed.ID == "" {
		t.Fatal("no id")
	}
	if store.privacy[assetID.String()] != "public" {
		t.Fatalf("asset not flipped public, got %q", store.privacy[assetID.String()])
	}

	// Revoke flips back to private.
	if err := svc.Revoke(ctx, uuid.MustParse(signed.ID)); err != nil {
		t.Fatalf("revoke: %v", err)
	}
	if store.privacy[assetID.String()] != "private" {
		t.Fatalf("asset not flipped private after revoke, got %q", store.privacy[assetID.String()])
	}
}

func TestConsent_PrintOnlyStaysPrivate(t *testing.T) {
	svc, store := newTestService(t)
	assetID := uuid.New()
	ctx := context.Background()
	tok, _ := svc.mintConsentToken(assetID, store.parent, "+919999999999")
	_, err := svc.VerifyAndSign(ctx, tok, SignReq{
		SignedName: "Parent",
		Scope:      Scope{Print: true, ValidMonths: 6},
	}, "127.0.0.1", "ua")
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	if got := store.privacy[assetID.String()]; got == "public" {
		t.Fatalf("print-only should not flip public, got %q", got)
	}
}

func TestConsent_BadToken(t *testing.T) {
	svc, _ := newTestService(t)
	_, err := svc.VerifyAndSign(context.Background(), "not-a-token", SignReq{SignedName: "x", Scope: Scope{Channel: true}}, "", "")
	if err == nil {
		t.Fatal("expected error")
	}
}
