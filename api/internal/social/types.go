package social

import "time"

// SocialPost mirrors the social_posts table.
type SocialPost struct {
	ID          string    `json:"id"`
	AssetID     *string   `json:"asset_id,omitempty"`
	Platforms   []string  `json:"platforms"`
	Caption     string    `json:"caption"`
	ScheduledAt *string   `json:"scheduled_at,omitempty"` // RFC3339
	BufferID    *string   `json:"buffer_id,omitempty"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`

	// Joined fields (from asset + student).
	AssetTitle  *string `json:"asset_title,omitempty"`
	StudentName *string `json:"student_name,omitempty"`
	Thumbnail   *string `json:"thumbnail,omitempty"`
}

// CreatePostReq is the body for POST /admin/social/posts.
type CreatePostReq struct {
	AssetID     string   `json:"asset_id"`
	Platforms   []string `json:"platforms"` // e.g. ["ig_reel","yt_short","fb","linkedin"]
	Caption     string   `json:"caption"`
	ScheduledAt string   `json:"scheduled_at"` // RFC3339
}

// ConsentedAsset is an asset eligible for social posting.
type ConsentedAsset struct {
	ID            string  `json:"id"`
	Title         string  `json:"title"`
	StudentName   *string `json:"student_name,omitempty"`
	MuxPlaybackID *string `json:"mux_playback_id,omitempty"`
	DurationS     *int32  `json:"duration_s,omitempty"`
	Thumbnail     *string `json:"thumbnail,omitempty"`
}

// ClipSuggestion represents an AI-suggested clip from a longer video.
type ClipSuggestion struct {
	StartS int    `json:"start_s"`
	EndS   int    `json:"end_s"`
	Title  string `json:"title"`
	Reason string `json:"reason"`
}
