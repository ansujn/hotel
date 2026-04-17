# Dev Credentials & User Flow

Local dev DB is seeded via `api/migrations/seed_realistic.sql`.
Log in at **http://localhost:3000/login**. OTP bypass code for everyone: **`000000`**.

---

## 🔐 Credentials

### Staff (2)

| Role       | Phone              | Name       | Lands on                |
| ---------- | ------------------ | ---------- | ----------------------- |
| admin      | `+91-9000000001`   | Vik Prasad | `/admin/students`       |
| instructor | `+91-9000000002`   | Anita Rao  | `/admin/students`       |

### Parents (4) — share 10 kids between them

| Phone              | Name           | Children                      |
| ------------------ | -------------- | ----------------------------- |
| `+91-9000001001`   | Rajesh Sharma  | **Aarav** + **Rohan**         |
| `+91-9000001002`   | Lakshmi Menon  | **Priya** + **Meera**         |
| `+91-9000001003`   | Arjun Singh    | **Kabir** + **Sanya**         |
| `+91-9000001004`   | Shalini Iyer   | Vihaan + Ananya + Ishaan + Tara |

Parents log in to **`/parent`** — their own dashboard with consent center + fees.

### Students (10)

| Phone              | Name          | Batch             | Content            |
| ------------------ | ------------- | ----------------- | ------------------ |
| `+91-9000002001`   | Aarav Sharma  | Thursday Evening  | 5 assets (star) ⭐ |
| `+91-9000002002`   | Priya Menon   | Thursday Evening  | 3 assets           |
| `+91-9000002003`   | Kabir Singh   | Thursday Evening  | 2 assets           |
| `+91-9000002004`   | Meera Iyer    | Thursday Evening  | 2 assets           |
| `+91-9000002005`   | Rohan Desai   | Saturday Morning  | 1 asset            |
| `+91-9000002006`   | Sanya Kapoor  | Saturday Morning  | 1 asset            |
| `+91-9000002007`   | Vihaan Reddy  | Sunday Kids       | 2 assets           |
| `+91-9000002008`   | Ananya Rao    | Sunday Kids       | 1 asset (private)  |
| `+91-9000002009`   | Ishaan Nair   | Sunday Kids       | 0 (new student)    |
| `+91-9000002010`   | Tara Joshi    | Sunday Kids       | 0 (new student)    |

Students log in to **`/home`**.

**Best demo logins:**
- **Admin** → `+91-9000000001` — sees all 10 students, 3 batches, social hub, clip studio, 5 notifications with 3 pending consents.
- **Parent** → `+91-9000001001` (Rajesh) — sees Aarav + Rohan, 1 pending consent, paid April fees.
- **Student** → `+91-9000002001` (Aarav) — his channel has 5 assets (3 public), rubric scores, instructor notes, 3 notifications.

---

## 🔁 The content flow (who does what)

```
   ┌─── 1. Admin/Instructor ─────────┐      ┌──── 2. Parent ──────┐     ┌─── 3. Everyone ──┐
   │                                 │      │                     │     │                  │
   │  /admin/students  add student   │      │  /parent            │     │  /channel/:id    │
   │  /admin/upload    upload video  │ ───► │  ✉ + 📱 consent link │ ──► │  public videos   │
   │  /admin/assets/.. score rubric  │      │  toggle scope + OTP │     │  rubric scores   │
   │  /admin/social    social hub    │      │  sign → becomes public │     │  instructor notes│
   │  /admin/clips     AI clip studio│      │                     │     │                  │
   └─────────────────────────────────┘      └─────────────────────┘     └──────────────────┘
```

### Onboarding a new student — step-by-step

1. **Admin** (`/admin/students` → _Add student_) enters name + parent phone.
2. System upserts a `student` user and a `parent` user (if parent phone is new), links them via `parents_students`.
3. Admin assigns to a batch from `/admin/batches` (drag-and-drop).
4. Parent gets a welcome SMS (via MSG91). First time they log in, they land on `/parent`.
5. Student can log in too (their own phone) — lands on `/home`.

### Uploading and publishing a video

1. **Instructor/Admin** opens `/admin/upload`.
2. Picks student + type (monologue/scene/showcase/catalog), writes title + note + rubric sliders.
3. Picks privacy:
   - **Private** → only the student + staff can see it.
   - **Request parent consent** → asset privacy set to `pending_consent`; parent receives an email + SMS with a tokenized link.
4. Browser PUTs the video file directly to Mux (via server-signed upload URL — no middleman).
5. Mux transcodes; webhook hits `/v1/webhooks/mux` → asset gets `mux_playback_id`.
6. Parent opens the consent link → previews the clip → toggles scope (channel / social / print / validity) → OTP-verifies → signs.
7. Consent recorded with IP + UA + signed PDF; asset flips to `public`.
8. Asset appears on the student's public channel, in the Social Hub library, and in the AI clip-studio pool.

### Who can create users?

| Who      | Can create                                                      |
| -------- | --------------------------------------------------------------- |
| Admin    | students, parents, instructors, batches                         |
| Instructor | nothing (view-only for roster; can score assets + add notes) |
| Parent   | nothing (but signs consent on behalf of their children)         |
| Student  | nothing                                                         |

---

## 🛠 Reset the DB to this dataset

```bash
export PGPASSWORD=password
psql -h localhost -U postgres -d vik -f api/migrations/seed_realistic.sql
```

The seed is **destructive** (`TRUNCATE ... RESTART IDENTITY CASCADE`) so it nukes all rows and re-inserts. Safe to re-run whenever you want a clean demo.

## 🧪 Quick smoke tests after seeding

```bash
# admin login
curl -s -X POST http://localhost:8080/v1/auth/otp/verify \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+91-9000000001","code":"000000"}' | jq .

# Aarav's public channel (3 public assets expected)
curl -s http://localhost:8080/v1/students/33333333-3333-3333-3333-000000000001/channel | jq '.student.name, (.assets | length)'
```
