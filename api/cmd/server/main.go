package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/viktheatre/api/internal/asset"
	"github.com/viktheatre/api/internal/auth"
	"github.com/viktheatre/api/internal/consent"
	"github.com/viktheatre/api/internal/notification"
	"github.com/viktheatre/api/internal/payment"
	brevopkg "github.com/viktheatre/api/internal/platform/brevo"
	"github.com/viktheatre/api/internal/platform/config"
	"github.com/viktheatre/api/internal/platform/db"
	"github.com/viktheatre/api/internal/platform/httpx"
	muxpkg "github.com/viktheatre/api/internal/platform/mux"
	razorpaypkg "github.com/viktheatre/api/internal/platform/razorpay"
	"github.com/viktheatre/api/internal/kibana"
	"github.com/viktheatre/api/internal/progress"
	"github.com/viktheatre/api/internal/restaurants"
	"github.com/viktheatre/api/internal/social"

	"github.com/google/uuid"

	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

func main() {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	cfg, err := config.Load()
	if err != nil {
		logger.Fatal("config", zap.Error(err))
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	skipDB := os.Getenv("SKIP_DB") == "true"

	var pool *pgxpool.Pool
	if skipDB {
		logger.Warn("SKIP_DB=true: running without a database connection; DB-dependent endpoints will return 503")
	} else {
		p, err := db.Connect(ctx, cfg.DatabaseURL)
		if err != nil {
			logger.Fatal("db connect", zap.Error(err))
		}
		pool = p
		defer pool.Close()
	}

	// Brevo mailer for auth emails (welcome + password reset).
	// Returns nil when BREVO_API_KEY is empty; auth service falls back to
	// logging the reset link to stdout.
	var mailer auth.Mailer
	if brevo := brevopkg.New(brevopkg.Config{
		APIKey:    cfg.BrevoAPIKey,
		FromEmail: cfg.MailFromEmail,
		FromName:  cfg.MailFromName,
	}); brevo != nil {
		mailer = brevo
	}
	authSvc := auth.New(pool, cfg, mailer)

	// Mux client: stub in local mode when MUX_TOKEN_ID is empty.
	muxClient := muxpkg.New(muxpkg.Config{
		TokenID:           cfg.MuxTokenID,
		TokenSecret:       cfg.MuxSecret,
		SigningKeyID:      cfg.MuxSigningKeyID,
		SigningKeyPrivate: cfg.MuxSigningKeyPrivate,
		WebhookSecret:     cfg.MuxWebhookSecret,
		StubBaseURL:       "http://localhost:" + cfg.Port,
	})

	// When pool is nil (SKIP_DB), asset and consent services are left nil.
	// The router handles nil gracefully by returning 501 stubs.
	// Razorpay client: stub when RAZORPAY_KEY_ID is empty.
	rpClient := razorpaypkg.New(razorpaypkg.Config{
		KeyID:         cfg.RazorpayKeyID,
		KeySecret:     cfg.RazorpayKeySecret,
		WebhookSecret: cfg.RazorpayWebhookSecret,
	})

	var assetSvc *asset.Service
	var consentSvc *consent.Service
	var progressSvc *progress.Service
	var socialSvc *social.Service
	var paymentSvc *payment.Service
	var notificationSvc *notification.Service
	var restaurantsSvc *restaurants.Service
	var kibanaSvc *kibana.Service
	if pool != nil {
		progressSvc = progress.New(progress.NewPGStore(pool))
		assetSvc = asset.New(asset.NewPGStore(pool), muxClient, cfg)
		consentSvc = consent.New(
			consent.NewPGStore(pool),
			cfg,
			authSvc.Issuer(),
			consent.LogNotifier{Prefix: "consent"},
		)
		assetSvc.WireConsent(consentSvc)

		bufferClient := &social.StubBufferClient{Log: logger}
		socialSvc = social.New(social.NewPGStore(pool), bufferClient, logger)
		paymentSvc = payment.New(payment.NewPGStore(pool), rpClient)
		notificationSvc = notification.New(notification.NewPGStore(pool))
		restaurantsSvc = restaurants.New(
			restaurants.NewPGStore(pool),
			cfg.AdminPassword,
			cfg.AppBaseURL,
			nil, // Phase 1: log verify links to stdout. Wire Brevo in Phase 2.
		)
		kibanaSvc = kibana.New(kibana.NewPGStore(pool), uuid.MustParse(kibana.KibanaID))
	}

	router := httpx.NewRouter(httpx.Deps{
		Log:     logger,
		DB:      pool,
		Config:  cfg,
		Auth:    authSvc,
		Asset:   assetSvc,
		Consent:  consentSvc,
		Progress: progressSvc,
		Social:   socialSvc,
		Payment:  paymentSvc,
		Notification: notificationSvc,
		Restaurants:  restaurantsSvc,
		Kibana:       kibanaSvc,
	})

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		logger.Info("api listening", zap.String("port", cfg.Port))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Fatal("listen", zap.Error(err))
		}
	}()

	<-ctx.Done()
	logger.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
}
