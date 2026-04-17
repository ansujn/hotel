package asset

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/viktheatre/api/internal/platform/config"
	"github.com/viktheatre/api/internal/platform/mux"
)

// Store is the subset of the database accessed by the asset service. It is
// an interface (not *pgxpool.Pool directly) so tests can provide a fake.
type Store interface {
	InsertAsset(ctx context.Context, studentID uuid.UUID, kind, title string) (*Asset, error)
	GetAsset(ctx context.Context, id uuid.UUID) (*Asset, error)
	SetMuxIDs(ctx context.Context, id uuid.UUID, muxAssetID, playbackID string, durationS int32) error
	UpdatePrivacy(ctx context.Context, id uuid.UUID, privacy string) error
	SetUploadID(ctx context.Context, id uuid.UUID, uploadID string) error
	GetByUploadID(ctx context.Context, uploadID string) (*Asset, error)
	ListForStudent(ctx context.Context, studentID uuid.UUID, privateToo bool) ([]Asset, error)
	LoadStudent(ctx context.Context, id uuid.UUID) (*StudentSummary, error)
	InsertRubric(ctx context.Context, assetID uuid.UUID, rubric map[string]int, instructorID uuid.UUID) error
	InsertAudit(ctx context.Context, actorID *uuid.UUID, action, target string, meta map[string]any) error
}

// ConsentRequester is the edge into the consent package. The asset service
// only needs to request a consent email/SMS — it does NOT sign consents.
type ConsentRequester interface {
	IssueConsentRequest(ctx context.Context, assetID uuid.UUID, studentID uuid.UUID) error
}

// Service owns asset lifecycle: create (+ direct upload URL), publish
// (trigger consent request), reconcile via Mux webhook, and read channels.
type Service struct {
	store   Store
	mux     *mux.Client
	cfg     *config.Config
	consent ConsentRequester
}

func New(store Store, muxClient *mux.Client, cfg *config.Config) *Service {
	return &Service{store: store, mux: muxClient, cfg: cfg}
}

// WireConsent attaches the consent requester after both services are built
// (they reference each other's packages, so we wire post-construction).
func (s *Service) WireConsent(c ConsentRequester) { s.consent = c }

// CreateAsset inserts a private asset and requests a direct upload URL.
func (s *Service) CreateAsset(
	ctx context.Context,
	studentID uuid.UUID,
	kind, title, _note string,
	rubric map[string]int,
	actorID *uuid.UUID,
) (*Asset, string, error) {
	if kind == "" || title == "" {
		return nil, "", errors.New("type and title required")
	}
	a, err := s.store.InsertAsset(ctx, studentID, kind, title)
	if err != nil {
		return nil, "", fmt.Errorf("insert asset: %w", err)
	}

	uploadURL, uploadID, err := s.mux.CreateDirectUpload(ctx)
	if err != nil {
		return nil, "", fmt.Errorf("mux upload: %w", err)
	}
	if err := s.store.SetUploadID(ctx, uuid.MustParse(a.ID), uploadID); err != nil {
		return nil, "", fmt.Errorf("persist upload id: %w", err)
	}

	if len(rubric) > 0 && actorID != nil {
		_ = s.store.InsertRubric(ctx, uuid.MustParse(a.ID), rubric, *actorID)
	}
	_ = s.store.InsertAudit(ctx, actorID, "asset.create", a.ID, map[string]any{
		"type": kind, "student_id": studentID.String(),
	})

	return a, uploadURL, nil
}

// GetChannel returns the student info + assets visible to the viewer.
func (s *Service) GetChannel(ctx context.Context, studentID uuid.UUID, v Viewer) (*Channel, error) {
	stu, err := s.store.LoadStudent(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("load student: %w", err)
	}
	privateToo := v.CanSeePrivate(studentID.String())
	assets, err := s.store.ListForStudent(ctx, studentID, privateToo)
	if err != nil {
		return nil, fmt.Errorf("list assets: %w", err)
	}
	if assets == nil {
		assets = []Asset{}
	}
	return &Channel{Student: *stu, Assets: assets}, nil
}

// HandleMuxWebhook reconciles asset rows on video.asset.ready.
func (s *Service) HandleMuxWebhook(ctx context.Context, evt MuxEvent) error {
	switch evt.Type {
	case "video.asset.ready":
		uploadID := evt.Data.Upload.ID
		if uploadID == "" {
			uploadID = evt.Data.UploadID
		}
		if uploadID == "" {
			return errors.New("webhook missing upload id")
		}
		a, err := s.store.GetByUploadID(ctx, uploadID)
		if err != nil {
			return fmt.Errorf("lookup by upload id: %w", err)
		}
		var playback string
		for _, p := range evt.Data.PlaybackIDs {
			playback = p.ID
			break
		}
		dur := int32(evt.Data.Duration)
		return s.store.SetMuxIDs(ctx, uuid.MustParse(a.ID), evt.Data.ID, playback, dur)
	default:
		return nil // ignore
	}
}

// RequestPublish flips asset privacy to pending_consent and asks the
// consent service to dispatch the parent notification.
func (s *Service) RequestPublish(ctx context.Context, assetID uuid.UUID) error {
	a, err := s.store.GetAsset(ctx, assetID)
	if err != nil {
		return fmt.Errorf("get asset: %w", err)
	}
	if err := s.store.UpdatePrivacy(ctx, assetID, "pending_consent"); err != nil {
		return fmt.Errorf("mark pending_consent: %w", err)
	}
	if s.consent == nil {
		return errors.New("consent service not wired")
	}
	studentID := uuid.MustParse(a.StudentID)
	if err := s.consent.IssueConsentRequest(ctx, assetID, studentID); err != nil {
		return fmt.Errorf("issue consent request: %w", err)
	}
	_ = s.store.InsertAudit(ctx, nil, "asset.request_publish", assetID.String(), nil)
	return nil
}

// now is exposed for tests.
var now = time.Now
