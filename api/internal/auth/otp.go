package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// ErrInvalidOTP is returned when OTP verification fails.
var ErrInvalidOTP = errors.New("invalid otp")

// DevBypassCode is accepted in APP_ENV=local instead of calling MSG91.
const DevBypassCode = "000000"

// MSG91Client is the subset of MSG91 REST that we use.
type MSG91Client interface {
	SendOTP(ctx context.Context, phone string) error
	VerifyOTP(ctx context.Context, phone, code string) error
}

// msg91HTTPClient is the real MSG91 implementation.
type msg91HTTPClient struct {
	authKey    string
	templateID string
	senderID   string
	http       *http.Client
	baseURL    string
}

func NewMSG91Client(authKey, templateID, senderID string) MSG91Client {
	return &msg91HTTPClient{
		authKey:    authKey,
		templateID: templateID,
		senderID:   senderID,
		http:       &http.Client{Timeout: 10 * time.Second},
		baseURL:    "https://control.msg91.com/api/v5",
	}
}

func (m *msg91HTTPClient) SendOTP(ctx context.Context, phone string) error {
	q := url.Values{}
	q.Set("template_id", m.templateID)
	q.Set("mobile", normalizePhone(phone))
	if m.senderID != "" {
		q.Set("sender", m.senderID)
	}
	endpoint := fmt.Sprintf("%s/otp?%s", m.baseURL, q.Encode())

	body, _ := json.Marshal(map[string]any{})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("msg91 send build: %w", err)
	}
	req.Header.Set("authkey", m.authKey)
	req.Header.Set("Content-Type", "application/json")
	return m.do(req, "send")
}

func (m *msg91HTTPClient) VerifyOTP(ctx context.Context, phone, code string) error {
	q := url.Values{}
	q.Set("mobile", normalizePhone(phone))
	q.Set("otp", code)
	endpoint := fmt.Sprintf("%s/otp/verify?%s", m.baseURL, q.Encode())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return fmt.Errorf("msg91 verify build: %w", err)
	}
	req.Header.Set("authkey", m.authKey)
	return m.do(req, "verify")
}

func (m *msg91HTTPClient) do(req *http.Request, op string) error {
	resp, err := m.http.Do(req)
	if err != nil {
		return fmt.Errorf("msg91 %s: %w", op, err)
	}
	defer resp.Body.Close()

	var payload struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	}
	raw, _ := io.ReadAll(resp.Body)
	_ = json.Unmarshal(raw, &payload)

	if resp.StatusCode >= 400 || payload.Type == "error" {
		if op == "verify" {
			return fmt.Errorf("%w: %s", ErrInvalidOTP, payload.Message)
		}
		return fmt.Errorf("msg91 %s failed: %s", op, payload.Message)
	}
	return nil
}

// normalizePhone strips a leading "+" — MSG91 expects bare country-code prefix.
func normalizePhone(phone string) string {
	if len(phone) > 0 && phone[0] == '+' {
		return phone[1:]
	}
	return phone
}
