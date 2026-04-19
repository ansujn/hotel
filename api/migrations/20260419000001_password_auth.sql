-- +goose Up
-- Password-based auth: replaces OTP login.
-- Users get a default password at admin-creation time and must change it on first login.
-- Reset flow uses a hashed, single-use, 1-hour token delivered via email.

ALTER TABLE users
  ADD COLUMN password_hash         TEXT,
  ADD COLUMN must_change_password  BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN password_changed_at   TIMESTAMPTZ;

-- email was nullable/non-unique; make it citext-style unique when present.
-- Using a partial unique index so legacy NULL rows don't collide.
CREATE UNIQUE INDEX users_email_unique
  ON users (LOWER(email))
  WHERE email IS NOT NULL;

-- phone was already UNIQUE NOT NULL from init migration.

CREATE TABLE password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON password_resets (user_id);
CREATE INDEX ON password_resets (expires_at);

-- +goose Down
DROP TABLE IF EXISTS password_resets;
DROP INDEX IF EXISTS users_email_unique;
ALTER TABLE users
  DROP COLUMN IF EXISTS password_hash,
  DROP COLUMN IF EXISTS must_change_password,
  DROP COLUMN IF EXISTS password_changed_at;
