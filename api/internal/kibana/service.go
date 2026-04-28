package kibana

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Service is the Kibana single-restaurant business logic layer.
// It composes the multi-restaurant Store with Kibana extras.
type Service struct {
	store      Store
	kibanaID   uuid.UUID
}

// New constructs a Service. The kibanaID defaults to the well-known
// constant when uuid.Nil is passed.
func New(store Store, kibanaID uuid.UUID) *Service {
	if kibanaID == uuid.Nil {
		kibanaID = uuid.MustParse(KibanaID)
	}
	return &Service{store: store, kibanaID: kibanaID}
}

// KibanaID returns the configured restaurant UUID for Kibana.
func (s *Service) KibanaID() uuid.UUID { return s.kibanaID }

// ListBanquets returns banquet halls for Kibana.
func (s *Service) ListBanquets(ctx context.Context) ([]BanquetHall, error) {
	return s.store.ListBanquets(ctx, s.kibanaID)
}

// ListMenu returns menu categories with items.
func (s *Service) ListMenu(ctx context.Context) ([]MenuCategory, error) {
	return s.store.ListMenu(ctx, s.kibanaID)
}

// CreateBooking validates input and persists a booking.
func (s *Service) CreateBooking(ctx context.Context, req CreateBookingReq) (*Booking, error) {
	if req.EventType == "" {
		return nil, errors.New("event_type required")
	}
	if req.GuestCount < 1 {
		return nil, errors.New("guest_count must be >= 1")
	}
	if req.EventDate == "" {
		return nil, errors.New("event_date required (YYYY-MM-DD)")
	}
	if _, err := time.Parse("2006-01-02", req.EventDate); err != nil {
		return nil, errors.New("event_date must be YYYY-MM-DD")
	}
	if req.StartTime == "" {
		return nil, errors.New("start_time required (HH:MM)")
	}
	if _, err := time.Parse("15:04", req.StartTime); err != nil {
		return nil, errors.New("start_time must be HH:MM")
	}
	if req.DurationMinutes < 30 {
		return nil, errors.New("duration_minutes must be >= 30")
	}
	if strings.TrimSpace(req.ContactName) == "" {
		return nil, errors.New("contact_name required")
	}
	if strings.TrimSpace(req.ContactPhone) == "" {
		return nil, errors.New("contact_phone required")
	}
	if !looksLikeEmail(req.ContactEmail) {
		return nil, errors.New("contact_email invalid")
	}
	return s.store.InsertBooking(ctx, s.kibanaID, req)
}

func looksLikeEmail(s string) bool {
	at := strings.IndexByte(s, '@')
	if at < 1 || at == len(s)-1 {
		return false
	}
	dot := strings.LastIndexByte(s, '.')
	return dot > at+1
}
