package social

import (
	"fmt"
	"time"

	"go.uber.org/zap"
)

// BufferClient is the interface for the Buffer social-media scheduling API.
type BufferClient interface {
	CreatePost(profiles []string, text string, mediaURL string, scheduledAt time.Time) (bufferID string, err error)
}

// StubBufferClient logs the intended action instead of calling Buffer.
type StubBufferClient struct {
	Log *zap.Logger
}

func (s *StubBufferClient) CreatePost(profiles []string, text string, mediaURL string, scheduledAt time.Time) (string, error) {
	fakeID := fmt.Sprintf("buf_stub_%d", time.Now().UnixMilli())
	s.Log.Info("[buffer stub] would create post",
		zap.Strings("profiles", profiles),
		zap.String("text_preview", truncate(text, 80)),
		zap.String("media_url", mediaURL),
		zap.Time("scheduled_at", scheduledAt),
		zap.String("fake_id", fakeID),
	)
	return fakeID, nil
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
