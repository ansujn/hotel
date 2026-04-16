package progress

import (
	"context"
	"sort"
	"testing"
	"time"
)

// fakeStore implements Store for testing.
type fakeStore struct {
	averages []DimScore
	timeline []Assessment
	rubric   []RubricScore
	notes    []Note
}

func (f *fakeStore) RubricAverageForStudent(_ context.Context, _ string) ([]DimScore, error) {
	return f.averages, nil
}
func (f *fakeStore) TimelineForStudent(_ context.Context, _ string) ([]Assessment, error) {
	return f.timeline, nil
}
func (f *fakeStore) UpsertRubric(_ context.Context, assetID, instructorID string, scores map[string]int) error {
	for dim, score := range scores {
		f.rubric = append(f.rubric, RubricScore{
			AssetID:      assetID,
			Dimension:    dim,
			Score:        score,
			InstructorID: instructorID,
			ScoredAt:     time.Now(),
		})
	}
	return nil
}
func (f *fakeStore) RubricForAsset(_ context.Context, _ string) ([]RubricScore, error) {
	return f.rubric, nil
}
func (f *fakeStore) CreateNote(_ context.Context, assetID, authorID, body string, private bool) (*Note, error) {
	n := &Note{ID: "note-1", AssetID: assetID, AuthorID: authorID, Body: body, Private: private, CreatedAt: time.Now()}
	f.notes = append(f.notes, *n)
	return n, nil
}
func (f *fakeStore) ListNotes(_ context.Context, _ string, includePrivate bool) ([]Note, error) {
	if includePrivate {
		return f.notes, nil
	}
	var out []Note
	for _, n := range f.notes {
		if !n.Private {
			out = append(out, n)
		}
	}
	return out, nil
}

func TestGetStudentProgress_EmptyReturnsDefaults(t *testing.T) {
	svc := New(&fakeStore{})
	report, err := svc.GetStudentProgress(context.Background(), "student-1")
	if err != nil {
		t.Fatal(err)
	}
	if len(report.Averages) != 0 {
		t.Errorf("expected 0 averages, got %d", len(report.Averages))
	}
	if len(report.Timeline) != 0 {
		t.Errorf("expected 0 timeline, got %d", len(report.Timeline))
	}
}

func TestGetStudentProgress_ReturnsFakeData(t *testing.T) {
	store := &fakeStore{
		averages: []DimScore{
			{Dimension: "Diction", Score: 85},
			{Dimension: "Confidence", Score: 72},
		},
		timeline: []Assessment{
			{Date: time.Now(), AssetTitle: "Hamlet", Scores: []DimScore{{Dimension: "Diction", Score: 90}}},
		},
	}
	svc := New(store)
	report, err := svc.GetStudentProgress(context.Background(), "student-1")
	if err != nil {
		t.Fatal(err)
	}
	if len(report.Averages) != 2 {
		t.Errorf("expected 2 averages, got %d", len(report.Averages))
	}
	if len(report.Timeline) != 1 {
		t.Errorf("expected 1 timeline entry, got %d", len(report.Timeline))
	}
}

func TestComputeAverages(t *testing.T) {
	scores := map[string][]int{
		"Diction":    {80, 90},
		"Confidence": {70, 74, 76},
	}
	avgs := ComputeAverages(scores)
	sort.Slice(avgs, func(i, j int) bool { return avgs[i].Dimension < avgs[j].Dimension })
	if avgs[0].Dimension != "Confidence" || avgs[0].Score != 73 {
		t.Errorf("Confidence: expected 73, got %d", avgs[0].Score)
	}
	if avgs[1].Dimension != "Diction" || avgs[1].Score != 85 {
		t.Errorf("Diction: expected 85, got %d", avgs[1].Score)
	}
}

func TestScoreAsset(t *testing.T) {
	store := &fakeStore{}
	svc := New(store)
	err := svc.ScoreAsset(context.Background(), "asset-1", "instr-1", map[string]int{
		"Diction": 85, "Stage Presence": 90,
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(store.rubric) != 2 {
		t.Errorf("expected 2 rubric entries, got %d", len(store.rubric))
	}
}

func TestNotes_PrivateFiltering(t *testing.T) {
	store := &fakeStore{}
	svc := New(store)
	_, _ = svc.AddNote(context.Background(), "asset-1", "instr-1", "Good diction", false)
	_, _ = svc.AddNote(context.Background(), "asset-1", "instr-1", "Needs work on timing", true)

	all, _ := svc.GetNotes(context.Background(), "asset-1", true)
	if len(all) != 2 {
		t.Errorf("expected 2 notes with private, got %d", len(all))
	}
	pub, _ := svc.GetNotes(context.Background(), "asset-1", false)
	if len(pub) != 1 {
		t.Errorf("expected 1 public note, got %d", len(pub))
	}
}
