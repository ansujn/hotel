package asset

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/viktheatre/api/internal/auth"
)

type createReq struct {
	StudentID string         `json:"student_id"`
	Type      string         `json:"type"`
	Title     string         `json:"title"`
	Note      string         `json:"note"`
	Rubric    map[string]int `json:"rubric"`
}

type createRes struct {
	AssetID      string `json:"asset_id"`
	MuxUploadURL string `json:"mux_upload_url"`
}

// HandleCreate POST /v1/admin/assets (auth: admin|instructor).
func (s *Service) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req createReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	studentID, err := uuid.Parse(req.StudentID)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "invalid student_id")
		return
	}
	var actor *uuid.UUID
	if uid, ok := auth.UserIDFromCtx(r); ok {
		if u, err := uuid.Parse(uid); err == nil {
			actor = &u
		}
	}
	a, uploadURL, err := s.CreateAsset(r.Context(), studentID, req.Type, req.Title, req.Note, req.Rubric, actor)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, createRes{AssetID: a.ID, MuxUploadURL: uploadURL})
}

// HandlePublish POST /v1/admin/assets/{id}/publish.
func (s *Service) HandlePublish(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeErr(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := s.RequestPublish(r.Context(), id); err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusAccepted)
}

// HandleChannel GET /v1/students/{id}/channel (optional auth).
func (s *Service) HandleChannel(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeErr(w, http.StatusBadRequest, "invalid id")
		return
	}
	v := Viewer{}
	if uid, ok := auth.UserIDFromCtx(r); ok {
		v.UserID = uid
	}
	if role, ok := auth.RoleFromCtx(r); ok {
		v.Role = role
	}
	ch, err := s.GetChannel(r.Context(), id, v)
	if err != nil {
		writeErr(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, ch)
}

// HandleMuxWebhookHTTP POST /v1/webhooks/mux.
func (s *Service) HandleMuxWebhookHTTP(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		writeErr(w, http.StatusBadRequest, "read body")
		return
	}
	defer r.Body.Close()
	sig := r.Header.Get("Mux-Signature")
	if err := s.mux.VerifyWebhook(sig, body); err != nil {
		writeErr(w, http.StatusUnauthorized, "bad signature")
		return
	}
	var evt MuxEvent
	if err := json.Unmarshal(body, &evt); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid json")
		return
	}
	if err := s.HandleMuxWebhook(r.Context(), evt); err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func readJSON(r *http.Request, v any) error {
	defer r.Body.Close()
	b, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		return err
	}
	return json.Unmarshal(b, v)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
