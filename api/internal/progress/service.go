package progress

import (
	"context"
	"math"
)

// Store abstracts DB access for testability.
type Store interface {
	// RubricAverageForStudent returns per-dimension averages.
	RubricAverageForStudent(ctx context.Context, studentID string) ([]DimScore, error)
	// TimelineForStudent returns scored assessments ordered by date desc.
	TimelineForStudent(ctx context.Context, studentID string) ([]Assessment, error)
	// UpsertRubric inserts or updates rubric scores for an asset.
	UpsertRubric(ctx context.Context, assetID, instructorID string, scores map[string]int) error
	// RubricForAsset returns all rubric scores for an asset.
	RubricForAsset(ctx context.Context, assetID string) ([]RubricScore, error)
	// CreateNote inserts a note.
	CreateNote(ctx context.Context, assetID, authorID, body string, private bool) (*Note, error)
	// ListNotes returns notes for an asset, optionally including private ones.
	ListNotes(ctx context.Context, assetID string, includePrivate bool) ([]Note, error)
}

// Service owns the progress/rubric/notes domain.
type Service struct {
	store Store
}

// New creates a new progress service.
func New(store Store) *Service {
	return &Service{store: store}
}

// GetStudentProgress returns the radar-chart averages + assessment timeline.
func (s *Service) GetStudentProgress(ctx context.Context, studentID string) (*ProgressReport, error) {
	avgs, err := s.store.RubricAverageForStudent(ctx, studentID)
	if err != nil {
		return nil, err
	}
	timeline, err := s.store.TimelineForStudent(ctx, studentID)
	if err != nil {
		return nil, err
	}
	if avgs == nil {
		avgs = []DimScore{}
	}
	if timeline == nil {
		timeline = []Assessment{}
	}
	return &ProgressReport{Averages: avgs, Timeline: timeline}, nil
}

// ScoreAsset upserts rubric scores for an asset.
func (s *Service) ScoreAsset(ctx context.Context, assetID, instructorID string, scores map[string]int) error {
	return s.store.UpsertRubric(ctx, assetID, instructorID, scores)
}

// GetAssetRubric returns all rubric scores for an asset.
func (s *Service) GetAssetRubric(ctx context.Context, assetID string) ([]RubricScore, error) {
	out, err := s.store.RubricForAsset(ctx, assetID)
	if err != nil {
		return nil, err
	}
	if out == nil {
		out = []RubricScore{}
	}
	return out, nil
}

// AddNote creates a note on an asset.
func (s *Service) AddNote(ctx context.Context, assetID, authorID, body string, private bool) (*Note, error) {
	return s.store.CreateNote(ctx, assetID, authorID, body, private)
}

// GetNotes returns notes for an asset. Private notes are only included for admin/instructor.
func (s *Service) GetNotes(ctx context.Context, assetID string, includePrivate bool) ([]Note, error) {
	out, err := s.store.ListNotes(ctx, assetID, includePrivate)
	if err != nil {
		return nil, err
	}
	if out == nil {
		out = []Note{}
	}
	return out, nil
}

// ComputeAverages is a helper for tests — given raw dimension->scores, returns rounded averages.
func ComputeAverages(scores map[string][]int) []DimScore {
	out := make([]DimScore, 0, len(scores))
	for dim, vals := range scores {
		if len(vals) == 0 {
			continue
		}
		sum := 0
		for _, v := range vals {
			sum += v
		}
		avg := math.Round(float64(sum) / float64(len(vals)))
		out = append(out, DimScore{Dimension: dim, Score: int(avg)})
	}
	return out
}
