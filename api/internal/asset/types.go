package asset

import "time"

// Asset mirrors the openapi Asset schema.
type Asset struct {
	ID             string    `json:"id"`
	StudentID      string    `json:"student_id,omitempty"`
	Title          string    `json:"title"`
	Type           string    `json:"type"`
	MuxPlaybackID  *string   `json:"mux_playback_id,omitempty"`
	DurationS      *int32    `json:"duration_s,omitempty"`
	Privacy        string    `json:"privacy"`
	CreatedAt      time.Time `json:"created_at"`
}

// Channel is the GET /students/{id}/channel response.
type Channel struct {
	Student StudentSummary `json:"student"`
	Assets  []Asset        `json:"assets"`
}

type StudentSummary struct {
	ID     string  `json:"id"`
	Name   *string `json:"name,omitempty"`
	Role   string  `json:"role"`
	Locale string  `json:"locale"`
}

// Viewer describes who is calling a privacy-gated endpoint.
type Viewer struct {
	UserID string
	Role   string // empty = anonymous
}

// CanSeePrivate reports whether the viewer is entitled to private assets.
func (v Viewer) CanSeePrivate(studentID string) bool {
	switch v.Role {
	case "admin", "instructor":
		return true
	case "student":
		return v.UserID == studentID
	case "parent":
		// parent linkage check is out of scope for Phase 2; admin/instructor/self only.
		return false
	}
	return false
}

// MuxEvent is the subset of the Mux webhook payload we consume.
type MuxEvent struct {
	Type string `json:"type"`
	Data struct {
		ID         string `json:"id"`           // asset id
		PlaybackIDs []struct {
			ID     string `json:"id"`
			Policy string `json:"policy"`
		} `json:"playback_ids"`
		Duration float64 `json:"duration"`
		Upload   struct {
			ID string `json:"id"`
		} `json:"upload"`
		UploadID string `json:"upload_id"`
	} `json:"data"`
}
