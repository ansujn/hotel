package httpx

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/viktheatre/api/internal/asset"
	"github.com/viktheatre/api/internal/auth"
	"github.com/viktheatre/api/internal/consent"
	"github.com/viktheatre/api/internal/payment"
	"github.com/viktheatre/api/internal/platform/config"
	"github.com/viktheatre/api/internal/progress"
	"github.com/viktheatre/api/internal/social"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

type Deps struct {
	Log     *zap.Logger
	DB      *pgxpool.Pool
	Config  *config.Config
	Auth    *auth.Service
	Asset   *asset.Service
	Consent  *consent.Service
	Progress *progress.Service
	Social   *social.Service
	Payment  *payment.Service
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

		// public/private channel — optional auth so caller's role can unlock private assets
		r.Group(func(r chi.Router) {
			r.Use(d.Auth.OptionalAuth)
			if d.Asset != nil {
				r.Get("/students/{id}/channel", d.Asset.HandleChannel)
			} else {
				r.Get("/students/{id}/channel", stub("channel"))
			}
		})

		// progress + rubric + notes (auth required)
		r.Group(func(r chi.Router) {
			r.Use(d.Auth.RequireAuth)
			if d.Progress != nil {
				r.Get("/students/{id}/progress", d.Progress.HandleGetProgress)
				r.Get("/assets/{id}/rubric", d.Progress.HandleGetRubric)
				r.Post("/assets/{id}/notes", d.Progress.HandleAddNote)
				r.Get("/assets/{id}/notes", d.Progress.HandleGetNotes)
			} else {
				r.Get("/students/{id}/progress", stub("student progress"))
				r.Get("/assets/{id}/rubric", stub("asset rubric"))
				r.Post("/assets/{id}/notes", stub("add note"))
				r.Get("/assets/{id}/notes", stub("list notes"))
			}
		})

		// admin (admin|instructor)
		r.Route("/admin", func(r chi.Router) {
			r.Use(d.Auth.RequireAuth)
			r.Use(d.Auth.RequireRole("admin", "instructor"))
			if d.Asset != nil {
				r.Post("/assets", d.Asset.HandleCreate)
				r.Post("/assets/{id}/publish", d.Asset.HandlePublish)
			}
			if d.Progress != nil {
				r.Post("/assets/{id}/rubric", d.Progress.HandleScoreAsset)
			} else {
				r.Post("/assets/{id}/rubric", stub("score asset"))
			}
			if d.Asset == nil {
				r.Post("/assets", stub("admin create asset"))
			}

			// Social hub
			if d.Social != nil {
				r.Get("/social/library", d.Social.HandleLibrary)
				r.Post("/social/posts", d.Social.HandleCreatePost)
				r.Get("/social/posts", d.Social.HandleListPosts)
				r.Post("/social/posts/{id}/schedule", d.Social.HandleSchedulePost)
				r.Get("/assets/{id}/clips", d.Social.HandleSuggestClips)
			} else {
				r.Get("/social/library", stub("social library"))
				r.Post("/social/posts", stub("social create post"))
				r.Get("/social/posts", stub("social list posts"))
				r.Post("/social/posts/{id}/schedule", stub("social schedule"))
				r.Get("/assets/{id}/clips", stub("clip suggestions"))
			}
		})

		// payments (auth required, parent role)
		r.Group(func(r chi.Router) {
			r.Use(d.Auth.RequireAuth)
			if d.Payment != nil {
				r.Post("/payments/order", d.Payment.HandleCreateOrder)
				r.Get("/payments", d.Payment.HandleListPayments)
				r.Get("/payments/dues", d.Payment.HandleGetDues)
			} else {
				r.Post("/payments/order", stub("create payment order"))
				r.Get("/payments", stub("list payments"))
				r.Get("/payments/dues", stub("get dues"))
			}
		})

		// public consent (tokenized — token IS the auth)
		if d.Consent != nil {
			r.Post("/consent/{token}", d.Consent.HandleSign)
		} else {
			r.Post("/consent/{token}", stub("consent sign"))
		}

		// webhooks (no auth; HMAC-verified inside the handler)
		if d.Asset != nil {
			r.Post("/webhooks/mux", d.Asset.HandleMuxWebhookHTTP)
		} else {
			r.Post("/webhooks/mux", stub("mux webhook"))
		}
		if d.Payment != nil {
			r.Post("/webhooks/razorpay", d.Payment.HandleWebhookHTTP)
		} else {
			r.Post("/webhooks/razorpay", stub("razorpay webhook"))
		}
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
