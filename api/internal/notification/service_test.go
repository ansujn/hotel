package notification

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
)

type fakeStore struct {
	items map[uuid.UUID]*Notification
}

func newFakeStore() *fakeStore {
	return &fakeStore{items: make(map[uuid.UUID]*Notification)}
}

func (f *fakeStore) List(_ context.Context, userID uuid.UUID) ([]Notification, error) {
	var out []Notification
	for _, n := range f.items {
		if n.UserID == userID {
			out = append(out, *n)
		}
	}
	return out, nil
}

func (f *fakeStore) UnreadCount(_ context.Context, userID uuid.UUID) (int, error) {
	c := 0
	for _, n := range f.items {
		if n.UserID == userID && n.ReadAt == nil {
			c++
		}
	}
	return c, nil
}

func (f *fakeStore) MarkRead(_ context.Context, id, userID uuid.UUID) error {
	if n, ok := f.items[id]; ok && n.UserID == userID && n.ReadAt == nil {
		now := time.Now()
		n.ReadAt = &now
	}
	return nil
}

func (f *fakeStore) MarkAllRead(_ context.Context, userID uuid.UUID) error {
	now := time.Now()
	for _, n := range f.items {
		if n.UserID == userID && n.ReadAt == nil {
			n.ReadAt = &now
		}
	}
	return nil
}

func (f *fakeStore) Create(_ context.Context, n Notification) error {
	cp := n
	f.items[n.ID] = &cp
	return nil
}

func TestMarkAllRead_FlipsEverything(t *testing.T) {
	store := newFakeStore()
	svc := New(store)
	userID := uuid.New()

	for i := 0; i < 3; i++ {
		if err := svc.Create(context.Background(), Notification{
			ID: uuid.New(), UserID: userID, Kind: "feedback", Title: "t", CreatedAt: time.Now(),
		}); err != nil {
			t.Fatal(err)
		}
	}

	c, _ := svc.UnreadCount(context.Background(), userID)
	if c != 3 {
		t.Fatalf("expected 3 unread, got %d", c)
	}

	if err := svc.MarkAllRead(context.Background(), userID); err != nil {
		t.Fatal(err)
	}
	c, _ = svc.UnreadCount(context.Background(), userID)
	if c != 0 {
		t.Fatalf("expected 0 unread after MarkAllRead, got %d", c)
	}
}
