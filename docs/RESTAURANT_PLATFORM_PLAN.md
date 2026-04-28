# 🍽️ Restaurant Booking Platform – Implementation Plan
## "World's Best Restaurant Website with Immersive 3D Experience"

---

## 📌 VISION
A premium restaurant & banquet hotel booking platform featuring:
- **Interactive 3D venue walkthroughs** (first-of-its-kind for Indian restaurants)
- **Video gallery** with chef spotlights, ambiance reels, menu showcases
- **Smart event booking** (weddings, corporate events, private dinners)
- **AI-powered personalization** (recommendations, dietary preferences)
- **Real-time table management** with floor plans
- **Social features** (reviews, photos, influencer collaborations)

---

## 📊 PHASE ROADMAP

### **PHASE 1: MVP (Weeks 1-4) – Discovery & Content Showcase**
#### Core Features (NO BOOKING, NO PAYMENTS):
- [ ] Restaurant profiles (name, cuisine, location, hours, pricing, ambiance)
- [ ] Video gallery (Mux hosting, lazy-loaded, categorized)
- [ ] Restaurant search & filter (location, cuisine, capacity, price range, highlights)
- [ ] Read-only reviews & ratings (aggregated)
- [ ] Image gallery (ambiance, food, events)
- [ ] Restaurant admin panel (edit profile, upload videos/images, manage reviews)
- [ ] No authentication required for browsing

#### Tech Details:
```
Frontend (Next.js):
  - /                    — home (featured restaurants, trending videos)
  - /restaurants         — discovery/search page
  - /restaurants/[id]    — detail page (profile, videos, images, reviews)

API (Go):
  - POST /admin/restaurants         — restaurant onboarding (simple form)
  - GET /restaurants                — list with filters
  - GET /restaurants/{id}           — detail + videos + images
  - POST /admin/restaurants/{id}/videos    — upload video
  - POST /admin/restaurants/{id}/images    — upload images
  - GET /reviews/{restaurant_id}    — read-only reviews

Database:
  - restaurants (id, name, cuisine, location, hours, pricing, highlights)
  - videos (id, restaurant_id, mux_asset_id, title, type, views)
  - images (id, restaurant_id, url, type, caption)
  - reviews (id, restaurant_id, rating, comment, user_name)
```

#### Deliverables:
- [ ] Restaurant discovery page with filters
- [ ] Video gallery (Mux player integrated)
- [ ] Image carousel per restaurant
- [ ] Reviews section (read-only, paginated)
- [ ] Restaurant admin dashboard (no auth, password-protected link)
- [ ] Database migrations
- [ ] Mobile responsive design
- [ ] Deployed MVP on Vercel/Fly.io

---

### **PHASE 2: 3D Venue Tours (Weeks 5-8) – Interactive Exploration**
#### Technologies:
1. **Three.js + React Three Fiber** — interactive 3D scenes
2. **Babylon.js alternative** — if heavier graphics needed
3. **Matterport 3D Tours** — professional photogrammetry (premium tier)
4. **Custom 3D floor plans** — seating visualization

#### Features:
- [ ] 3D interactive restaurant walkthrough
  - Drag to rotate, scroll to zoom
  - Clickable hotspots (bar, kitchen, private rooms)
  - AR preview on mobile (WebXR)
- [ ] Floor plan editor (admin creates seating zones)
- [ ] Real-time table availability overlay
- [ ] Virtual table reservation (see exact seating)
- [ ] 360° ambiance videos for each zone

#### Implementation:
```
Frontend Components:
  /3d-tour/[restaurantId]
    - SceneRenderer (Three.js canvas)
    - HotspotLayer (clickable points)
    - TableSelector (available seats)
    - ARViewer (mobile AR)

API Endpoints:
  - GET /restaurants/{id}/3d-config     — 3D model + hotspots
  - GET /restaurants/{id}/floor-plan    — table layout
  - GET /restaurants/{id}/tables        — real-time availability
```

#### Deliverables:
- [ ] 3D viewer component library (reusable)
- [ ] Sample 3D models (Blender → glTF export)
- [ ] Floor plan management UI
- [ ] AR preview on iOS/Android
- [ ] Performance optimized (LOD, baking)

---

### **PHASE 3: Influencer & Social Features (Weeks 9-11)**
#### Features:
- [ ] User reviews with photos (enable guest uploads)
- [ ] Influencer verification badges
- [ ] Trending restaurants widget
- [ ] Social feed (latest reviews, popular videos)
- [ ] Share to WhatsApp/Instagram
- [ ] Email newsletter (trending restaurants)

#### Deliverables:
- [ ] Review submission form (email verification only, no login)
- [ ] Photo upload UI (multiple images per review)
- [ ] Trending page & widgets
- [ ] Share buttons integration
- [ ] Analytics dashboard for restaurant owners

---

### **PHASE 4: Event Booking System (Weeks 12-14)**
#### Features:
- [ ] Availability calendar per restaurant
- [ ] Event booking form (date, time, guests, special requests)
- [ ] Event confirmation via email
- [ ] Restaurant admin: booking dashboard
- [ ] Booking status tracking (pending, confirmed, completed)
- [ ] WhatsApp notification integration

#### Tech Details:
```
Frontend (Next.js):
  - /restaurants/[id]/book    — booking form (modal or page)
  - /admin/bookings           — booking management dashboard

API (Go):
  - POST /events              — create booking (no payment)
  - GET /events/{id}          — booking details
  - GET /admin/events         — restaurant's bookings
  - PATCH /admin/events/{id}  — confirm/reject booking

Database:
  - events (id, restaurant_id, date, time, guests, special_requests, status)
  - bookings_config (restaurant_id, available_dates, max_capacity)
```

#### Deliverables:
- [ ] Booking flow (no payment)
- [ ] Email confirmations (Resend)
- [ ] WhatsApp notifications (MSG91)
- [ ] Restaurant booking dashboard

---

### **PHASE 5: Payment & Customization (Weeks 15-16)**
#### Features:
- [ ] Deposit collection via Razorpay (optional for restaurants)
- [ ] Event customization (menu, decorations, activities)
- [ ] Catering menu management
- [ ] E-contract generation
- [ ] Invoice & receipt system

#### Deliverables:
- [ ] Payment integration
- [ ] Event customization UI
- [ ] Contract generation
- [ ] Invoice management

---

### **PHASE 3-OLD: Intelligent Booking (Weeks 9-11) [DEPRECATED - moved to Phase 4]**

---

## 🛠️ TECH STACK ADDITIONS

### 3D & Visualization
```
- three.js@^r166              — 3D renderer
- @react-three/fiber         — React wrapper
- @react-three/drei          — 3D utils (loaders, controls)
- @react-three/postprocessing — effects
- babylon.js (optional)       — alternative renderer
- Matterport SDK (paid)       — professional tours
```

### Admin & UX
```
- @tanstack/react-table      — data tables
- recharts / visx            — analytics charts
- zustand (existing)         — state management
- jspdf / html2pdf           — document generation
- react-hook-form (existing) — forms
```

### Backend (Go)
```
- colly                      — web scraping (menus)
- gofiber alternative        — keep chi router
- pgvector                   — vector embeddings (AI recommendations)
- gRPC (optional)            — server-to-server
```

### Deployment & Infrastructure
```
- S3 / Cloudflare R2         — 3D model & image CDN
- Redis (optional)           — caching, real-time table status
- Stripe (alternative)       — if Razorpay issues
- Supabase (alternative)     — vector DB for recommendations
```

---

## 📁 DIRECTORY STRUCTURE

```
victor-sir/
├── api/
│   └── internal/
│       ├── restaurants/      — restaurant CRUD, onboarding
│       ├── events/           — booking, customization
│       ├── videos/           — Mux integration
│       ├── payments/         — Razorpay webhooks
│       ├── ai/               — recommendations engine
│       └── admin/            — super-admin endpoints
│
├── web/
│   └── app/
│       ├── (public)/
│       │   ├── page.tsx           — home (3D showcase)
│       │   ├── restaurants/        — discovery
│       │   ├── [id]/              — detail + 3D tour
│       │   └── bookings/          — booking flow
│       ├── (auth)/
│       │   └── login/             — OTP auth
│       ├── dashboard/
│       │   ├── /bookings          — user's events
│       │   └── /profile           — preferences
│       ├── admin/
│       │   ├── restaurants/       — manage restaurant
│       │   ├── bookings/          — booking mgmt
│       │   └── 3d-editor/         — tour editor
│       ├── components/
│       │   ├── 3d/
│       │   │   ├── SceneRenderer.tsx
│       │   │   ├── FloorPlan.tsx
│       │   │   └── HotspotLayer.tsx
│       │   ├── booking/
│       │   │   ├── BookingForm.tsx
│       │   │   └── EventCustomizer.tsx
│       │   └── video/
│       │       └── VideoGallery.tsx
│       └── lib/
│           ├── api.ts        — API client (generated)
│           ├── 3d-utils.ts   — 3D helpers
│           └── hooks/        — React hooks
│
├── mobile/
│   └── lib/
│       ├── features/
│       │   ├── restaurants/
│       │   ├── bookings/
│       │   └── 3d_viewer/    — AR viewer
│       └── models/
│
├── docs/
│   ├── RESTAURANT_PLATFORM_PLAN.md (this file)
│   ├── 3D_ARCHITECTURE.md
│   ├── API_RESTAURANT_SPEC.md
│   ├── ONBOARDING_FLOW.md
│   ├── MATTERPORT_GUIDE.md
│   └── DEPLOYMENT_RESTAURANT.md
│
└── openapi.yaml (updated with new endpoints)
```

---

## 🎯 MVP MILESTONES (16 Weeks)

| Week | Phase | Milestone |
|------|-------|-----------|
| 1-2 | Phase 1 | Restaurant discovery + video gallery live |
| 3-4 | Phase 1 | Admin panel + image uploads working |
| 5-6 | Phase 2 | Basic 3D viewer + sample tours |
| 7-8 | Phase 2 | Floor plans + real-time table visualization |
| 9-10 | Phase 3 | Reviews system + social features |
| 11 | Phase 3 | Trending page + influencer badges |
| 12-13 | Phase 4 | Booking system + email confirmations |
| 14 | Phase 4 | Restaurant booking dashboard |
| 15-16 | Phase 5 | Payment integration + customization |

---

## 💰 COST ESTIMATES (First Year)

| Service | Estimated Cost | Purpose |
|---------|----------------|---------|
| Vercel Pro | $20/mo | Web hosting |
| Fly.io | $50/mo | API hosting |
| Neon Postgres | $50/mo | Database |
| Mux (video) | $0.05/min (pay-as-you-go) | Video streaming (~$300/mo) |
| Razorpay | 2% per txn | Payments (no setup fee) |
| Matterport (optional) | $600/yr/tour | 3D tours (if used) |
| S3 / Cloudflare R2 | ~$50/mo | Image & model CDN |
| SendGrid / Resend | $20/mo | Transactional emails |
| **TOTAL** | **~$1,200-1,500/mo** | All-in ops |

---

## 🚀 SUCCESS METRICS

**Phase 1 Success:**
- 50+ restaurants onboarded (video + images uploaded)
- 100K+ monthly page views
- 4.5+ star avg rating
- 1000+ reviews

**Phase 2 (3D) Success:**
- 50% increase in time-on-site (3D tour engagement)
- <2s 3D load time (LCP optimization)
- AR feature used in 20% of mobile sessions

**Phase 4 (Booking) Success:**
- 1000+ bookings per month
- <1% bounce rate from video gallery → booking

**Phase 5 (Payments) Success:**
- 10,000 monthly active users
- $50K+ monthly GMV
- <2% booking cancellation rate

---

## 🎨 UNIQUE SELLING POINTS

1. **3D Interactive Tours** — No other Indian restaurant platform has this
2. **Real-time Table Visibility** — See exactly where you'll sit
3. **Smart Meal Matching** — AI suggests perfect table based on your profile
4. **Influencer Ecosystem** — Built-in collab tools for creators
5. **One-stop Event Hub** — Book + customize + pay + manage all-in-one

---

## 📋 NEXT STEPS

1. ✅ Review this plan with team
2. ⬜ Design Figma wireframes (Phase 1)
3. ⬜ Update OpenAPI spec with restaurant endpoints
4. ⬜ Setup database migrations (restaurants, videos, events)
5. ⬜ Create API stubs (chi router endpoints)
6. ⬜ Build restaurant discovery UI (Next.js page)
7. ⬜ Integrate Mux video player
8. ⬜ Start Phase 2 3D research (Three.js samples)

---

## 📞 QUESTIONS FOR PRODUCT

- [ ] Target launch date?
- [ ] Priority: 3D tours or social features first?
- [ ] Regional focus (Mumbai, Delhi, all India)?
- [ ] Exclude certain restaurant types? (Cloud kitchens, fast food?)
- [ ] Commission model? (% of booking value?)
- [ ] White-label for individual restaurant apps?

---

**Status:** 🟡 Plan Ready for Review  
**Last Updated:** 2026-04-28  
**Maintained By:** Victor Sir Platform Team
