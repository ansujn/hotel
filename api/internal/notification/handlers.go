package notification

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/viktheatre/api/internal/auth"
)

// HandleList handles GET /v1/notifications.
func (s *Service) HandleList(w http.ResponseWriter, r *http.Request) {
	userID, ok := userUUID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	items, err := s.List(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "fetch failed"})
		return
	}
	if items == nil {
		items = []Notification{}
	}
	writeJSON(w, http.StatusOK, items)
}

// HandleUnreadCount handles GET /v1/notifications/unread-count.
func (s *Service) HandleUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID, ok := userUUID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	n, err := s.UnreadCount(r.Context(), userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "fetch failed"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]int{"count": n})
}

// HandleMarkRead handles POST /v1/notifications/{id}/read.
func (s *Service) HandleMarkRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := userUUID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}
	if err := s.MarkRead(r.Context(), id, userID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "mark read failed"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// HandleMarkAllRead handles POST /v1/notifications/mark-all-read.
func (s *Service) HandleMarkAllRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := userUUID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	if err := s.MarkAllRead(r.Context(), userID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "mark all read failed"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func userUUID(r *http.Request) (uuid.UUID, bool) {
	s, ok := auth.UserIDFromCtx(r)
	if !ok {
		return uuid.Nil, false
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil, false
	}
	return id, true
}
