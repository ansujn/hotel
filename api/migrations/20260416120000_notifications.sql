-- +goose Up
CREATE TYPE notification_kind AS ENUM (
  'consent_pending','asset_ready','feedback','class_reminder','fee_due'
);

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       notification_kind NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  meta       JSONB NOT NULL DEFAULT '{}',
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX notifications_user_read_created_idx
  ON notifications (user_id, read_at, created_at DESC);

-- +goose Down
DROP TABLE IF EXISTS notifications;
DROP TYPE IF EXISTS notification_kind;
