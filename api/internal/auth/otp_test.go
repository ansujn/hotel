package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/viktheatre/api/internal/platform/config"
)

func TestSendOTPLocalModeIsNoop(t *testing.T) {
	s := &Service{cfg: &config.Config{AppEnv: "local"}}
	if err := s.SendOTP(context.Background(), "+919876543210"); err != nil {
		t.Fatalf("expected no error in local mode, got %v", err)
	}
}

func TestSendOTPEmptyPhoneRejected(t *testing.T) {
	s := &Service{cfg: &config.Config{AppEnv: "local"}}
	if err := s.SendOTP(context.Background(), ""); err == nil {
		t.Fatalf("expected error for empty phone")
	}
}

// Note: VerifyOTP in local mode upserts the user, which requires a DB.
// We test the code-validation branch only, by stubbing the code check path
// via an isolated helper when no pool is configured.

func TestVerifyOTPLocalWrongCodeRejected(t *testing.T) {
	s := &Service{cfg: &config.Config{AppEnv: "local"}}
	_, _, err := s.VerifyOTP(context.Background(), "+919876543210", "123456")
	if !errors.Is(err, ErrInvalidOTP) {
		t.Fatalf("expected ErrInvalidOTP, got %v", err)
	}
}

func TestVerifyOTPMissingArgs(t *testing.T) {
	s := &Service{cfg: &config.Config{AppEnv: "local"}}
	if _, _, err := s.VerifyOTP(context.Background(), "", ""); err == nil {
		t.Fatalf("expected error for empty args")
	}
}
