package httpx

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/viktheatre/api/internal/auth"
	"github.com/viktheatre/api/internal/platform/config"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

type Deps struct {
	Log    *zap.Logger
	DB     *pgxpool.Pool
	Config *config.Config
	Auth   *auth.Service
}

func NewRouter(d Deps) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/v1", func(r chi.Router) {
		r.Get("/health", health)

		// auth (public)
		r.Post("/auth/otp/send", d.Auth.HandleOTPSend)
		r.Post("/auth/otp/verify", d.Auth.HandleOTPVerify)
		r.Post("/auth/refresh", d.Auth.HandleRefresh)

		// authenticated
		r.Group(func(r chi.Router) {
			r.Use(d.Auth.RequireAuth)
			r.Get("/me", d.Auth.HandleMe)
		})

		r.Get("/students/{id}/channel", stub("channel"))

		// admin (authenticated)
		r.Route("/admin", func(r chi.Router) {
			r.Use(d.Auth.RequireAuth)
			r.Post("/assets", stub("admin create asset"))
		})

		// public consent (tokenized)
		r.Post("/consent/{token}", stub("consent sign"))

		// webhooks
		r.Post("/webhooks/mux", stub("mux webhook"))
		r.Post("/webhooks/razorpay", stub("razorpay webhook"))
	})

	return r
}

func health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func stub(name string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusNotImplemented, map[string]string{
			"todo": name,
		})
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
