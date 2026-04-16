package progress

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/viktheatre/api/internal/auth"
)

// HandleGetProgress GET /v1/students/{id}/progress (auth required).
func (s *Service) HandleGetProgress(w http.ResponseWriter, r *http.Request) {
	studentID := chi.URLParam(r, "id")
	if studentID == "" {
		writeErr(w, http.StatusBadRequest, "missing student id")
		return
	}
	report, err := s.GetStudentProgress(r.Context(), studentID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, report)
}

type scoreReq struct {
	Scores map[string]int `json:"scores"`
}

// HandleScoreAsset POST /v1/admin/assets/{id}/rubric (admin/instructor only).
func (s *Service) HandleScoreAsset(w http.ResponseWriter, r *http.Request) {
	assetID := chi.URLParam(r, "id")
	if assetID == "" {
		writeErr(w, http.StatusBadRequest, "missing asset id")
		return
	}
	instructorID, ok := auth.UserIDFromCtx(r)
	if !ok {
		writeErr(w, http.StatusUnauthorized, "missing user")
		return
	}
	var req scoreReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	if len(req.Scores) == 0 {
		writeErr(w, http.StatusBadRequest, "scores required")
		return
	}
	if err := s.ScoreAsset(r.Context(), assetID, instructorID, req.Scores); err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// HandleGetRubric GET /v1/assets/{id}/rubric (auth required).
func (s *Service) HandleGetRubric(w http.ResponseWriter, r *http.Request) {
	assetID := chi.URLParam(r, "id")
	if assetID == "" {
		writeErr(w, http.StatusBadRequest, "missing asset id")
		return
	}
	scores, err := s.GetAssetRubric(r.Context(), assetID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	if scores == nil {
		scores = []RubricScore{}
	}
	writeJSON(w, http.StatusOK, scores)
}

type noteReq struct {
	Body    string `json:"body"`
	Private bool   `json:"private"`
}

// HandleAddNote POST /v1/assets/{id}/notes (auth required).
func (s *Service) HandleAddNote(w http.ResponseWriter, r *http.Request) {
	assetID := chi.URLParam(r, "id")
	if assetID == "" {
		writeErr(w, http.StatusBadRequest, "missing asset id")
		return
	}
	authorID, ok := auth.UserIDFromCtx(r)
	if !ok {
		writeErr(w, http.StatusUnauthorized, "missing user")
		return
	}
	var req noteReq
	if err := readJSON(r, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid body")
		return
	}
	if req.Body == "" {
		writeErr(w, http.StatusBadRequest, "body required")
		return
	}
	note, err := s.AddNote(r.Context(), assetID, authorID, req.Body, req.Private)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, note)
}

// HandleGetNotes GET /v1/assets/{id}/notes (auth required, private filtered by role).
func (s *Service) HandleGetNotes(w http.ResponseWriter, r *http.Request) {
	assetID := chi.URLParam(r, "id")
	if assetID == "" {
		writeErr(w, http.StatusBadRequest, "missing asset id")
		return
	}
	role, _ := auth.RoleFromCtx(r)
	includePrivate := role == "admin" || role == "instructor"
	notes, err := s.GetNotes(r.Context(), assetID, includePrivate)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	if notes == nil {
		notes = []Note{}
	}
	writeJSON(w, http.StatusOK, notes)
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
