package asset

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"

	"github.com/viktheatre/api/internal/platform/config"
	"github.com/viktheatre/api/internal/platform/mux"
)

type fakeStore struct {
	assets   map[string]*Asset
	uploads  map[string]string // uploadID -> assetID
	audit    int
}

func newFakeStore() *fakeStore {
	return &fakeStore{assets: map[string]*Asset{}, uploads: map[string]string{}}
}

func (f *fakeStore) InsertAsset(_ context.Context, studentID uuid.UUID, kind, title string) (*Asset, error) {
	id := uuid.NewString()
	a := &Asset{ID: id, StudentID: studentID.String(), Type: kind, Title: title, Privacy: "private", CreatedAt: time.Now()}
	f.assets[id] = a
	return a, nil
}
func (f *fakeStore) GetAsset(_ context.Context, id uuid.UUID) (*Asset, error) {
	return f.assets[id.String()], nil
}
func (f *fakeStore) SetMuxIDs(_ context.Context, id uuid.UUID, muxAssetID, playback string, dur int32) error {
	a := f.assets[id.String()]
	a.MuxPlaybackID = &playback
	a.DurationS = &dur
	return nil
}
func (f *fakeStore) UpdatePrivacy(_ context.Context, id uuid.UUID, p string) error {
	f.assets[id.String()].Privacy = p
	return nil
}
func (f *fakeStore) SetUploadID(_ context.Context, id uuid.UUID, uploadID string) error {
	f.uploads[uploadID] = id.String()
	return nil
}
func (f *fakeStore) GetByUploadID(_ context.Context, uploadID string) (*Asset, error) {
	return f.assets[f.uploads[uploadID]], nil
}
func (f *fakeStore) ListForStudent(_ context.Context, studentID uuid.UUID, privateToo bool) ([]Asset, error) {
	var out []Asset
	for _, a := range f.assets {
		if a.StudentID != studentID.String() {
			continue
		}
		if !privateToo && a.Privacy != "public" {
			continue
		}
		out = append(out, *a)
	}
	return out, nil
}
func (f *fakeStore) LoadStudent(_ context.Context, id uuid.UUID) (*StudentSummary, error) {
	return &StudentSummary{ID: id.String(), Role: "student", Locale: "en"}, nil
}
func (f *fakeStore) InsertRubric(_ context.Context, _ uuid.UUID, _ map[string]int, _ uuid.UUID) error {
	return nil
}
func (f *fakeStore) InsertAudit(_ context.Context, _ *uuid.UUID, _, _ string, _ map[string]any) error {
	f.audit++
	return nil
}

func TestCreateAsset_HappyPath(t *testing.T) {
	store := newFakeStore()
	svc := New(store, mux.New(mux.Config{}), &config.Config{AppEnv: "local"})
	studentID := uuid.New()

	a, url, err := svc.CreateAsset(context.Background(), studentID, "monologue", "My Audition", "", nil, nil)
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if a.Privacy != "private" {
		t.Fatalf("privacy = %s, want private", a.Privacy)
	}
	if url == "" {
		t.Fatal("empty upload url")
	}
	if len(store.uploads) != 1 {
		t.Fatalf("upload id not stored")
	}
	if store.audit == 0 {
		t.Fatal("audit not written")
	}
}

func TestHandleMuxWebhook_AssetReady(t *testing.T) {
	store := newFakeStore()
	svc := New(store, mux.New(mux.Config{}), &config.Config{AppEnv: "local"})
	studentID := uuid.New()
	_, _, err := svc.CreateAsset(context.Background(), studentID, "scene", "T", "", nil, nil)
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	var uploadID string
	for u := range store.uploads {
		uploadID = u
	}

	evt := MuxEvent{Type: "video.asset.ready"}
	evt.Data.ID = "asset_123"
	evt.Data.Upload.ID = uploadID
	evt.Data.PlaybackIDs = []struct {
		ID     string `json:"id"`
		Policy string `json:"policy"`
	}{{ID: "pb_abc", Policy: "signed"}}
	evt.Data.Duration = 42

	if err := svc.HandleMuxWebhook(context.Background(), evt); err != nil {
		t.Fatalf("webhook: %v", err)
	}
	a := store.assets[store.uploads[uploadID]]
	if a.MuxPlaybackID == nil || *a.MuxPlaybackID != "pb_abc" {
		t.Fatalf("playback id not set")
	}
	if a.DurationS == nil || *a.DurationS != 42 {
		t.Fatalf("duration not set")
	}
}
