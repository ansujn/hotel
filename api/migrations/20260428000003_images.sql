-- +goose Up
-- Restaurant images. Type tags the role of the image so the frontend can pick a hero,
-- show galleries, etc.

CREATE TABLE IF NOT EXISTS restaurant_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'gallery',
  -- type ∈ hero | gallery | menu | interior | exterior | dish
  caption       TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rest_images_restaurant
  ON restaurant_images (restaurant_id, sort_order, created_at);

-- +goose Down
DROP TABLE IF EXISTS restaurant_images;
