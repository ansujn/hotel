package razorpay

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
)

// Client is a thin wrapper around the Razorpay REST API.
type Client struct {
	keyID         string
	keySecret     string
	webhookSecret string
	stub          bool
	httpClient    *http.Client
}

// Config for constructing a Razorpay client.
type Config struct {
	KeyID         string
	KeySecret     string
	WebhookSecret string
}

// New returns a Client. If KeyID is empty, the client runs in stub mode
// (returns fake order IDs and always verifies signatures).
func New(cfg Config) *Client {
	return &Client{
		keyID:         cfg.KeyID,
		keySecret:     cfg.KeySecret,
		webhookSecret: cfg.WebhookSecret,
		stub:          cfg.KeyID == "",
		httpClient:    &http.Client{},
	}
}

// IsStub returns true when running without real Razorpay credentials.
func (c *Client) IsStub() bool { return c.stub }

// KeyID returns the public key ID (safe to expose to frontend).
func (c *Client) KeyID() string {
	if c.stub {
		return "rzp_test_stub"
	}
	return c.keyID
}

type createOrderReq struct {
	Amount   int64             `json:"amount"`
	Currency string            `json:"currency"`
	Receipt  string            `json:"receipt"`
	Notes    map[string]string `json:"notes,omitempty"`
}

type createOrderRes struct {
	ID string `json:"id"`
}

// CreateOrder creates a Razorpay order. In stub mode it returns a fake order ID.
func (c *Client) CreateOrder(ctx context.Context, amountPaise int64, receipt string, notes map[string]string) (string, error) {
	if c.stub {
		return "order_dev_" + uuid.New().String()[:8], nil
	}

	body, _ := json.Marshal(createOrderReq{
		Amount:   amountPaise,
		Currency: "INR",
		Receipt:  receipt,
		Notes:    notes,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.razorpay.com/v1/orders", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("razorpay: build request: %w", err)
	}
	req.SetBasicAuth(c.keyID, c.keySecret)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("razorpay: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("razorpay: status %d: %s", resp.StatusCode, string(b))
	}

	var out createOrderRes
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", fmt.Errorf("razorpay: decode response: %w", err)
	}
	return out.ID, nil
}

// VerifySignature verifies a Razorpay payment callback using HMAC-SHA256.
// In stub mode it always returns true.
func (c *Client) VerifySignature(orderID, paymentID, signature string) bool {
	if c.stub {
		return true
	}
	message := orderID + "|" + paymentID
	mac := hmac.New(sha256.New, []byte(c.keySecret))
	mac.Write([]byte(message))
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

// VerifyWebhookSignature verifies a Razorpay webhook payload using HMAC-SHA256
// with the webhook secret. In stub mode it always returns true.
func (c *Client) VerifyWebhookSignature(body []byte, signature string) bool {
	if c.stub {
		return true
	}
	if c.webhookSecret == "" {
		return false
	}
	mac := hmac.New(sha256.New, []byte(c.webhookSecret))
	mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}
