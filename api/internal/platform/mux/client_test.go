package mux

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"testing"
	"time"
)

func TestVerifyWebhook(t *testing.T) {
	secret := "whsec_test"
	c := New(Config{WebhookSecret: secret})
	body := []byte(`{"type":"video.asset.ready"}`)
	ts := strconv.FormatInt(time.Now().Unix(), 10)

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(ts + "."))
	mac.Write(body)
	sig := hex.EncodeToString(mac.Sum(nil))

	good := "t=" + ts + ",v1=" + sig
	if err := c.VerifyWebhook(good, body); err != nil {
		t.Fatalf("expected valid signature to pass: %v", err)
	}

	bad := "t=" + ts + ",v1=deadbeef"
	if err := c.VerifyWebhook(bad, body); err == nil {
		t.Fatalf("expected bad signature to fail")
	}

	if err := c.VerifyWebhook("", body); err == nil {
		t.Fatalf("expected empty signature to fail")
	}
}

func TestStubUpload(t *testing.T) {
	c := New(Config{})
	if !c.IsStub() {
		t.Fatal("expected stub mode")
	}
	url, id, err := c.CreateDirectUpload(nil)
	if err != nil {
		t.Fatalf("stub upload: %v", err)
	}
	if url == "" || id == "" {
		t.Fatal("stub upload returned empty")
	}
}
