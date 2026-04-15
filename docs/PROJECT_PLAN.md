# Vik Prasad — Theatre & Public Speaking Platform
**Rough Project Plan · v0.2 · 2026-04-14**

**Locked decisions:** India · Custom build · Pilot = 3 batches × 10 students (~30 users).
**Stack:** Next.js 15 + TypeScript + Tailwind + shadcn/ui · Supabase (auth/Postgres/storage) · Mux (video) · Vercel · Razorpay · MSG91 (SMS/OTP) · Resend (email).
**Compliance:** India DPDP Act 2023 — verifiable parental consent for all minors.

---

## 1. Vision

Two connected products:

- **Product A — Student Platform ("Channels")**: Every student gets a profile/channel. Instructors upload monologues, performance videos, class catalogs, progress notes. Each piece of content is either **Private** (student logs in to view) or **Public** (with parental consent, shareable like a YouTube channel).
- **Product B — Company Site + Social Engine**: A marketing site that showcases the brand, classes, batches, and testimonials, paired with a workflow to publish daily content to Instagram / YouTube / Facebook / LinkedIn.

---

## 2. Benchmark Websites (inspiration)

Study these and cherry-pick features:

| Category | Reference | What to steal |
|---|---|---|
| Student video channels | **YouTube / Vimeo Showcase** | Per-user channel, privacy controls, embed |
| Acting education brand | **MasterClass, Backstage, Spotlight.com** | Polished landing, clean course catalog |
| School portals | **Teachable, Thinkific, Kajabi** | Enroll → batch → content gated login |
| Portfolio feel | **Squarespace / Wix templates** | Minimal, performance-arts aesthetic |
| Community & feed | **Circle.so, Skool** | Batch-wise community, parent access |
| Social publishing | **Buffer, Later, Metricool** | Daily multi-channel scheduling |

Target aesthetic: clean, cinematic, dark-mode friendly (like MasterClass + Vimeo).

---

## 3. Core Feature List

### Product A — Student Platform
1. **Auth**: Student login, Parent login, Instructor/Admin login (3 roles).
2. **Student Channel**: cover image, bio, batch, instructor, list of videos/catalogs.
3. **Content Upload**: Admin uploads mono­logues, class recordings, photos, PDFs.
4. **Privacy Toggle per asset**: `Private` (default) · `Public-with-parent-consent`.
5. **Parent Consent Flow**: e-sign / checkbox form emailed to parent; logged with timestamp.
6. **Batches**: group students; batch-wide announcements, calendar, attendance.
7. **Progress Catalog**: rubric — diction, stage presence, memorization, confidence.
8. **Search / Discovery** (public channels only).
9. **Comments / Feedback** (instructor → student, private).
10. **Certificates** generated at milestones.

### Product B — Company Site + Social
1. Landing page, About, Classes, Batches, Enquiry form, Testimonials, Blog.
2. Lead capture → CRM (HubSpot free or Notion).
3. **Social Hub**: a single dashboard where your team drafts a post once and schedules to IG/YT/FB/LI via **Buffer** or **Metricool** API.
4. Content calendar (daily cadence).
5. Auto-clip tool: pull 30-sec vertical clips from student monologues (with consent) → reels.

---

## 4. Recommended Tech Stack (build-vs-buy)

**Fastest path (no-code / low-code, 4–8 weeks):**
- Front-end & hosting: **Webflow** or **Framer** (marketing site)
- Student portal: **Memberstack / Outseta** on Webflow, OR **Softr + Airtable**
- Video hosting: **Vimeo OTT** or **Mux** (private + public, signed URLs)
- Auth + DB (if custom): **Supabase**
- Payments: **Stripe / Razorpay**
- Social scheduling: **Buffer** or **Metricool**
- Email + consent: **Loops / Mailchimp** + **DocuSign Click**

**Custom build (12–16 weeks, more flexible):**
- Next.js + Tailwind + shadcn/ui
- Supabase (auth, Postgres, storage) or Firebase
- Mux for video (HLS, signed playback)
- Vercel hosting
- Role-based access (Student / Parent / Instructor / Admin)

**Recommendation:** Start **no-code (Softr + Airtable + Mux)** to validate with first 2 batches, migrate to custom Next.js build once you have ≥100 active students.

---

## 5. Phased Roadmap

### Phase 0 — Discovery (Week 1)
- Lock brand name, logo, colors, domain.
- Define 3 student personas + 1 parent persona.
- List every content type (monologue video, headshot, PDF script, attendance, report card).

### Phase 1 — MVP Student Platform (Weeks 2–6)
- Auth (student + parent + admin)
- Student channel page
- Admin upload + privacy toggle
- Parent consent flow
- Batch grouping
- Pilot: onboard **1 batch (~10 students)**

### Phase 2 — Company Site + Social Engine (Weeks 5–9, parallel)
- Marketing site live
- Enquiry → lead pipeline
- Buffer/Metricool connected to IG, YT, FB, LI
- Editorial calendar with daily slots

### Phase 3 — Expand (Weeks 10–16)
- Progress rubric + certificates
- Comments, parent dashboard
- Auto-clip reels from consented content
- Payments + online enrollment

### Phase 4 — Scale
- Mobile app (React Native / Expo)
- Public discovery + SEO for student channels
- Analytics dashboard for parents

---

## 6. Team / Skills Needed

| Role | Why | Hire type |
|---|---|---|
| Product / PM | Own roadmap + priorities | You (Vik) initially |
| Designer (UI/UX) | Figma mockups, brand | Freelancer, 4 weeks |
| Full-stack dev (Next.js + Supabase) | Custom build | 1 FT or 2 freelancers |
| Video ops | Capture, edit, upload class videos | Part-time editor |
| Social media manager | Daily posting cadence | Part-time |
| Legal/Compliance | Minor consent, data privacy (DPDP Act India / COPPA US) | Consultant, one-off |

---

## 7. Critical Risks

1. **Minor data & consent** — students are minors. Non-negotiable: parental consent flow, data-deletion on request, encrypted storage. Consult a lawyer for **DPDP Act (India)** or **COPPA (US)** compliance depending on geography.
2. **Video storage cost** — cheap on Mux/Bunny.net, expensive on AWS raw. Budget ~₹15–30 per student per month.
3. **Content workload** — daily social posting needs a real person, not just a tool.
4. **Scope creep** — resist building LMS + community + social tool all in month 1.

---

## 8. Rough Budget (first 6 months, India)

| Item | Est. |
|---|---|
| Design | ₹60k–1.2L one-time |
| Dev (no-code MVP) | ₹1.5–3L |
| Dev (custom build) | ₹6–12L |
| Video hosting (Mux) | ₹5–15k/mo |
| Tools (Buffer, email, domain) | ₹5k/mo |
| Social media freelancer | ₹25–40k/mo |

---

## 9. Next Steps (this week)

1. Confirm geography (India? US?) → drives compliance + payments.
2. Pick build track: **no-code MVP** vs **custom**.
3. Choose 1 pilot batch of ~10 students.
4. I'll draft: (a) Figma wireframes, (b) data model, (c) parent-consent email template.

---

## Sources / References
- [Vimeo Education Solutions](https://vimeo.com/solutions/education-solutions)
- [Backstage: Actor Website Guide](https://www.backstage.com/magazine/article/every-actor-needs-website-5152/)
- [Spotlight: Acting Website Tips](https://www.spotlight.com/news-and-advice/the-industry/create-an-acting-website-tips/)
- [Colorlib: 20 Best Student Portfolios 2026](https://colorlib.com/wp/student-portfolios/)
- [Educational Theatre Association — The Portfolio](https://schooltheatre.org/theportfolio/)
- [Kennedy Center: Portfolios in the Arts](https://www.kennedy-center.org/education/resources-for-educators/classroom-resources/articles-and-how-tos/articles/educators/critique--feedback/portfolios-assessment-across-the-arts/)
