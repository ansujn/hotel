// Package mux is a thin wrapper around the Mux Video REST API and signed
// playback tokens. In local/dev mode (no MUX_TOKEN_ID), the client returns
// deterministic stubs so the upload -> webhook -> play flow is runnable
// without real Mux credentials.
package mux

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Client talks to Mux Video. Zero-value is not usable — construct via New.
type Client struct {
	tokenID           string
	tokenSecret       string
	signingKeyID      string
	signingKeyPrivate string
	webhookSecret     string

	http    *http.Client
	baseURL string
	// stub = true when no real credentials are configured.
	stub     bool
	stubBase string // e.g. http://localhost:8080
}

// Config carries the runtime knobs.
type Config struct {
	TokenID           string
	TokenSecret       string
	SigningKeyID      string
	SigningKeyPrivate string // PEM-encoded RSA private key
	WebhookSecret     string
	// StubBaseURL is used to mint fake upload URLs in stub mode.
	StubBaseURL string
}

// New builds a client. If TokenID is empty the client runs in stub mode.
func New(cfg Config) *Client {
	c := &Client{
		tokenID:           cfg.TokenID,
		tokenSecret:       cfg.TokenSecret,
		signingKeyID:      cfg.SigningKeyID,
		signingKeyPrivate: cfg.SigningKeyPrivate,
		webhookSecret:     cfg.WebhookSecret,
		http:              &http.Client{Timeout: 15 * time.Second},
		baseURL:           "https://api.mux.com",
		stub:              cfg.TokenID == "",
		stubBase:          cfg.StubBaseURL,
	}
	if c.stubBase == "" {
		c.stubBase = "http://localhost:8080"
	}
	return c
}

// IsStub reports whether the client will return fake values.
func (c *Client) IsStub() bool { return c.stub }

// --- Direct upload -----------------------------------------------------------

type uploadReq struct {
	NewAssetSettings struct {
		PlaybackPolicy []string `json:"playback_policy"`
	} `json:"new_asset_settings"`
	CorsOrigin string `json:"cors_origin"`
}

type uploadRes struct {
	Data struct {
		ID     string `json:"id"`
		URL    string `json:"url"`
		Status string `json:"status"`
	} `json:"data"`
}

// CreateDirectUpload requests a PUT-to-Mux upload URL. Returns the URL and
// the upload id (which the webhook later maps to an asset id).
func (c *Client) CreateDirectUpload(ctx context.Context) (uploadURL, uploadID string, err error) {
	if c.stub {
		id := uuid.NewString()
		return fmt.Sprintf("%s/v1/dev/mux-upload/%s", c.stubBase, id), id, nil
	}

	var body uploadReq
	body.NewAssetSettings.PlaybackPolicy = []string{"signed"}
	body.CorsOrigin = "*"

	raw, err := json.Marshal(body)
	if err != nil {
		return "", "", fmt.Errorf("mux marshal: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		c.baseURL+"/video/v1/uploads", bytes.NewReader(raw))
	if err != nil {
		return "", "", fmt.Errorf("mux build: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(c.tokenID, c.tokenSecret)

	resp, err := c.http.Do(req)
	if err != nil {
		return "", "", fmt.Errorf("mux call: %w", err)
	}
	defer resp.Body.Close()
	raw, _ = io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return "", "", fmt.Errorf("mux upload create status=%d body=%s",
			resp.StatusCode, string(raw))
	}
	var out uploadRes
	if err := json.Unmarshal(raw, &out); err != nil {
		return "", "", fmt.Errorf("mux decode: %w", err)
	}
	return out.Data.URL, out.Data.ID, nil
}

// --- Signed playback ---------------------------------------------------------

// SignPlayback returns an RS256 JWT good for signed playback URLs.
// aud = "v", sub = playbackID, kid = signing key id, exp = now+ttl.
func (c *Client) SignPlayback(playbackID string, ttl time.Duration) (string, error) {
	if c.stub {
		// Not cryptographically meaningful — just a stable string for dev.
		return "dev-" + playbackID + "-" + strconv.FormatInt(time.Now().Add(ttl).Unix(), 10), nil
	}
	if c.signingKeyID == "" || c.signingKeyPrivate == "" {
		return "", errors.New("mux signing key not configured")
	}
	key, err := parseRSAPrivate(c.signingKeyPrivate)
	if err != nil {
		return "", err
	}
	now := time.Now()
	claims := jwt.MapClaims{
		"sub": playbackID,
		"aud": "v",
		"exp": now.Add(ttl).Unix(),
		"kid": c.signingKeyID,
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	tok.Header["kid"] = c.signingKeyID
	return tok.SignedString(key)
}

func parseRSAPrivate(pemStr string) (*rsa.PrivateKey, error) {
	// The private key may be supplied base64 encoded (common for env vars)
	// or as raw PEM. Try PEM first; on failure try base64 decode.
	blk, _ := pem.Decode([]byte(pemStr))
	if blk == nil {
		dec, err := base64.StdEncoding.DecodeString(strings.TrimSpace(pemStr))
		if err != nil {
			return nil, fmt.Errorf("mux key: not PEM and not base64: %w", err)
		}
		blk, _ = pem.Decode(dec)
		if blk == nil {
			return nil, errors.New("mux key: decoded bytes not PEM")
		}
	}
	if key, err := x509.ParsePKCS1PrivateKey(blk.Bytes); err == nil {
		return key, nil
	}
	anyKey, err := x509.ParsePKCS8PrivateKey(blk.Bytes)
	if err != nil {
		return nil, fmt.Errorf("mux key parse: %w", err)
	}
	rsaKey, ok := anyKey.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("mux key: not an RSA private key")
	}
	return rsaKey, nil
}

// --- Webhook verification ----------------------------------------------------

// VerifyWebhook validates the Mux-Signature header per Mux docs. The header
// is of the form `t=<unix>,v1=<hex-hmac>`. The signature is HMAC-SHA256 of
// "<t>.<raw-body>" using the webhook secret.
func (c *Client) VerifyWebhook(signatureHeader string, body []byte) error {
	if c.stub && c.webhookSecret == "" {
		return nil // local dev convenience
	}
	if c.webhookSecret == "" {
		return errors.New("mux webhook secret not configured")
	}
	var ts, sig string
	for _, part := range strings.Split(signatureHeader, ",") {
		kv := strings.SplitN(strings.TrimSpace(part), "=", 2)
		if len(kv) != 2 {
			continue
		}
		switch kv[0] {
		case "t":
			ts = kv[1]
		case "v1":
			sig = kv[1]
		}
	}
	if ts == "" || sig == "" {
		return errors.New("mux signature: missing t/v1")
	}
	mac := hmac.New(sha256.New, []byte(c.webhookSecret))
	mac.Write([]byte(ts + "."))
	mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expected), []byte(sig)) {
		return errors.New("mux signature: mismatch")
	}
	return nil
}
