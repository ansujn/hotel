package social

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// HandleLibrary GET /v1/admin/social/library — consented assets.
func (s *Service) HandleLibrary(w http.ResponseWriter, r *http.Request) {
	assets, err := s.ListConsentedAssets(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if assets == nil {
		assets = []ConsentedAsset{}
	}
	writeJSON(w, http.StatusOK, assets)
}

// HandleCreatePost POST /v1/admin/social/posts — create social post.
func (s *Service) HandleCreatePost(w http.ResponseWriter, r *http.Request) {
	var req CreatePostReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}
	post, err := s.CreatePost(r.Context(), req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, post)
}

// HandleListPosts GET /v1/admin/social/posts?week=2026-04-14 — calendar view.
func (s *Service) HandleListPosts(w http.ResponseWriter, r *http.Request) {
	weekStr := r.URL.Query().Get("week")
	var weekStart time.Time
	if weekStr != "" {
		var err error
		weekStart, err = time.Parse("2006-01-02", weekStr)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid week format, use YYYY-MM-DD"})
			return
		}
	} else {
		// Default to current week (Monday).
		now := time.Now()
		weekStart = now.AddDate(0, 0, -int(now.Weekday()-time.Monday))
		if now.Weekday() == time.Sunday {
			weekStart = now.AddDate(0, 0, -6)
		}
		weekStart = time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, time.UTC)
	}
	posts, err := s.ListPosts(r.Context(), weekStart)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if posts == nil {
		posts = []SocialPost{}
	}
	writeJSON(w, http.StatusOK, posts)
}

// HandleSchedulePost POST /v1/admin/social/posts/{id}/schedule — push to Buffer.
func (s *Service) HandleSchedulePost(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid post id"})
		return
	}
	if err := s.SchedulePost(r.Context(), id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "scheduled"})
}

// HandleSuggestClips GET /v1/admin/assets/{id}/clips — AI clip suggestions.
func (s *Service) HandleSuggestClips(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid asset id"})
		return
	}
	clips, err := s.SuggestClips(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, clips)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
