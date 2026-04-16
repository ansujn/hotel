package social

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
)

// fakeStore implements Store for testing.
type fakeStore struct {
	posts []SocialPost
}

func (f *fakeStore) ListConsentedAssets(_ context.Context) ([]ConsentedAsset, error) {
	return []ConsentedAsset{{ID: "a1", Title: "Hamlet"}}, nil
}

func (f *fakeStore) InsertPost(_ context.Context, req CreatePostReq) (*SocialPost, error) {
	p := SocialPost{
		ID:        uuid.New().String(),
		AssetID:   &req.AssetID,
		Platforms: req.Platforms,
		Caption:   req.Caption,
		Status:    "queued",
		CreatedAt: time.Now(),
	}
	if req.ScheduledAt != "" {
		p.ScheduledAt = &req.ScheduledAt
	}
	f.posts = append(f.posts, p)
	return &p, nil
}

func (f *fakeStore) ListPosts(_ context.Context, weekStart time.Time) ([]SocialPost, error) {
	weekEnd := weekStart.AddDate(0, 0, 7)
	var out []SocialPost
	for _, p := range f.posts {
		if p.ScheduledAt != nil {
			t, _ := time.Parse(time.RFC3339, *p.ScheduledAt)
			if !t.Before(weekStart) && t.Before(weekEnd) {
				out = append(out, p)
			}
		}
	}
	return out, nil
}

func (f *fakeStore) GetPost(_ context.Context, id uuid.UUID) (*SocialPost, error) {
	for _, p := range f.posts {
		if p.ID == id.String() {
			return &p, nil
		}
	}
	return nil, nil
}

func (f *fakeStore) UpdatePostBuffer(_ context.Context, id uuid.UUID, bufferID string, status string) error {
	for i, p := range f.posts {
		if p.ID == id.String() {
			f.posts[i].BufferID = &bufferID
			f.posts[i].Status = status
		}
	}
	return nil
}

func TestCreatePost(t *testing.T) {
	store := &fakeStore{}
	svc := New(store, nil, nil)

	post, err := svc.CreatePost(context.Background(), CreatePostReq{
		AssetID:     uuid.New().String(),
		Platforms:   []string{"ig_reel", "yt_short"},
		Caption:     "Amazing performance!",
		ScheduledAt: "2026-04-16T10:00:00Z",
	})
	if err != nil {
		t.Fatal(err)
	}
	if post.Status != "queued" {
		t.Errorf("expected status=queued, got %s", post.Status)
	}
	if len(post.Platforms) != 2 {
		t.Errorf("expected 2 platforms, got %d", len(post.Platforms))
	}
	if len(store.posts) != 1 {
		t.Errorf("expected 1 stored post, got %d", len(store.posts))
	}
}

func TestCreatePost_NoPlatforms(t *testing.T) {
	svc := New(&fakeStore{}, nil, nil)
	_, err := svc.CreatePost(context.Background(), CreatePostReq{
		Caption: "test",
	})
	if err == nil {
		t.Fatal("expected error for empty platforms")
	}
}

func TestListPostsFiltersByWeek(t *testing.T) {
	store := &fakeStore{}
	svc := New(store, nil, nil)

	// Post in target week.
	svc.CreatePost(context.Background(), CreatePostReq{
		AssetID:     uuid.New().String(),
		Platforms:   []string{"fb"},
		Caption:     "In range",
		ScheduledAt: "2026-04-15T10:00:00Z",
	})
	// Post outside target week.
	svc.CreatePost(context.Background(), CreatePostReq{
		AssetID:     uuid.New().String(),
		Platforms:   []string{"fb"},
		Caption:     "Out of range",
		ScheduledAt: "2026-04-25T10:00:00Z",
	})

	week := time.Date(2026, 4, 13, 0, 0, 0, 0, time.UTC) // Monday Apr 13
	posts, err := svc.ListPosts(context.Background(), week)
	if err != nil {
		t.Fatal(err)
	}
	if len(posts) != 1 {
		t.Errorf("expected 1 post in week, got %d", len(posts))
	}
}
