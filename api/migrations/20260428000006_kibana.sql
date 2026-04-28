-- +goose Up
-- +goose StatementBegin
-- Kibana single-restaurant tables: banquet halls, menu, bookings.
-- Reuses the existing `restaurants` row at 11111111-1111-1111-1111-111111111101
-- as the Kibana profile (so the multi-restaurant infrastructure stays intact
-- and we can add more venues later without a schema change).

CREATE TABLE IF NOT EXISTS banquet_halls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  capacity_min    INTEGER NOT NULL,
  capacity_max    INTEGER NOT NULL,
  price_per_plate INTEGER NOT NULL,
  hire_charge     INTEGER NOT NULL DEFAULT 0,
  features        TEXT[] NOT NULL DEFAULT '{}',
  hero_image_url  TEXT,
  images          TEXT[] NOT NULL DEFAULT '{}',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_banquet_halls_restaurant ON banquet_halls (restaurant_id, sort_order);

CREATE TABLE IF NOT EXISTS menu_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON menu_categories (restaurant_id, sort_order);

CREATE TABLE IF NOT EXISTS menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        INTEGER NOT NULL,
  is_veg       BOOLEAN NOT NULL DEFAULT TRUE,
  is_signature BOOLEAN NOT NULL DEFAULT FALSE,
  spice_level  INTEGER NOT NULL DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 3),
  image_url    TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category_id, sort_order);

CREATE TABLE IF NOT EXISTS kibana_bookings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id        UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  banquet_hall_id      UUID REFERENCES banquet_halls(id) ON DELETE SET NULL,
  event_type           TEXT NOT NULL, -- wedding | corporate | private_dinner | anniversary | birthday | other
  guest_count          INTEGER NOT NULL,
  event_date           DATE NOT NULL,
  start_time           TIME NOT NULL,
  duration_minutes     INTEGER NOT NULL,
  cuisine_preference   TEXT[] NOT NULL DEFAULT '{}',
  dietary_restrictions TEXT[] NOT NULL DEFAULT '{}',
  budget_per_plate     INTEGER,
  special_requests     TEXT,
  contact_name         TEXT NOT NULL,
  contact_phone        TEXT NOT NULL,
  contact_email        TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | completed | cancelled
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kibana_bookings_date    ON kibana_bookings (event_date, status);
CREATE INDEX IF NOT EXISTS idx_kibana_bookings_contact ON kibana_bookings (contact_email);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS kibana_bookings;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS menu_categories;
DROP TABLE IF EXISTS banquet_halls;
-- +goose StatementEnd
