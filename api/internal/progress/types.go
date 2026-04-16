package progress

import "time"

// DimScore represents a single rubric dimension average.
type DimScore struct {
	Dimension string `json:"dimension"`
	Score     int    `json:"score"`
}

// Assessment is one scored performance in the timeline.
type Assessment struct {
	Date       time.Time  `json:"date"`
	AssetID    string     `json:"asset_id"`
	AssetTitle string     `json:"asset_title"`
	Scores     []DimScore `json:"scores"`
	Note       string     `json:"note,omitempty"`
}

// ProgressReport is the full student progress response.
type ProgressReport struct {
	Averages []DimScore   `json:"averages"`
	Timeline []Assessment `json:"timeline"`
}

// RubricScore mirrors a single rubric_scores row.
type RubricScore struct {
	ID           string    `json:"id"`
	AssetID      string    `json:"asset_id"`
	Dimension    string    `json:"dimension"`
	Score        int       `json:"score"`
	InstructorID string    `json:"instructor_id"`
	ScoredAt     time.Time `json:"scored_at"`
}

// Note mirrors a single notes row.
type Note struct {
	ID        string    `json:"id"`
	AssetID   string    `json:"asset_id"`
	AuthorID  string    `json:"author_id"`
	Body      string    `json:"body"`
	Private   bool      `json:"private"`
	CreatedAt time.Time `json:"created_at"`
}
