// Package brevo is a minimal Brevo (ex-Sendinblue) transactional email client.
// Docs: https://developers.brevo.com/reference/sendtransacemail
//
// We use the smallest surface needed for auth flows:
//   - welcome email with default password
//   - password reset link email
//
// Free tier: 300 emails/day — ample for a pilot of ~30 users.
package brevo

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io"
	"net/http"
	"time"
)

const defaultEndpoint = "https://api.brevo.com/v3/smtp/email"

// Client is the Brevo transactional mailer.
type Client struct {
	apiKey    string
	fromEmail string
	fromName  string
	http      *http.Client
	endpoint  string
}

// Config holds Brevo credentials and defaults.
type Config struct {
	APIKey    string
	FromEmail string
	FromName  string
}

// New returns a configured client. Returns nil if APIKey is empty — callers
// should interpret nil as "email disabled; fall back to log-only delivery".
func New(cfg Config) *Client {
	if cfg.APIKey == "" {
		return nil
	}
	return &Client{
		apiKey:    cfg.APIKey,
		fromEmail: cfg.FromEmail,
		fromName:  cfg.FromName,
		http:      &http.Client{Timeout: 10 * time.Second},
		endpoint:  defaultEndpoint,
	}
}

type sendParty struct {
	Name  string `json:"name,omitempty"`
	Email string `json:"email"`
}

type sendRequest struct {
	Sender      sendParty   `json:"sender"`
	To          []sendParty `json:"to"`
	Subject     string      `json:"subject"`
	HTMLContent string      `json:"htmlContent"`
	TextContent string      `json:"textContent,omitempty"`
}

// SendPasswordReset implements the auth.Mailer contract.
func (c *Client) SendPasswordReset(ctx context.Context, toEmail, toName, resetURL string) error {
	subject := "Reset your Vik Theatre password"
	safeName := html.EscapeString(toName)
	safeURL := html.EscapeString(resetURL)
	htmlBody := fmt.Sprintf(`
<!doctype html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;padding:24px;">
  <h2 style="margin:0 0 12px;">Reset your password</h2>
  <p>Hi %s,</p>
  <p>We received a request to reset your Vik Theatre password. This link expires in 1 hour and can be used once.</p>
  <p><a href="%s" style="display:inline-block;background:#E8C872;color:#111;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">Reset password</a></p>
  <p style="font-size:12px;color:#666;">Or paste this URL:<br>%s</p>
  <p style="font-size:12px;color:#666;">Didn't request this? You can ignore this email.</p>
</body></html>`, safeName, safeURL, safeURL)

	text := fmt.Sprintf(
		"Hi %s,\n\nReset your Vik Theatre password (expires in 1 hour, single use):\n%s\n\nDidn't request this? You can ignore this email.\n",
		toName, resetURL,
	)
	return c.send(ctx, toEmail, toName, subject, htmlBody, text)
}

// SendWelcome implements the auth.Mailer contract.
func (c *Client) SendWelcome(ctx context.Context, toEmail, toName, loginURL, defaultPassword string) error {
	subject := "Welcome to Vik Theatre — your login"
	safeName := html.EscapeString(toName)
	safeLogin := html.EscapeString(loginURL)
	safePwd := html.EscapeString(defaultPassword)
	htmlBody := fmt.Sprintf(`
<!doctype html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;padding:24px;">
  <h2 style="margin:0 0 12px;">Welcome to Vik Theatre</h2>
  <p>Hi %s,</p>
  <p>Your account is ready. Log in with your email or phone and this temporary password:</p>
  <p style="font-size:20px;font-family:ui-monospace,monospace;background:#f4f4f5;padding:10px 14px;border-radius:6px;display:inline-block;">%s</p>
  <p>You'll be prompted to set a new password on first login.</p>
  <p><a href="%s" style="display:inline-block;background:#E8C872;color:#111;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">Log in</a></p>
</body></html>`, safeName, safePwd, safeLogin)

	text := fmt.Sprintf(
		"Hi %s,\n\nYour Vik Theatre account is ready.\nTemp password: %s\nLogin: %s\n\nYou'll be asked to set a new password on first login.\n",
		toName, defaultPassword, loginURL,
	)
	return c.send(ctx, toEmail, toName, subject, htmlBody, text)
}

func (c *Client) send(ctx context.Context, toEmail, toName, subject, htmlBody, text string) error {
	if toEmail == "" {
		return errors.New("brevo: recipient email required")
	}
	body := sendRequest{
		Sender:      sendParty{Name: c.fromName, Email: c.fromEmail},
		To:          []sendParty{{Name: toName, Email: toEmail}},
		Subject:     subject,
		HTMLContent: htmlBody,
		TextContent: text,
	}
	buf, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("brevo marshal: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(buf))
	if err != nil {
		return fmt.Errorf("brevo build req: %w", err)
	}
	req.Header.Set("api-key", c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("brevo send: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		raw, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return fmt.Errorf("brevo status %d: %s", resp.StatusCode, string(raw))
	}
	return nil
}
