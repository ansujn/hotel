-- +goose Up
-- Phase 4 no-op migration.
--
-- All tables required by Phase 4 code (progress, social, payments, notes)
-- were already created in 20260415000001_init.sql:
--   - rubric_scores  (progress service: averages + per-asset rubric)
--   - notes          (progress service: private/public notes on assets)
--   - social_posts   (social service: platforms[], caption, scheduled_at, buffer_id, status)
--   - payments       (payment service: razorpay_order_id, amount_paise, status, period)
--   - consents       (social.ListConsentedAssets joins scope_social + valid_until)
--
-- Consent tokens are JWT-only (no table required).
-- Clip suggestions are computed on-demand (no persistence).
-- Social library is a live query over assets + consents (no cache table).
--
-- This file exists so the migration sequence is explicit for Phase 4
-- and Phase 5 migrations have a clean base to build on.
SELECT 1;

-- +goose Down
SELECT 1;
