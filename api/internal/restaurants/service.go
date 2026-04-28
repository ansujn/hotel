package restaurants

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
)

// Mailer is an optional dependency: when nil, verification links are logged.
type Mailer interface {
	SendVerification(ctx context.Context, toEmail, toName, verifyURL string) error
}

// Service is the business-logic layer for restaurants/videos/images/reviews.
type Service struct {
	store         Store
	adminPassword string
	appBaseURL    string
	mailer        Mailer
}

// New creates a Service.
func New(store Store, adminPassword, appBaseURL string, mailer Mailer) *Service {
	return &Service{
		store:         store,
		adminPassword: adminPassword,
		appBaseURL:    appBaseURL,
		mailer:        mailer,
	}
}

// AdminPasswordOK reports whether the supplied secret matches ADMIN_PASSWORD.
// Empty admin password disables admin endpoints (returns false).
func (s *Service) AdminPasswordOK(provided string) bool {
	if s.adminPassword == "" {
		return false
	}
	return provided == s.adminPassword
}

// List returns paginated restaurant cards.
func (s *Service) List(ctx context.Context, f ListFilters) (ListResult, error) {
	return s.store.List(ctx, f)
}

// Get returns a single restaurant detail.
func (s *Service) Get(ctx context.Context, id uuid.UUID) (*RestaurantDetail, error) {
	return s.store.Get(ctx, id)
}

// ListVideos returns all videos for a restaurant.
func (s *Service) ListVideos(ctx context.Context, restaurantID uuid.UUID) ([]VideoItem, error) {
	return s.store.ListVideos(ctx, restaurantID)
}

// CreateVideo persists a new video record (Phase 2 will wire Mux ingest).
func (s *Service) CreateVideo(ctx context.Context, restaurantID uuid.UUID, req CreateVideoReq) (*VideoItem, error) {
	if strings.TrimSpace(req.Title) == "" {
		return nil, errors.New("title required")
	}
	if req.Type == "" {
		req.Type = "ambiance"
	}
	return s.store.InsertVideo(ctx, restaurantID, req)
}

// ListImages returns all images for a restaurant.
func (s *Service) ListImages(ctx context.Context, restaurantID uuid.UUID) ([]ImageItem, error) {
	return s.store.ListImages(ctx, restaurantID)
}

// CreateImage stores a new image row.
func (s *Service) CreateImage(ctx context.Context, restaurantID uuid.UUID, req CreateImageReq) (*ImageItem, error) {
	if strings.TrimSpace(req.URL) == "" {
		return nil, errors.New("url required")
	}
	if req.Type == "" {
		req.Type = "gallery"
	}
	return s.store.InsertImage(ctx, restaurantID, req)
}

// ListReviews returns paginated reviews for a restaurant.
func (s *Service) ListReviews(ctx context.Context, restaurantID uuid.UUID, page, limit int) (ReviewListResult, error) {
	return s.store.ListReviews(ctx, restaurantID, page, limit)
}

// CreateReview validates input, persists an unverified review, and triggers
// email verification. The review is invisible to the public until the user
// follows the verification link.
func (s *Service) CreateReview(ctx context.Context, req CreateReviewReq) (*Review, error) {
	if req.RestaurantID == uuid.Nil {
		return nil, errors.New("restaurant_id required")
	}
	if strings.TrimSpace(req.UserName) == "" {
		return nil, errors.New("user_name required")
	}
	if !looksLikeEmail(req.UserEmail) {
		return nil, errors.New("user_email invalid")
	}
	if req.Rating < 1 || req.Rating > 5 {
		return nil, errors.New("rating must be 1..5")
	}

	token, err := randomToken(24)
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}

	rev, err := s.store.InsertReview(ctx, req, token)
	if err != nil {
		return nil, err
	}

	verifyURL := fmt.Sprintf("%s/reviews/verify?token=%s", strings.TrimRight(s.appBaseURL, "/"), token)
	if s.mailer != nil {
		_ = s.mailer.SendVerification(ctx, req.UserEmail, req.UserName, verifyURL)
	} else {
		// Local fallback: log the link so it can be copy-pasted in dev.
		fmt.Printf("[review-verify] %s -> %s\n", req.UserEmail, verifyURL)
	}
	return rev, nil
}

// VerifyReview marks a review as email-verified, making it publicly visible.
func (s *Service) VerifyReview(ctx context.Context, token string) error {
	if token == "" {
		return errors.New("token required")
	}
	return s.store.VerifyReview(ctx, token)
}

// ----- helpers -------------------------------------------------------------

func randomToken(nBytes int) (string, error) {
	b := make([]byte, nBytes)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func looksLikeEmail(s string) bool {
	at := strings.IndexByte(s, '@')
	if at < 1 || at == len(s)-1 {
		return false
	}
	dot := strings.LastIndexByte(s, '.')
	return dot > at+1
}
