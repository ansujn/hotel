-- Realistic dev seed for Vik Theatre platform.
-- Wipes all content rows (keeps schema + core users), then inserts a
-- production-shaped dataset: 10 students across 3 batches with assets,
-- rubric scores, consents, notes, announcements, attendance, notifications.
--
-- Apply with:
--   psql "postgres://postgres:password@localhost:5432/vik" -f api/migrations/seed_realistic.sql

BEGIN;

-- ── wipe ───────────────────────────────────────────────────────────
TRUNCATE TABLE audit_log, notifications, social_posts, payments,
  announcements, attendance, notes, rubric_scores, consents, assets,
  enrollments, batches, parents_students, users
  RESTART IDENTITY CASCADE;

-- ── staff ──────────────────────────────────────────────────────────
INSERT INTO users (id, phone, email, name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', '+919000000001', 'vik@viktheatre.in',   'Vik Prasad', 'admin'),
  ('11111111-1111-1111-1111-111111111112', '+919000000002', 'anita@viktheatre.in', 'Anita Rao',  'instructor');

-- ── parents (4 parents; one has two kids) ──────────────────────────
INSERT INTO users (id, phone, email, name, role) VALUES
  ('22222222-2222-2222-2222-000000000001', '+919000001001', 'rajesh.s@mail.com',  'Rajesh Sharma',   'parent'),
  ('22222222-2222-2222-2222-000000000002', '+919000001002', 'lakshmi.m@mail.com', 'Lakshmi Menon',   'parent'),
  ('22222222-2222-2222-2222-000000000003', '+919000001003', 'arjun.s@mail.com',   'Arjun Singh',     'parent'),
  ('22222222-2222-2222-2222-000000000004', '+919000001004', 'shalini.i@mail.com', 'Shalini Iyer',    'parent');

-- ── students (10) ──────────────────────────────────────────────────
INSERT INTO users (id, phone, email, name, role) VALUES
  ('33333333-3333-3333-3333-000000000001', '+919000002001', 'aarav@mail.com',    'Aarav Sharma',   'student'),
  ('33333333-3333-3333-3333-000000000002', '+919000002002', 'priya@mail.com',    'Priya Menon',    'student'),
  ('33333333-3333-3333-3333-000000000003', '+919000002003', 'kabir@mail.com',    'Kabir Singh',    'student'),
  ('33333333-3333-3333-3333-000000000004', '+919000002004', 'meera@mail.com',    'Meera Iyer',     'student'),
  ('33333333-3333-3333-3333-000000000005', '+919000002005', 'rohan@mail.com',    'Rohan Desai',    'student'),
  ('33333333-3333-3333-3333-000000000006', '+919000002006', 'sanya@mail.com',    'Sanya Kapoor',   'student'),
  ('33333333-3333-3333-3333-000000000007', '+919000002007', 'vihaan@mail.com',   'Vihaan Reddy',   'student'),
  ('33333333-3333-3333-3333-000000000008', '+919000002008', 'ananya@mail.com',   'Ananya Rao',     'student'),
  ('33333333-3333-3333-3333-000000000009', '+919000002009', 'ishaan@mail.com',   'Ishaan Nair',    'student'),
  ('33333333-3333-3333-3333-00000000000a', '+919000002010', 'tara@mail.com',     'Tara Joshi',     'student');

-- ── parent ↔ student links ─────────────────────────────────────────
INSERT INTO parents_students (parent_id, student_id, relationship) VALUES
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000001', 'father'),
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000005', 'father'),  -- Rajesh has two kids
  ('22222222-2222-2222-2222-000000000002', '33333333-3333-3333-3333-000000000002', 'mother'),
  ('22222222-2222-2222-2222-000000000002', '33333333-3333-3333-3333-000000000004', 'mother'),
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000003', 'father'),
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000006', 'father'),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000007', 'mother'),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000008', 'mother'),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000009', 'mother'),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-00000000000a', 'mother');

-- ── batches (3) ────────────────────────────────────────────────────
INSERT INTO batches (id, name, track, schedule, instructor_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001', 'Thursday Evening', 'theatre',          'Thu 6:30–8:30 PM', '11111111-1111-1111-1111-111111111112'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002', 'Saturday Morning', 'public_speaking',  'Sat 10:00–12:00 AM', '11111111-1111-1111-1111-111111111112'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003', 'Sunday Kids',      'kids_drama',       'Sun 5:00–7:00 PM',  '11111111-1111-1111-1111-111111111112');

-- ── enrollments (spread 10 students across 3 batches) ──────────────
INSERT INTO enrollments (batch_id, student_id) VALUES
  -- Thursday Evening (Aarav, Priya, Kabir, Meera)
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001', '33333333-3333-3333-3333-000000000001'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001', '33333333-3333-3333-3333-000000000002'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001', '33333333-3333-3333-3333-000000000003'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001', '33333333-3333-3333-3333-000000000004'),
  -- Saturday Morning (Rohan, Sanya, Vihaan)
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002', '33333333-3333-3333-3333-000000000005'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002', '33333333-3333-3333-3333-000000000006'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002', '33333333-3333-3333-3333-000000000007'),
  -- Sunday Kids (Ananya, Ishaan, Tara)
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003', '33333333-3333-3333-3333-000000000008'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003', '33333333-3333-3333-3333-000000000009'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003', '33333333-3333-3333-3333-00000000000a');

-- ── assets ─────────────────────────────────────────────────────────
-- Aarav (public leader: 3 public, 1 pending, 1 private)
INSERT INTO assets (id, student_id, type, title, mux_playback_id, duration_s, privacy, created_at) VALUES
  ('bb000001-bbbb-bbbb-bbbb-000000000001', '33333333-3333-3333-3333-000000000001', 'monologue', 'Hamlet · Act III, Scene I', 'qxb01i6T202018GFS02vp9RIe01icTcDCjVzQpmaB00CUisJ4', 154, 'public',          NOW() - INTERVAL '4 days'),
  ('bb000001-bbbb-bbbb-bbbb-000000000002', '33333333-3333-3333-3333-000000000001', 'scene',     'Glass Menagerie (opening)', 'demo_glass_menagerie',                              108, 'public',          NOW() - INTERVAL '10 days'),
  ('bb000001-bbbb-bbbb-bbbb-000000000003', '33333333-3333-3333-3333-000000000001', 'showcase',  'Showcase 2026',             'demo_showcase_2026',                                201, 'public',          NOW() - INTERVAL '20 days'),
  ('bb000001-bbbb-bbbb-bbbb-000000000004', '33333333-3333-3333-3333-000000000001', 'monologue', 'Diction Drill #4',          'demo_diction_4',                                     52, 'pending_consent', NOW() - INTERVAL '1 day'),
  ('bb000001-bbbb-bbbb-bbbb-000000000005', '33333333-3333-3333-3333-000000000001', 'monologue', 'Intro Piece (private)',     'demo_intro',                                         98, 'private',         NOW() - INTERVAL '35 days');

-- Priya (2 public, 1 private)
INSERT INTO assets (id, student_id, type, title, mux_playback_id, duration_s, privacy, created_at) VALUES
  ('bb000002-bbbb-bbbb-bbbb-000000000001', '33333333-3333-3333-3333-000000000002', 'monologue', 'Kabir Doha',            'demo_kabir_doha',     165, 'public',          NOW() - INTERVAL '7 days'),
  ('bb000002-bbbb-bbbb-bbbb-000000000002', '33333333-3333-3333-3333-000000000002', 'scene',     'Ranga Shankara scene',  'demo_ranga_scene',    132, 'public',          NOW() - INTERVAL '16 days'),
  ('bb000002-bbbb-bbbb-bbbb-000000000003', '33333333-3333-3333-3333-000000000002', 'catalog',   'Class photo · April',   NULL,                  0,   'private',         NOW() - INTERVAL '3 days');

-- Kabir (public speaking — 2 public)
INSERT INTO assets (id, student_id, type, title, mux_playback_id, duration_s, privacy, created_at) VALUES
  ('bb000003-bbbb-bbbb-bbbb-000000000001', '33333333-3333-3333-3333-000000000003', 'showcase',  'TED-style Pitch',       'demo_ted_pitch',      182, 'public',          NOW() - INTERVAL '6 days'),
  ('bb000003-bbbb-bbbb-bbbb-000000000002', '33333333-3333-3333-3333-000000000003', 'monologue', 'Impromptu — 2 mins',    'demo_impromptu',       120, 'pending_consent', NOW() - INTERVAL '2 days');

-- Meera (1 public, 1 pending)
INSERT INTO assets (id, student_id, type, title, mux_playback_id, duration_s, privacy, created_at) VALUES
  ('bb000004-bbbb-bbbb-bbbb-000000000001', '33333333-3333-3333-3333-000000000004', 'monologue', 'Juliet — Balcony',      'demo_juliet',         145, 'public',          NOW() - INTERVAL '12 days'),
  ('bb000004-bbbb-bbbb-bbbb-000000000002', '33333333-3333-3333-3333-000000000004', 'scene',     'Partner scene',         'demo_partner',        210, 'pending_consent', NOW() - INTERVAL '1 day');

-- Rohan (1 public)
INSERT INTO assets (id, student_id, type, title, mux_playback_id, duration_s, privacy, created_at) VALUES
  ('bb000005-bbbb-bbbb-bbbb-000000000001', '33333333-3333-3333-3333-000000000005', 'showcase',  'Debate finals',         'demo_debate',         240, 'public',          NOW() - INTERVAL '15 days');

-- Sanya (1 pending)
INSERT INTO assets (id, student_id, type, title, mux_playback_id, duration_s, privacy, created_at) VALUES
  ('bb000006-bbbb-bbbb-bbbb-000000000001', '33333333-3333-3333-3333-000000000006', 'monologue', 'Confidence exercise',   'demo_confidence',     75,  'pending_consent', NOW() - INTERVAL '2 days');

-- Vihaan (2 public — kid)
INSERT INTO assets (id, student_id, type, title, mux_playback_id, duration_s, privacy, created_at) VALUES
  ('bb000007-bbbb-bbbb-bbbb-000000000001', '33333333-3333-3333-3333-000000000007', 'monologue', 'Panchatantra story',    'demo_panchatantra',   132, 'public',          NOW() - INTERVAL '9 days'),
  ('bb000007-bbbb-bbbb-bbbb-000000000002', '33333333-3333-3333-3333-000000000007', 'showcase',  'Kids Showcase',         'demo_kids_showcase',   95, 'public',          NOW() - INTERVAL '22 days');

-- Ananya (1 private — newcomer)
INSERT INTO assets (id, student_id, type, title, mux_playback_id, duration_s, privacy, created_at) VALUES
  ('bb000008-bbbb-bbbb-bbbb-000000000001', '33333333-3333-3333-3333-000000000008', 'monologue', 'Intro Piece',           'demo_ananya_intro',    62, 'private',         NOW() - INTERVAL '4 days');

-- Ishaan, Tara — no assets yet (new students)

-- ── consents (match the 'public' assets) ───────────────────────────
INSERT INTO consents (id, asset_id, parent_id, scope_channel, scope_social, scope_print, signed_name, valid_until, signed_at) VALUES
  ('cc000001-cccc-cccc-cccc-000000000001', 'bb000001-bbbb-bbbb-bbbb-000000000001', '22222222-2222-2222-2222-000000000001', TRUE, TRUE,  FALSE, 'Rajesh Sharma',  NOW() + INTERVAL '365 days', NOW() - INTERVAL '3 days'),
  ('cc000001-cccc-cccc-cccc-000000000002', 'bb000001-bbbb-bbbb-bbbb-000000000002', '22222222-2222-2222-2222-000000000001', TRUE, FALSE, FALSE, 'Rajesh Sharma',  NOW() + INTERVAL '365 days', NOW() - INTERVAL '9 days'),
  ('cc000001-cccc-cccc-cccc-000000000003', 'bb000001-bbbb-bbbb-bbbb-000000000003', '22222222-2222-2222-2222-000000000001', TRUE, TRUE,  TRUE,  'Rajesh Sharma',  NOW() + INTERVAL '365 days', NOW() - INTERVAL '19 days'),
  ('cc000002-cccc-cccc-cccc-000000000001', 'bb000002-bbbb-bbbb-bbbb-000000000001', '22222222-2222-2222-2222-000000000002', TRUE, TRUE,  FALSE, 'Lakshmi Menon',  NOW() + INTERVAL '365 days', NOW() - INTERVAL '6 days'),
  ('cc000002-cccc-cccc-cccc-000000000002', 'bb000002-bbbb-bbbb-bbbb-000000000002', '22222222-2222-2222-2222-000000000002', TRUE, FALSE, FALSE, 'Lakshmi Menon',  NOW() + INTERVAL '365 days', NOW() - INTERVAL '15 days'),
  ('cc000003-cccc-cccc-cccc-000000000001', 'bb000003-bbbb-bbbb-bbbb-000000000001', '22222222-2222-2222-2222-000000000003', TRUE, TRUE,  FALSE, 'Arjun Singh',    NOW() + INTERVAL '365 days', NOW() - INTERVAL '5 days'),
  ('cc000004-cccc-cccc-cccc-000000000001', 'bb000004-bbbb-bbbb-bbbb-000000000001', '22222222-2222-2222-2222-000000000002', TRUE, FALSE, FALSE, 'Lakshmi Menon',  NOW() + INTERVAL '180 days', NOW() - INTERVAL '11 days'),
  ('cc000005-cccc-cccc-cccc-000000000001', 'bb000005-bbbb-bbbb-bbbb-000000000001', '22222222-2222-2222-2222-000000000001', TRUE, TRUE,  FALSE, 'Rajesh Sharma',  NOW() + INTERVAL '365 days', NOW() - INTERVAL '14 days'),
  ('cc000007-cccc-cccc-cccc-000000000001', 'bb000007-bbbb-bbbb-bbbb-000000000001', '22222222-2222-2222-2222-000000000004', TRUE, TRUE,  FALSE, 'Shalini Iyer',   NOW() + INTERVAL '180 days', NOW() - INTERVAL '8 days'),
  ('cc000007-cccc-cccc-cccc-000000000002', 'bb000007-bbbb-bbbb-bbbb-000000000002', '22222222-2222-2222-2222-000000000004', TRUE, TRUE,  TRUE,  'Shalini Iyer',   NOW() + INTERVAL '180 days', NOW() - INTERVAL '21 days');

-- ── rubric scores (5 dims × ~10 scored assets) ─────────────────────
INSERT INTO rubric_scores (asset_id, dimension, score, instructor_id) VALUES
  ('bb000001-bbbb-bbbb-bbbb-000000000001', 'diction',       85, '11111111-1111-1111-1111-111111111112'),
  ('bb000001-bbbb-bbbb-bbbb-000000000001', 'presence',      78, '11111111-1111-1111-1111-111111111112'),
  ('bb000001-bbbb-bbbb-bbbb-000000000001', 'memorization',  92, '11111111-1111-1111-1111-111111111112'),
  ('bb000001-bbbb-bbbb-bbbb-000000000001', 'confidence',    80, '11111111-1111-1111-1111-111111111112'),
  ('bb000001-bbbb-bbbb-bbbb-000000000001', 'improvisation', 70, '11111111-1111-1111-1111-111111111112'),
  ('bb000001-bbbb-bbbb-bbbb-000000000002', 'diction',       80, '11111111-1111-1111-1111-111111111112'),
  ('bb000001-bbbb-bbbb-bbbb-000000000002', 'presence',      82, '11111111-1111-1111-1111-111111111112'),
  ('bb000002-bbbb-bbbb-bbbb-000000000001', 'diction',       75, '11111111-1111-1111-1111-111111111112'),
  ('bb000002-bbbb-bbbb-bbbb-000000000001', 'presence',      70, '11111111-1111-1111-1111-111111111112'),
  ('bb000002-bbbb-bbbb-bbbb-000000000001', 'confidence',    65, '11111111-1111-1111-1111-111111111112'),
  ('bb000003-bbbb-bbbb-bbbb-000000000001', 'diction',       88, '11111111-1111-1111-1111-111111111112'),
  ('bb000003-bbbb-bbbb-bbbb-000000000001', 'confidence',    90, '11111111-1111-1111-1111-111111111112'),
  ('bb000004-bbbb-bbbb-bbbb-000000000001', 'diction',       72, '11111111-1111-1111-1111-111111111112'),
  ('bb000004-bbbb-bbbb-bbbb-000000000001', 'presence',      68, '11111111-1111-1111-1111-111111111112'),
  ('bb000007-bbbb-bbbb-bbbb-000000000001', 'confidence',    92, '11111111-1111-1111-1111-111111111112'),
  ('bb000007-bbbb-bbbb-bbbb-000000000001', 'improvisation', 88, '11111111-1111-1111-1111-111111111112');

-- ── notes (instructor feedback) ────────────────────────────────────
INSERT INTO notes (asset_id, author_id, body, private) VALUES
  ('bb000001-bbbb-bbbb-bbbb-000000000001', '11111111-1111-1111-1111-111111111112', 'Excellent command of text. Watch pacing at line 47 — try beat-work exercise.', TRUE),
  ('bb000001-bbbb-bbbb-bbbb-000000000001', '11111111-1111-1111-1111-111111111112', 'Use the full breath on "undiscovered country."', TRUE),
  ('bb000002-bbbb-bbbb-bbbb-000000000001', '11111111-1111-1111-1111-111111111112', 'Beautiful stillness. Try one more with softer vowels.', TRUE),
  ('bb000003-bbbb-bbbb-bbbb-000000000001', '11111111-1111-1111-1111-111111111112', 'Hook works. Trim the intro by 15s for punch.', TRUE),
  ('bb000004-bbbb-bbbb-bbbb-000000000001', '11111111-1111-1111-1111-111111111112', 'Let Juliet breathe before the balcony call.', TRUE),
  ('bb000007-bbbb-bbbb-bbbb-000000000001', '11111111-1111-1111-1111-111111111112', 'So natural. Keep this one for the showcase reel.', TRUE);

-- ── announcements ──────────────────────────────────────────────────
INSERT INTO announcements (batch_id, author_id, body, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001', '11111111-1111-1111-1111-111111111111', 'Showcase rehearsal moved to Saturday 4 PM.',     NOW() - INTERVAL '1 day'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001', '11111111-1111-1111-1111-111111111111', 'Pick your monologue for Showcase 2026 by Friday.', NOW() - INTERVAL '2 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002', '11111111-1111-1111-1111-111111111111', 'Bring a 2-min prepared speech this week.',       NOW() - INTERVAL '3 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003', '11111111-1111-1111-1111-111111111111', 'Parents invited to Sunday''s showcase at 6 PM.',  NOW() - INTERVAL '1 day');

-- ── attendance (last 4 sessions, rolling 96%) ──────────────────────
INSERT INTO attendance (batch_id, student_id, class_date, status)
SELECT e.batch_id, e.student_id, d::date, CASE WHEN random() < 0.9 THEN 'present' ELSE 'absent' END
FROM enrollments e
CROSS JOIN generate_series(NOW() - INTERVAL '28 days', NOW(), INTERVAL '7 days') d
ON CONFLICT DO NOTHING;

-- ── notifications ──────────────────────────────────────────────────
-- For admin (Vik): consent-pending alerts
INSERT INTO notifications (user_id, kind, title, body) VALUES
  ('11111111-1111-1111-1111-111111111111', 'consent_pending', 'Consent awaited: Aarav — Diction Drill #4', 'Parent hasn''t approved this for public sharing yet.'),
  ('11111111-1111-1111-1111-111111111111', 'consent_pending', 'Consent awaited: Kabir — Impromptu',         'Sent to parent 2 days ago.'),
  ('11111111-1111-1111-1111-111111111111', 'consent_pending', 'Consent awaited: Sanya — Confidence',        'Sent to parent 2 days ago.'),
  ('11111111-1111-1111-1111-111111111111', 'asset_ready',     'New upload ready: Meera — Partner scene',    'Mux transcoding complete.'),
  ('11111111-1111-1111-1111-111111111111', 'class_reminder',  'Tomorrow 6:30 PM — Thursday batch',          'Showcase rehearsal scheduled.');

-- For Aarav (student id 33333333-...01)
INSERT INTO notifications (user_id, kind, title, body) VALUES
  ('33333333-3333-3333-3333-000000000001', 'asset_ready',    'New upload on your channel: Hamlet · Act III', 'Live now.'),
  ('33333333-3333-3333-3333-000000000001', 'feedback',       'Vik left feedback on Intro Piece',             'Watch pacing at line 47 — beat-work exercise.'),
  ('33333333-3333-3333-3333-000000000001', 'class_reminder', 'Class reminder: Thursday 6:30 PM',             'Showcase rehearsal for Act III.');

-- For parent Rajesh (has 2 kids — Aarav + Rohan)
INSERT INTO notifications (user_id, kind, title, body) VALUES
  ('22222222-2222-2222-2222-000000000001', 'consent_pending', 'Consent needed: Aarav — Diction Drill #4', 'Open to approve or deny.'),
  ('22222222-2222-2222-2222-000000000001', 'fee_due',         'May fees due on 1 May',                    'Invoice ₹4,500 for Aarav + ₹5,000 for Rohan.');

-- For parent Lakshmi (Priya + Meera)
INSERT INTO notifications (user_id, kind, title, body) VALUES
  ('22222222-2222-2222-2222-000000000002', 'consent_pending', 'Consent needed: Meera — Partner scene',  'Awaiting your approval.'),
  ('22222222-2222-2222-2222-000000000002', 'fee_due',         'May fees due on 1 May',                  'Invoice ₹4,500 for Priya + ₹4,500 for Meera.');

-- ── payments (last 3 cycles for Rajesh) ────────────────────────────
INSERT INTO payments (user_id, razorpay_order_id, amount_paise, status, period) VALUES
  ('22222222-2222-2222-2222-000000000001', 'order_demo_mar_a', 450000, 'paid', '2026-03'),
  ('22222222-2222-2222-2222-000000000001', 'order_demo_apr_a', 450000, 'paid', '2026-04'),
  ('22222222-2222-2222-2222-000000000002', 'order_demo_mar_l', 450000, 'paid', '2026-03'),
  ('22222222-2222-2222-2222-000000000002', 'order_demo_apr_l', 450000, 'paid', '2026-04');

COMMIT;

-- ── verify ─────────────────────────────────────────────────────────
SELECT 'users'      AS t, count(*) FROM users
UNION ALL SELECT 'batches',        count(*) FROM batches
UNION ALL SELECT 'enrollments',    count(*) FROM enrollments
UNION ALL SELECT 'assets',         count(*) FROM assets
UNION ALL SELECT 'consents',       count(*) FROM consents
UNION ALL SELECT 'rubric_scores',  count(*) FROM rubric_scores
UNION ALL SELECT 'notes',          count(*) FROM notes
UNION ALL SELECT 'announcements',  count(*) FROM announcements
UNION ALL SELECT 'attendance',     count(*) FROM attendance
UNION ALL SELECT 'notifications',  count(*) FROM notifications
UNION ALL SELECT 'payments',       count(*) FROM payments;
