package social

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

// Service handles social posting and AI clip suggestions.
type Service struct {
	store  Store
	buffer BufferClient
	log    *zap.Logger
}

// New creates a social service.
func New(store Store, buffer BufferClient, log *zap.Logger) *Service {
	return &Service{store: store, buffer: buffer, log: log}
}

// ListConsentedAssets returns assets with public privacy and social consent.
func (s *Service) ListConsentedAssets(ctx context.Context) ([]ConsentedAsset, error) {
	return s.store.ListConsentedAssets(ctx)
}

// CreatePost inserts a new social post.
func (s *Service) CreatePost(ctx context.Context, req CreatePostReq) (*SocialPost, error) {
	if len(req.Platforms) == 0 {
		return nil, fmt.Errorf("at least one platform required")
	}
	if req.Caption == "" {
		return nil, fmt.Errorf("caption is required")
	}
	return s.store.InsertPost(ctx, req)
}

// ListPosts returns posts for a given week.
func (s *Service) ListPosts(ctx context.Context, week time.Time) ([]SocialPost, error) {
	return s.store.ListPosts(ctx, week)
}

// SchedulePost pushes a post to Buffer.
func (s *Service) SchedulePost(ctx context.Context, postID uuid.UUID) error {
	post, err := s.store.GetPost(ctx, postID)
	if err != nil {
		return err
	}
	if post == nil {
		return fmt.Errorf("post not found")
	}

	var scheduledAt time.Time
	if post.ScheduledAt != nil {
		scheduledAt, _ = time.Parse(time.RFC3339, *post.ScheduledAt)
	}
	if scheduledAt.IsZero() {
		scheduledAt = time.Now().Add(1 * time.Hour)
	}

	mediaURL := ""
	if post.AssetID != nil {
		mediaURL = fmt.Sprintf("https://stream.mux.com/%s.m3u8", *post.AssetID)
	}

	bufferID, err := s.buffer.CreatePost(post.Platforms, post.Caption, mediaURL, scheduledAt)
	if err != nil {
		return fmt.Errorf("buffer: %w", err)
	}

	return s.store.UpdatePostBuffer(ctx, postID, bufferID, "scheduled")
}

// SuggestClips returns AI-suggested clips for a video asset.
// TODO: wire Claude API to analyze transcript and suggest high-impact clips.
func (s *Service) SuggestClips(ctx context.Context, assetID uuid.UUID) ([]ClipSuggestion, error) {
	// Stub: return 3 hardcoded clip suggestions.
	return []ClipSuggestion{
		{
			StartS: 12,
			EndS:   42,
			Title:  "Emotional monologue peak",
			Reason: "Strong vocal projection with dramatic pause — high engagement potential for IG Reels",
		},
		{
			StartS: 65,
			EndS:   95,
			Title:  "Character transformation moment",
			Reason: "Visible shift in body language and tone — perfect for YT Shorts storytelling",
		},
		{
			StartS: 120,
			EndS:   150,
			Title:  "Audience reaction highlight",
			Reason: "Natural charisma and stage presence — great LinkedIn/FB motivational clip",
		},
	}, nil
}
