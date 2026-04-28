package config

import "github.com/kelseyhightower/envconfig"

type Config struct {
	AppEnv      string `envconfig:"APP_ENV" default:"local"`
	Port        string `envconfig:"API_PORT" default:"8080"`
	DatabaseURL string `envconfig:"DATABASE_URL" required:"true"`
	JWTSecret   string `envconfig:"JWT_SECRET" required:"true"`

	MuxTokenID           string `envconfig:"MUX_TOKEN_ID"`
	MuxSecret            string `envconfig:"MUX_TOKEN_SECRET"`
	MuxSigningKeyID      string `envconfig:"MUX_SIGNING_KEY_ID"`
	MuxSigningKeyPrivate string `envconfig:"MUX_SIGNING_KEY_PRIVATE"`
	MuxWebhookSecret     string `envconfig:"MUX_WEBHOOK_SECRET"`

	// Transactional email (Brevo). Free tier: 300/day.
	BrevoAPIKey  string `envconfig:"BREVO_API_KEY"`
	MailFromEmail string `envconfig:"MAIL_FROM_EMAIL" default:"no-reply@victor.saudagars.org"`
	MailFromName  string `envconfig:"MAIL_FROM_NAME"  default:"Vik Theatre"`

	AppBaseURL string `envconfig:"APP_BASE_URL" default:"http://localhost:3000"`

	RazorpayKeyID         string `envconfig:"RAZORPAY_KEY_ID"`
	RazorpayKeySecret     string `envconfig:"RAZORPAY_KEY_SECRET"`
	RazorpayWebhookSecret string `envconfig:"RAZORPAY_WEBHOOK_SECRET"`

	// Restaurant platform (Phase 1) — shared admin password for upload
	// endpoints. Empty disables /v1/admin/restaurants/{id}/* routes.
	AdminPassword string `envconfig:"ADMIN_PASSWORD"`
}

func Load() (*Config, error) {
	var c Config
	if err := envconfig.Process("", &c); err != nil {
		return nil, err
	}
	return &c, nil
}
