package notification

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Notification is a single persisted user-facing notification.
type Notification struct {
	ID        uuid.UUID       `json:"id"`
	UserID    uuid.UUID       `json:"user_id"`
	Kind      string          `json:"kind"`
	Title     string          `json:"title"`
	Body      string          `json:"body"`
	Meta      json.RawMessage `json:"meta"`
	ReadAt    *time.Time      `json:"read_at,omitempty"`
	CreatedAt time.Time       `json:"created_at"`
}
