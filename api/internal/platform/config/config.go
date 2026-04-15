package config

import "github.com/kelseyhightower/envconfig"

type Config struct {
	AppEnv      string `envconfig:"APP_ENV" default:"local"`
	Port        string `envconfig:"API_PORT" default:"8080"`
	DatabaseURL string `envconfig:"DATABASE_URL" required:"true"`
	JWTSecret   string `envconfig:"JWT_SECRET" required:"true"`

	MSG91AuthKey    string `envconfig:"MSG91_AUTH_KEY"`
	MSG91TemplateID string `envconfig:"MSG91_TEMPLATE_ID"`
	MSG91SenderID   string `envconfig:"MSG91_SENDER_ID"`

	MuxTokenID           string `envconfig:"MUX_TOKEN_ID"`
	MuxSecret            string `envconfig:"MUX_TOKEN_SECRET"`
	MuxSigningKeyID      string `envconfig:"MUX_SIGNING_KEY_ID"`
	MuxSigningKeyPrivate string `envconfig:"MUX_SIGNING_KEY_PRIVATE"`
	MuxWebhookSecret     string `envconfig:"MUX_WEBHOOK_SECRET"`

	ResendAPIKey string `envconfig:"RESEND_API_KEY"`
	AppBaseURL   string `envconfig:"APP_BASE_URL" default:"http://localhost:3000"`
}

func Load() (*Config, error) {
	var c Config
	if err := envconfig.Process("", &c); err != nil {
		return nil, err
	}
	return &c, nil
}
