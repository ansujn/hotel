package asset

import (
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// HandleStubUpload is the dev-only PUT /v1/dev/mux-upload/{uploadID} receiver
// that replaces the real Mux upload endpoint when running without credentials.
// It discards the bytes, then marks the asset ready with a fake playback_id
// so the UI progress bar and subsequent Mux-player render path both work.
func (s *Service) HandleStubUpload(w http.ResponseWriter, r *http.Request) {
	uploadID := chi.URLParam(r, "uploadID")
	if uploadID == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Drain the body so the browser sees a completed PUT.
	_, _ = io.Copy(io.Discard, r.Body)
	_ = r.Body.Close()

	a, err := s.store.GetByUploadID(r.Context(), uploadID)
	if err == nil && a != nil {
		assetID := uuid.MustParse(a.ID)
		fakeMuxAssetID := "stub_asset_" + uploadID
		fakePlaybackID := "stub_" + uploadID
		_ = s.store.SetMuxIDs(r.Context(), assetID, fakeMuxAssetID, fakePlaybackID, 0)
	}

	w.WriteHeader(http.StatusOK)
}
