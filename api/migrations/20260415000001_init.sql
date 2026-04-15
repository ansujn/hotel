-- +goose Up
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role     AS ENUM ('student','parent','instructor','admin');
CREATE TYPE asset_type    AS ENUM ('monologue','scene','showcase','catalog');
CREATE TYPE asset_privacy AS ENUM ('private','pending_consent','public');

CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      TEXT UNIQUE NOT NULL,
  email      TEXT,
  name       TEXT,
  avatar_url TEXT,
  role       user_role NOT NULL,
  locale     TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parents_students (
  parent_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT,
  PRIMARY KEY (parent_id, student_id)
);

CREATE TABLE batches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  track         TEXT NOT NULL,
  schedule      TEXT NOT NULL,
  instructor_id UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE enrollments (
  batch_id   UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status     TEXT NOT NULL DEFAULT 'active',
  PRIMARY KEY (batch_id, student_id)
);

CREATE TABLE assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             asset_type NOT NULL,
  title            TEXT NOT NULL,
  mux_asset_id     TEXT,
  mux_playback_id  TEXT,
  duration_s       INT,
  privacy          asset_privacy NOT NULL DEFAULT 'private',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON assets (student_id);
CREATE INDEX ON assets (privacy);

CREATE TABLE consents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id      UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  parent_id     UUID NOT NULL REFERENCES users(id),
  scope_channel BOOLEAN NOT NULL DEFAULT FALSE,
  scope_social  BOOLEAN NOT NULL DEFAULT FALSE,
  scope_print   BOOLEAN NOT NULL DEFAULT FALSE,
  signed_name   TEXT NOT NULL,
  signed_ip     INET,
  signed_ua     TEXT,
  pdf_url       TEXT,
  valid_until   TIMESTAMPTZ NOT NULL,
  signed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMPTZ
);
CREATE INDEX ON consents (asset_id);

CREATE TABLE rubric_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id      UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  dimension     TEXT NOT NULL,
  score         INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  instructor_id UUID NOT NULL REFERENCES users(id),
  scored_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id   UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  private    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendance (
  batch_id   UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_date DATE NOT NULL,
  status     TEXT NOT NULL,
  PRIMARY KEY (batch_id, student_id, class_date)
);

CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id   UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id),
  razorpay_order_id  TEXT,
  amount_paise       BIGINT NOT NULL,
  status             TEXT NOT NULL,
  period             TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE social_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id      UUID REFERENCES assets(id),
  platforms     TEXT[] NOT NULL,
  caption       TEXT,
  scheduled_at  TIMESTAMPTZ,
  buffer_id     TEXT,
  status        TEXT NOT NULL DEFAULT 'queued',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
  id         BIGSERIAL PRIMARY KEY,
  actor_id   UUID REFERENCES users(id),
  action     TEXT NOT NULL,
  target     TEXT,
  meta       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE audit_log, social_posts, payments, announcements, attendance,
  notes, rubric_scores, consents, assets, enrollments, batches,
  parents_students, users CASCADE;
DROP TYPE asset_privacy, asset_type, user_role;
