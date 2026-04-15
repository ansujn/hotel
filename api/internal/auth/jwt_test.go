package auth

import (
	"testing"
	"time"
)

func TestIssueAndVerifyRoundTrip(t *testing.T) {
	iss := NewTokenIssuer("test-secret-please-ignore")
	tok, err := iss.IssueAccess("user-123", "student", "+919876543210")
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	claims, err := iss.Verify(tok)
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if claims.UserID != "user-123" || claims.Role != "student" || claims.Phone != "+919876543210" {
		t.Fatalf("claim mismatch: %+v", claims)
	}
	if claims.Kind != "access" {
		t.Fatalf("expected kind access, got %s", claims.Kind)
	}
}

func TestVerifyExpiredToken(t *testing.T) {
	iss := NewTokenIssuer("test-secret")
	iss.now = func() time.Time { return time.Now().Add(-2 * time.Hour) }
	tok, err := iss.IssueAccess("u", "student", "p")
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	// restore time
	iss.now = time.Now
	if _, err := iss.Verify(tok); err == nil {
		t.Fatalf("expected expired token error")
	}
}

func TestVerifyTamperedToken(t *testing.T) {
	iss := NewTokenIssuer("secret-a")
	tok, err := iss.IssueAccess("u", "student", "p")
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	other := NewTokenIssuer("secret-b")
	if _, err := other.Verify(tok); err == nil {
		t.Fatalf("expected bad signature error")
	}
}

func TestRefreshDifferentKind(t *testing.T) {
	iss := NewTokenIssuer("s")
	tok, err := iss.IssueRefresh("u", "admin", "p")
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	c, err := iss.Verify(tok)
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if c.Kind != "refresh" {
		t.Fatalf("expected refresh kind, got %s", c.Kind)
	}
}
