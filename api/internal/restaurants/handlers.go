package restaurants

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// RegisterRoutes wires the restaurant endpoints to a chi router.
// Public routes attach at the root; admin routes go under /admin and use
// password-from-env auth.
func (s *Service) RegisterRoutes(r chi.Router) {
	// Public discovery
	r.Get("/restaurants", s.HandleList)
	r.Get("/restaurants/{id}", s.HandleGet)
	r.Get("/restaurants/{id}/videos", s.HandleListVideos)
	r.Get("/restaurants/{id}/images", s.HandleListImages)

	// Reviews (public)
	r.Get("/reviews/{restaurant_id}", s.HandleListReviews)
	r.Post("/reviews", s.HandleCreateReview)
	r.Get("/reviews/verify", s.HandleVerifyReview)

	// Admin (password from header / query)
	r.Group(func(r chi.Router) {
		r.Use(s.adminAuthMiddleware)
		r.Post("/admin/restaurants/{id}/images", s.HandleCreateImage)
		r.Post("/admin/restaurants/{id}/videos", s.HandleCreateVideo)
	})
}

// ----- public list / get ---------------------------------------------------

func (s *Service) HandleList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	f := ListFilters{
		Cuisine:  q.Get("cuisine"),
		Location: q.Get("location"),
		City:     q.Get("city"),
		Page:     atoiDefault(q.Get("page"), 1),
		Limit:    atoiDefault(q.Get("limit"), 20),
	}
	if v := q.Get("min_price"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.MinPrice = &n
		}
	}
	if v := q.Get("max_price"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.MaxPrice = &n
		}
	}
	if v := q.Get("capacity_min"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.CapacityMin = &n
		}
	}
	if v := q.Get("capacity"); v != "" && f.CapacityMin == nil {
		if n, err := strconv.Atoi(v); err == nil {
			f.CapacityMin = &n
		}
	}
	if v := q.Get("rating_min"); v != "" {
		if n, err := strconv.ParseFloat(v, 64); err == nil {
			f.RatingMin = &n
		}
	}

	res, err := s.List(r.Context(), f)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errResp("list failed"))
		return
	}
	writeJSON(w, http.StatusOK, res)
}

func (s *Service) HandleGet(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid id"))
		return
	}
	d, err := s.Get(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		writeJSON(w, http.StatusNotFound, errResp("not found"))
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errResp("fetch failed"))
		return
	}
	writeJSON(w, http.StatusOK, d)
}

// ----- videos --------------------------------------------------------------

func (s *Service) HandleListVideos(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid id"))
		return
	}
	out, err := s.ListVideos(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errResp("list failed"))
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"videos": out})
}

func (s *Service) HandleCreateVideo(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid id"))
		return
	}
	var req CreateVideoReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid body"))
		return
	}
	v, err := s.CreateVideo(r.Context(), id, req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp(err.Error()))
		return
	}
	writeJSON(w, http.StatusCreated, v)
}

// ----- images --------------------------------------------------------------

func (s *Service) HandleListImages(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid id"))
		return
	}
	out, err := s.ListImages(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errResp("list failed"))
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"images": out})
}

func (s *Service) HandleCreateImage(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid id"))
		return
	}
	var req CreateImageReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid body"))
		return
	}
	im, err := s.CreateImage(r.Context(), id, req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp(err.Error()))
		return
	}
	writeJSON(w, http.StatusCreated, im)
}

// ----- reviews -------------------------------------------------------------

func (s *Service) HandleListReviews(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "restaurant_id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid id"))
		return
	}
	q := r.URL.Query()
	page := atoiDefault(q.Get("page"), 1)
	limit := atoiDefault(q.Get("limit"), 20)

	out, err := s.ListReviews(r.Context(), id, page, limit)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errResp("list failed"))
		return
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Service) HandleCreateReview(w http.ResponseWriter, r *http.Request) {
	var req CreateReviewReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, errResp("invalid body"))
		return
	}
	rev, err := s.CreateReview(r.Context(), req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errResp(err.Error()))
		return
	}
	writeJSON(w, http.StatusAccepted, map[string]any{
		"review":   rev,
		"verified": false,
		"message":  "Check your email for a verification link to publish this review.",
	})
}

func (s *Service) HandleVerifyReview(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if err := s.VerifyReview(r.Context(), token); err != nil {
		if errors.Is(err, ErrNotFound) {
			writeJSON(w, http.StatusNotFound, errResp("invalid or expired token"))
			return
		}
		writeJSON(w, http.StatusBadRequest, errResp(err.Error()))
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"verified": true})
}

// ----- middleware ----------------------------------------------------------

// adminAuthMiddleware accepts the password via X-Admin-Password header
// (preferred) or ?admin_password= query param. Empty configured password
// blocks all admin requests with 503.
func (s *Service) adminAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if s.adminPassword == "" {
			writeJSON(w, http.StatusServiceUnavailable,
				errResp("admin disabled (set ADMIN_PASSWORD)"))
			return
		}
		provided := r.Header.Get("X-Admin-Password")
		if provided == "" {
			provided = r.URL.Query().Get("admin_password")
		}
		if !s.AdminPasswordOK(provided) {
			writeJSON(w, http.StatusUnauthorized, errResp("invalid admin password"))
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ----- helpers -------------------------------------------------------------

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func errResp(msg string) map[string]string {
	return map[string]string{"error": msg}
}

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	if n, err := strconv.Atoi(s); err == nil {
		return n
	}
	return def
}
