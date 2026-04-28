-- seed_dev.sql — idempotent dev seed. Run: psql "$DATABASE_URL" -f migrations/seed_dev.sql
-- NOT a goose migration. Safe to re-run.

BEGIN;

-- Users ---------------------------------------------------------------
INSERT INTO users (id, phone, email, name, role, locale) VALUES
  ('11111111-1111-1111-1111-111111111111', '+91-9000000001', 'vik@viktheatre.test', 'Vik Prasad',      'admin',      'en'),
  ('11111111-1111-1111-1111-111111111112', '+91-9000000002', 'instructor@viktheatre.test', 'Anita Rao', 'instructor', 'en'),
  -- parents
  ('22222222-2222-2222-2222-222222222201', '+91-9000001001', 'parent1@test', 'Parent One',   'parent', 'en'),
  ('22222222-2222-2222-2222-222222222202', '+91-9000001002', 'parent2@test', 'Parent Two',   'parent', 'en'),
  ('22222222-2222-2222-2222-222222222203', '+91-9000001003', 'parent3@test', 'Parent Three', 'parent', 'en'),
  -- students
  ('33333333-3333-3333-3333-333333333301', '+91-9000002001', NULL, 'Student One',   'student', 'en'),
  ('33333333-3333-3333-3333-333333333302', '+91-9000002002', NULL, 'Student Two',   'student', 'en'),
  ('33333333-3333-3333-3333-333333333303', '+91-9000002003', NULL, 'Student Three', 'student', 'en')
ON CONFLICT (phone) DO NOTHING;

-- Parent <-> Student links -------------------------------------------
INSERT INTO parents_students (parent_id, student_id, relationship) VALUES
  ('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 'mother'),
  ('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333302', 'father'),
  ('22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333303', 'guardian')
ON CONFLICT DO NOTHING;

-- Batch + enrollments ------------------------------------------------
INSERT INTO batches (id, name, track, schedule, instructor_id) VALUES
  ('44444444-4444-4444-4444-444444444401', 'Thursday Evening', 'foundation', 'Thu 18:00-20:00',
   '11111111-1111-1111-1111-111111111112')
ON CONFLICT (id) DO NOTHING;

INSERT INTO enrollments (batch_id, student_id, status) VALUES
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'active'),
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333302', 'active'),
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333303', 'active')
ON CONFLICT DO NOTHING;

-- Assets -------------------------------------------------------------
INSERT INTO assets (id, student_id, type, title, privacy) VALUES
  ('55555555-5555-5555-5555-555555555501', '33333333-3333-3333-3333-333333333301',
   'monologue', 'Hamlet Soliloquy (public)', 'public'),
  ('55555555-5555-5555-5555-555555555502', '33333333-3333-3333-3333-333333333302',
   'scene', 'Scene Study (private)', 'private')
ON CONFLICT (id) DO NOTHING;

-- Consent for the public asset --------------------------------------
INSERT INTO consents (
  id, asset_id, parent_id,
  scope_channel, scope_social, scope_print,
  signed_name, pdf_url, valid_until
) VALUES (
  '66666666-6666-6666-6666-666666666601',
  '55555555-5555-5555-5555-555555555501',
  '22222222-2222-2222-2222-222222222201',
  TRUE, TRUE, FALSE,
  'Parent One',
  'https://dummy.local/consent/66666666.pdf',
  NOW() + INTERVAL '1 year'
) ON CONFLICT (id) DO NOTHING;

-- Rubric scores ------------------------------------------------------
INSERT INTO rubric_scores (id, asset_id, dimension, score, instructor_id) VALUES
  ('77777777-7777-7777-7777-777777777701', '55555555-5555-5555-5555-555555555501',
   'diction', 82, '11111111-1111-1111-1111-111111111112'),
  ('77777777-7777-7777-7777-777777777702', '55555555-5555-5555-5555-555555555502',
   'presence', 75, '11111111-1111-1111-1111-111111111112')
ON CONFLICT (id) DO NOTHING;

-- Notifications ------------------------------------------------------
-- Admin inbox (matches the original stub UI).
INSERT INTO notifications (id, user_id, kind, title, body, created_at) VALUES
  ('88888888-8888-8888-8888-888888888801', '11111111-1111-1111-1111-111111111111',
   'consent_pending',  'Consent pending: Diction Drill #4',
   'Your parent hasn''t approved this for public sharing yet.', NOW() - INTERVAL '2 hours'),
  ('88888888-8888-8888-8888-888888888802', '11111111-1111-1111-1111-111111111111',
   'asset_ready',      'New upload on your channel',
   '"Hamlet · Act III, Scene I" is now live.', NOW() - INTERVAL '5 hours'),
  ('88888888-8888-8888-8888-888888888803', '11111111-1111-1111-1111-111111111111',
   'feedback',         'Vik left feedback on "Intro Piece"',
   'Watch pacing at line 47 — beat-work exercise before next take.', NOW() - INTERVAL '1 day'),
  ('88888888-8888-8888-8888-888888888804', '11111111-1111-1111-1111-111111111111',
   'class_reminder',   'Class reminder: Thursday 6:30 PM',
   'Showcase rehearsal for Act III.', NOW() - INTERVAL '1 day 2 hours'),
  ('88888888-8888-8888-8888-888888888805', '11111111-1111-1111-1111-111111111111',
   'fee_due',          'Fees due on 1 May',
   'Invoice ₹4,500 will be generated for May term.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Student One inbox
INSERT INTO notifications (id, user_id, kind, title, body, created_at) VALUES
  ('88888888-8888-8888-8888-888888888811', '33333333-3333-3333-3333-333333333301',
   'asset_ready',      'Your clip is live', 'Hamlet Soliloquy is now on your channel.', NOW() - INTERVAL '3 hours'),
  ('88888888-8888-8888-8888-888888888812', '33333333-3333-3333-3333-333333333301',
   'feedback',         'Feedback from Vik', 'Great diction — watch the pause before line 12.', NOW() - INTERVAL '1 day'),
  ('88888888-8888-8888-8888-888888888813', '33333333-3333-3333-3333-333333333301',
   'class_reminder',   'Thursday 6:30 PM',  'Rehearsal for Act III.', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Student Two inbox
INSERT INTO notifications (id, user_id, kind, title, body, created_at) VALUES
  ('88888888-8888-8888-8888-888888888821', '33333333-3333-3333-3333-333333333302',
   'consent_pending',  'Consent pending', 'Scene Study needs parent approval.', NOW() - INTERVAL '6 hours'),
  ('88888888-8888-8888-8888-888888888822', '33333333-3333-3333-3333-333333333302',
   'feedback',         'Feedback from Vik', 'Strong presence work this week.', NOW() - INTERVAL '1 day'),
  ('88888888-8888-8888-8888-888888888823', '33333333-3333-3333-3333-333333333302',
   'class_reminder',   'Thursday 6:30 PM',  'Rehearsal for Act III.', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Student Three inbox
INSERT INTO notifications (id, user_id, kind, title, body, created_at) VALUES
  ('88888888-8888-8888-8888-888888888831', '33333333-3333-3333-3333-333333333303',
   'asset_ready',      'Your clip is live', 'New upload on your channel.', NOW() - INTERVAL '4 hours'),
  ('88888888-8888-8888-8888-888888888832', '33333333-3333-3333-3333-333333333303',
   'class_reminder',   'Thursday 6:30 PM',  'Rehearsal for Act III.', NOW() - INTERVAL '1 day'),
  ('88888888-8888-8888-8888-888888888833', '33333333-3333-3333-3333-333333333303',
   'fee_due',          'Fees due on 1 May',  'Invoice will be generated soon.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

COMMIT;
