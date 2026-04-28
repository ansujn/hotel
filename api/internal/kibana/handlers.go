package kibana

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/viktheatre/api/internal/restaurants"
)

// RegisterRoutes wires the single-restaurant Kibana endpoints.
//   GET  /v1/kibana/profile         → restaurant detail (delegates to restaurants svc)
//   GET  /v1/kibana/banquets        → banquet halls
//   GET  /v1/kibana/menus           → menu (categories with nested items)
//   GET  /v1/videos                 → all Kibana videos
//   GET  /v1/images                 → all Kibana images
//   GET  /v1/reviews                → verified reviews (delegates)
//   POST /v1/bookings               → create booking
func (s *Service) RegisterRoutes(r chi.Router, rest *restaurants.Service) {
	r.Get("/kibana/profile",  s.handleProfile(rest))
	r.Get("/kibana/banquets", s.handleBanquets)
	r.Get("/kibana/menus",    s.handleMenu)
	r.Get("/videos",          s.handleVideos(rest))
	r.Get("/images",          s.handleImages(rest))
	r.Get("/reviews",         s.handleReviews(rest))
	r.Post("/bookings",       s.handleCreateBooking)
}

func (s *Service) handleProfile(rest *restaurants.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		d, err := rest.Get(r.Context(), s.kibanaID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errResp(err.Error()))
			return
		}
		writeJSON(w, http.StatusOK, d)
	}
}

func (s *Service) handleBanquets(w http.ResponseWriter, r *http.Request) {
	out, err := s.ListBanquets(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errResp("list banquets failed"))
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"banquets": out})
}

func (s *Service) handleMenu(w http.ResponseWriter, r *http.Request) {
	out, err := s.ListMenu(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errResp("list menu failed"))
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"categories": out})
}

func (s *Service) handleVideos(rest *restaurants.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		out, err := rest.ListVideos(r.Context(), s.kibanaID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errResp("list videos failed"))
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"videos": out})
	}
}

func (s *Service) handleImages(rest *restaurants.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		out, err := rest.ListImages(r.Context(), s.kibanaID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errResp("list images failed"))
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"images": out})
	}
}

func (s *Service) handleReviews(rest *restaurants.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		page := atoiDefault(r.URL.Query().Get("page"), 1)
		limit := atoiDefault(r.URL.Query().Get("limit"), 20)
		out, err := rest.ListReviews(r.Context(), s.kibanaID, page, limit)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, errResp("list reviews failed"))
			return
		}
		writeJSON(w, http.StatusOK, out)
	}
}

func (s *Service) handleCreateBooking(w http.ResponseWriter, r *http.Request) {
	var req CreateBookingReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid body"))
		return
	}
	b, err := s.CreateBooking(r.Context(), req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp(err.Error()))
		return
	}
	writeJSON(w, http.StatusCreated, b)
}

// ----- helpers -------------------------------------------------------------

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func errResp(msg string) map[string]string { return map[string]string{"error": msg} }

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n := 0
	for _, c := range s {
		if c < '0' || c > '9' {
			return def
		}
		n = n*10 + int(c-'0')
	}
	return n
}

