package main

import (
	"context"
	"errors"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/viktheatre/api/internal/auth"
	"github.com/viktheatre/api/internal/platform/config"
	"github.com/viktheatre/api/internal/platform/db"
	"github.com/viktheatre/api/internal/platform/httpx"

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

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Fatal("db connect", zap.Error(err))
	}
	defer pool.Close()

	var msg91 auth.MSG91Client
	if cfg.AppEnv != "local" && cfg.MSG91AuthKey != "" {
		msg91 = auth.NewMSG91Client(cfg.MSG91AuthKey, cfg.MSG91TemplateID, cfg.MSG91SenderID)
	}
	authSvc := auth.New(pool, cfg, msg91)

	router := httpx.NewRouter(httpx.Deps{
		Log:    logger,
		DB:     pool,
		Config: cfg,
		Auth:   authSvc,
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
