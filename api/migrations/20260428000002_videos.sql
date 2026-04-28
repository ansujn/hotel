-- +goose Up
-- Restaurant videos. Mux fields nullable in Phase 1 (stub-friendly);
-- Phase 2 adds Mux ingest + signed playback IDs.

CREATE TABLE IF NOT EXISTS restaurant_videos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'ambiance',
  -- type ∈ ambiance | chef_special | menu_showcase | event_highlight | testimonial
  mux_asset_id     TEXT,
  mux_playback_id  TEXT,
  thumbnail_url    TEXT,
  duration_seconds INTEGER,
  views            INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rest_videos_restaurant ON restaurant_videos (restaurant_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rest_videos_mux_asset
  ON restaurant_videos (mux_asset_id) WHERE mux_asset_id IS NOT NULL;

-- +goose Down
DROP TABLE IF EXISTS restaurant_videos;
