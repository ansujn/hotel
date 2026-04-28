-- +goose Up
-- Restaurant platform Phase 1: restaurants table.
-- Owner_id is nullable for now — Phase 1 admin uses ADMIN_PASSWORD env auth.

CREATE TABLE IF NOT EXISTS restaurants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  cuisines            TEXT[] NOT NULL DEFAULT '{}',
  location            TEXT NOT NULL,
  city                TEXT NOT NULL,
  address             TEXT NOT NULL,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  phone               TEXT,
  email               TEXT,
  website             TEXT,
  hours               JSONB NOT NULL DEFAULT '[]'::jsonb,
  avg_price_per_plate INTEGER,
  capacity            INTEGER NOT NULL DEFAULT 0,
  dress_code          TEXT,
  highlights          TEXT[] NOT NULL DEFAULT '{}',
  hero_image_url      TEXT,
  has_3d_tour         BOOLEAN NOT NULL DEFAULT FALSE,
  rating_avg          NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count        INTEGER NOT NULL DEFAULT 0,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_city          ON restaurants (city);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisines_gin  ON restaurants USING GIN (cuisines);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating_desc   ON restaurants (rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_price         ON restaurants (avg_price_per_plate);

-- +goose Down
DROP TABLE IF EXISTS restaurants;
