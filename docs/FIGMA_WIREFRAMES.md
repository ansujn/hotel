# Figma Wireframe Spec — Vik Prasad Theatre Platform
**v0.1 · 2026-04-14**

A designer (or you) can open a blank Figma file and build directly from this spec.
I can't create a `.fig` file from here, but this doc is structured so each section = one Figma frame.

---

## 0. Figma file structure

Create one Figma file: **"Vik Theatre — v0.1"**
Pages (left sidebar):
1. 🎨 **Design System** — colors, type, components
2. 📱 **Student Platform** — Screens 1–12
3. 🌐 **Company Site + Social Hub** — Screens 13–18
4. 🧩 **Flows** — arrows linking screens

Frame size: Desktop **1440×900**, Mobile **390×844** (iPhone 14).

---

## 1. Design System (Page 1)

**Colors**
- `--bg`           `#0B0B0F`  (cinematic near-black)
- `--surface`      `#15151C`
- `--primary`      `#E8C872`  (stage-gold)
- `--accent`       `#8B5CF6`  (purple spotlight)
- `--text`         `#F5F5F7`
- `--text-muted`   `#9CA3AF`
- `--success`      `#10B981`
- `--danger`       `#EF4444`

**Type** — Headings: *Fraunces* (serif, theatrical) · Body: *Inter*
- H1 56/64 · H2 40/48 · H3 28/36 · Body 16/24 · Caption 13/18

**Components to build first**
Button (primary/ghost/danger) · Input · Avatar · Tag/Chip · VideoCard · StudentCard · Nav (top + sidebar) · Modal · Toast · Privacy Badge (Private/Public/Pending Consent).

---

## 2. Student Platform Screens (Page 2)

### Screen 1 — **Login / Role Switcher**
- Left: brand logo + tagline ("Where every voice finds its stage").
- Right: tabs → *Student · Parent · Instructor*. Phone + OTP (MSG91).
- Mobile: stacked.

### Screen 2 — **Student Dashboard (home)**
Top nav: Logo · My Channel · Batch · Progress · Notifications · Avatar.
Hero card: "Welcome back, Aarav 👋" + today's class + next assignment.
Grid:
- Card A — Latest monologue uploaded (thumbnail + play)
- Card B — Progress ring (4 rubric dims)
- Card C — Upcoming batch session (date/time/zoom link)
- Card D — Announcements feed

### Screen 3 — **Student Channel (the centerpiece)**
Think YouTube channel × cinematic portfolio.
- Banner image (16:9), overlay: Name, batch, instructor, "since 2026".
- Tabs: *Monologues · Scenes · Showcases · Catalog · About*
- Grid of VideoCards (thumbnail, title, date, Privacy Badge).
- If viewer is public & content is public → plays inline. If private → login prompt.

### Screen 4 — **Video Detail**
- Mux player (16:9 top).
- Below: title, date, instructor notes (collapsible), rubric scores for this piece, comments (instructor-only private thread).
- Right rail: related videos from same student.

### Screen 5 — **Batch Page**
- Batch name, schedule, instructor, 10 student avatars.
- Tabs: *Roster · Calendar · Announcements · Shared Resources*.
- Instructor sees attendance toggle inline.

### Screen 6 — **Progress / Catalog**
- Radar chart: Diction · Stage Presence · Memorization · Confidence · Improvisation.
- Timeline of assessments (date, rubric snapshot, instructor note).
- Downloadable PDF report button.

### Screen 7 — **Parent Dashboard**
Separate simplified view.
- Top: child's name + batch.
- Sections: Recent uploads (with Privacy Badge), Consent Center, Fees, Attendance, Instructor messages.
- Prominent **"Give Consent to Publish"** card when pending items exist.

### Screen 8 — **Parent Consent Flow** ⭐ (DPDP-critical)
Modal / dedicated screen, 3 steps:
1. **Review** — thumbnail preview of the clip/photo + context ("Aarav's monologue from Apr 10 class").
2. **Scope** — toggles: allow on student's public channel · allow on company social (IG/YT/FB) · allow in brochures. Each independently toggleable + time-bound (6/12/24 mo).
3. **Verify + Sign** — parent OTP + typed full name + date. Store: IP, timestamp, user-agent, consent version.
Copy should be bilingual (English + Hindi toggle).

### Screen 9 — **Admin Upload**
- Drag-drop video/photo/PDF.
- Form: Student (searchable), Batch, Type (monologue/scene/showcase/catalog), Tags, Instructor note, Rubric scores (sliders).
- Privacy: default **Private**. Dropdown: Private · Request Parent Consent · Public (if consent on file).
- On publish: if consent missing, auto-email parent with review link.

### Screen 10 — **Admin — Students**
Table: name, batch, parent contact, # videos, consent status, last activity. Bulk actions: add to batch, export.

### Screen 11 — **Admin — Batches**
Kanban-style columns per batch; drag students between.

### Screen 12 — **Notifications Center**
Stream: consent requests, new upload, instructor comment, upcoming class, fee due.

---

## 3. Company Site + Social Hub (Page 3)

### Screen 13 — **Landing Page**
Hero: full-bleed video of a student mid-monologue + tagline + CTA "Book a Trial Class".
Sections: Why us · Classes (Theatre / Public Speaking / Kids / Adults) · Featured Student Channels (consented only) · Testimonials · Instructor bios · Press/Media · FAQ · Footer.

### Screen 14 — **Classes / Batches Listing**
Cards per batch: level, age group, schedule, fee, "Enquire" button.

### Screen 15 — **Enquiry / Trial Booking**
Short form → Razorpay link (optional ₹ trial fee) → WhatsApp confirmation.

### Screen 16 — **Blog / Showcase Feed**
Mix of written posts + student highlight reels.

### Screen 17 — **Admin — Social Hub**
Single dashboard:
- Left: content library (auto-pulled clips from consented uploads).
- Middle: composer — caption, hashtags, platform toggles (IG Reel / YT Short / FB / LinkedIn).
- Right: calendar view (daily slots).
- Integration: Buffer or Metricool API under the hood.

### Screen 18 — **Admin — Auto-Clip Studio**
Pick a long monologue → AI suggests 3 vertical 30-sec clips → preview → one-click "Send to Social Hub".

---

## 4. Flows (Page 4)

Draw arrows connecting:
- **Upload flow**: Admin Upload (S9) → Consent Request email → Parent Consent (S8) → Asset goes Public → visible on Student Channel (S3) + Social Hub library (S17).
- **Student daily flow**: Login (S1) → Dashboard (S2) → Channel (S3) → Video (S4).
- **Parent flow**: Login (S1) → Parent Dashboard (S7) → Consent (S8).
- **Company acquisition flow**: Landing (S13) → Classes (S14) → Enquiry (S15) → CRM.

---

## 5. Handoff Checklist (for the designer)

- [ ] Build Design System page first (colors, type, 8 core components).
- [ ] Desktop + mobile variants for every screen.
- [ ] Dark mode only for v1 (cinematic feel).
- [ ] All copy bilingual-ready (English + Hindi) — leave space for longer Devanagari strings.
- [ ] Empty states for: no videos yet, no consent yet, no batch yet.
- [ ] Error + loading states for upload and player.
- [ ] Export specs + tokens as Tailwind config via Figma Tokens plugin.

---

## 6. Two ways to produce the actual Figma file

**Option A — Hire a designer (recommended, 2 weeks, ₹60k–1.2L)**
Share this doc + 3 reference sites (MasterClass, Vimeo, Circle.so). Ask for v1 in 2 weeks.

**Option B — DIY with AI assist**
1. Open Figma → new file → paste this spec into frames as text placeholders.
2. Use **Figma "First Draft" AI** (built-in) or **Galileo AI / Uizard** to generate screens from the descriptions above.
3. Clean up in Figma.

---

## 7. What I'll do next (on your "go")

1. Produce the **data model SQL** (Supabase) that this UI implies.
2. Produce the **parent consent email + in-app copy** (English + Hindi), DPDP-compliant.
3. Scaffold the Next.js repo with routes mirroring these 18 screens.
