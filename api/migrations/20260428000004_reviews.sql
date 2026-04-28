-- +goose Up
-- Restaurant reviews. Anonymous-friendly: no users.id FK; we capture user_name and
-- user_email so reviews can be left without an account. email_verified gates
-- whether the review is shown publicly.

CREATE TABLE IF NOT EXISTS restaurant_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_name       TEXT NOT NULL,
  user_email      TEXT NOT NULL,
  rating          NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title           TEXT,
  comment         TEXT,
  food_rating     NUMERIC(2,1),
  ambiance_rating NUMERIC(2,1),
  service_rating  NUMERIC(2,1),
  value_rating    NUMERIC(2,1),
  photos          TEXT[] NOT NULL DEFAULT '{}',
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  verify_token    TEXT,
  verify_sent_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rest_reviews_restaurant
  ON restaurant_reviews (restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rest_reviews_visible
  ON restaurant_reviews (restaurant_id, rating DESC) WHERE email_verified = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_rest_reviews_verify_token
  ON restaurant_reviews (verify_token) WHERE verify_token IS NOT NULL;

-- Trigger: keep restaurants.rating_avg / review_count in sync with verified reviews.
CREATE OR REPLACE FUNCTION trg_restaurant_review_aggregate()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE restaurants r SET
    rating_avg   = COALESCE((SELECT AVG(rating)::NUMERIC(3,2)
                              FROM restaurant_reviews
                              WHERE restaurant_id = r.id AND email_verified), 0),
    review_count = COALESCE((SELECT COUNT(*) FROM restaurant_reviews
                              WHERE restaurant_id = r.id AND email_verified), 0),
    updated_at   = NOW()
  WHERE r.id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurant_reviews_aggregate
AFTER INSERT OR UPDATE OF email_verified, rating OR DELETE
ON restaurant_reviews
FOR EACH ROW EXECUTE FUNCTION trg_restaurant_review_aggregate();

-- +goose Down
DROP TRIGGER IF EXISTS restaurant_reviews_aggregate ON restaurant_reviews;
DROP FUNCTION IF EXISTS trg_restaurant_review_aggregate();
DROP TABLE IF EXISTS restaurant_reviews;
