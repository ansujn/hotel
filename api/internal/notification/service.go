package notification

import (
	"context"

	"github.com/google/uuid"
)

// Service wraps a Store with business logic for notifications.
type Service struct {
	store Store
}

// New creates a notification Service.
func New(store Store) *Service {
	return &Service{store: store}
}

func (s *Service) List(ctx context.Context, userID uuid.UUID) ([]Notification, error) {
	out, err := s.store.List(ctx, userID)
	if err != nil {
		return nil, err
	}
	if out == nil {
		out = []Notification{}
	}
	return out, nil
}

func (s *Service) UnreadCount(ctx context.Context, userID uuid.UUID) (int, error) {
	return s.store.UnreadCount(ctx, userID)
}

func (s *Service) MarkRead(ctx context.Context, id, userID uuid.UUID) error {
	return s.store.MarkRead(ctx, id, userID)
}

func (s *Service) MarkAllRead(ctx context.Context, userID uuid.UUID) error {
	return s.store.MarkAllRead(ctx, userID)
}

func (s *Service) Create(ctx context.Context, n Notification) error {
	return s.store.Create(ctx, n)
}
