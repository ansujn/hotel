# 🎯 Kibana Jaipur Website - Deployment Plan

**Project:** Premium Restaurant & Banquet Venue Website  
**Restaurant:** Kibana Jaipur  
**Domain:** kibana.saudagars.org  
**Status:** Phase 1 MVP - Ready for Production  
**Launch:** TODAY  

---

## 📱 Website Structure (Single Restaurant)

```
kibana.saudagars.org/

├── / (Home)
│   ├── Hero with featured video
│   ├── About Kibana (brief)
│   ├── Featured testimonials carousel
│   ├── Call-to-action buttons (Book Event, View Gallery)
│   └── Contact section

├── /menu
│   ├── Appetizers
│   ├── Main courses
│   ├── Desserts
│   ├── Beverages
│   └── Special dishes (with images)

├── /banquets
│   ├── Banquet Hall 1 (photos, capacity, pricing)
│   ├── Banquet Hall 2
│   ├── Banquet Hall 3
│   ├── Outdoor space
│   └── Services included (catering, decor, etc)

├── /gallery
│   ├── Restaurant ambiance (40+ images)
│   ├── Food showcase (20+ images)
│   ├── Banquet events (30+ images)
│   └── Videos (ambiance, events, testimonials)

├── /reviews
│   ├── Customer testimonials (5-star reviews)
│   ├── Wedding reviews
│   ├── Corporate event reviews
│   └── Private party reviews

├── /book
│   ├── Event booking form
│   ├── Date picker
│   ├── Guest count
│   ├── Occasion type (wedding, corporate, private)
│   └── Special requests

└── /admin
    ├── Owner login (email/password)
    ├── Edit restaurant info
    ├── Manage menus
    ├── Manage banquet halls
    ├── Manage reviews (moderation)
    ├── View bookings
    ├── Upload images/videos
    └── Analytics (views, bookings)
```

---

## 🔧 Simplified Architecture

### Backend API (Go)

**Single Restaurant Endpoints:**
```
GET  /v1/kibana/profile           → Kibana info (name, address, phone, hours)
GET  /v1/kibana/banquets          → List banquet halls with pricing
GET  /v1/kibana/menus             → Menu categories & items
GET  /v1/videos                   → All videos (ambiance, food, events)
GET  /v1/images                   → All images with metadata
GET  /v1/reviews                  → All reviews (verified only)
POST /v1/reviews                  → Submit new review (email verified)
GET  /v1/reviews/verify?token=... → Verify review email
POST /v1/bookings                 → Create event booking
GET  /v1/bookings/{id}            → Get booking details
GET  /v1/admin/bookings           → List all bookings (admin only)
PATCH /v1/admin/bookings/{id}     → Update booking status
```

**No multi-restaurant complexity!**

### Frontend (Next.js 15)

**Simple page structure:**
```
app/
├── page.tsx              (Home)
├── menu/page.tsx         (Menu)
├── banquets/page.tsx     (Banquets)
├── gallery/page.tsx      (Gallery)
├── reviews/page.tsx      (Reviews)
├── book/page.tsx         (Booking)
├── layout.tsx            (Navbar, footer)
└── admin/
    ├── layout.tsx        (Auth check)
    ├── page.tsx          (Dashboard)
    ├── menus/page.tsx    (Edit menus)
    ├── bookings/page.tsx (Manage bookings)
    └── media/page.tsx    (Upload images/videos)
```

### Database (PostgreSQL)

**Simple schema (7 tables):**
```
restaurants (1 record: Kibana)
├── banquet_halls (3-5 records)
├── menus (2-3 categories × 10-20 items each)
├── videos (10+ videos)
├── images (80+ images with categories)
├── reviews (customer testimonials)
└── bookings (event bookings)
```

---

## 📋 Phase 1 Deliverables (Single Restaurant)

| Item | Details | Status |
|------|---------|--------|
| **Home Page** | Hero, testimonials, CTA | ⏳ Building |
| **Menu Page** | Categorized dishes with images | ⏳ Building |
| **Banquets Page** | 3-5 halls with capacity & pricing | ⏳ Building |
| **Gallery** | 80+ images + 10+ videos | ⏳ In Progress |
| **Reviews Page** | 5-star testimonials | ⏳ Building |
| **Booking Page** | Event booking form | ⏳ Building |
| **Admin Panel** | Owner dashboard for content | ⏳ Building |
| **Images** | Extracted from kibana.jaipur Instagram | ⏳ In Progress |
| **Domain Setup** | kibana.saudagars.org | ⏳ Pending |
| **Deployment** | Vercel + Fly.io + Neon | ⏳ Pending |

---

## 🚀 Deployment Timeline (TODAY)

### T+0 to T+2h: Code Finalization

**api-builder:**
- [ ] Create Kibana profile & banquets tables
- [ ] Seed 1 restaurant + 3-5 banquet halls
- [ ] Create simplified endpoints (7 total)
- [ ] Push to main

**frontend-builder:**
- [ ] Home page (hero, testimonials, CTA)
- [ ] Menu page (categories + items)
- [ ] Banquets page (halls with photos)
- [ ] Gallery (image grid + video carousel)
- [ ] Reviews page (testimonials)
- [ ] Booking form (date, guests, requests)
- [ ] Admin panel (owner dashboard)
- [ ] Push to main

**content-manager:**
- [ ] Finish kibana.jaipur image extraction
- [ ] Organize: restaurant (40), banquets (30), testimonials (10)
- [ ] Copy to /web/public/images/kibana-jaipur/
- [ ] Push to main

### T+2h: Deploy to Production

```bash
# From repo root
git pull origin main
git log --oneline (should see commits from all 3 agents)
# Automatic:
# → Vercel deploys to kibana.saudagars.org
# → Fly.io deploys to api.kibana.saudagars.org
```

### T+3h: Site Live 🎉

```
✅ https://kibana.saudagars.org        (Website)
✅ https://api.kibana.saudagars.org    (API)
✅ kibana.jaipur images live
✅ All menus & banquets visible
✅ Booking system working
✅ Admin panel accessible
```

---

## 💻 Environment Variables

### Vercel (.env.production)

```
NEXT_PUBLIC_API_BASE_URL=https://api.kibana.saudagars.org
NEXT_PUBLIC_SITE_URL=https://kibana.saudagars.org
NEXT_PUBLIC_GA_ID=[optional: Google Analytics]
```

### Fly.io

```
APP_ENV=production
API_PORT=8080
DATABASE_URL=postgresql://[user]:[password]@[neon-host]/[db]
JWT_SECRET=[secure-random]
ADMIN_PASSWORD=[secure-password-for-owner-login]
MUX_TOKEN_ID=[Mux credentials]
MUX_TOKEN_SECRET=[Mux credentials]
```

### Neon PostgreSQL

```
Connection string from Neon dashboard
Migrations run automatically on deploy
```

---

## 🔗 Production URLs

```
🏠 Home:        https://kibana.saudagars.org/
📋 Menu:        https://kibana.saudagars.org/menu
🎉 Banquets:    https://kibana.saudagars.org/banquets
🖼️ Gallery:      https://kibana.saudagars.org/gallery
⭐ Reviews:      https://kibana.saudagars.org/reviews
📅 Book Event:   https://kibana.saudagars.org/book
🔐 Admin:        https://kibana.saudagars.org/admin

🔌 API:         https://api.kibana.saudagars.org/v1/kibana/profile
```

---

## ✅ Smoke Tests (Post-Launch)

```bash
# Website loads
curl -i https://kibana.saudagars.org/
# Expected: 200 OK

# API works
curl -i https://api.kibana.saudagars.org/v1/kibana/profile
# Expected: 200 OK, JSON with Kibana info

# Images load
curl -i https://kibana.saudagars.org/images/kibana-jaipur/restaurant/2026-01-15_001.jpg
# Expected: 200 OK, JPEG

# Booking endpoint
curl -i https://api.kibana.saudagars.org/v1/bookings (POST)
# Expected: 201 Created

# Admin login
curl -i https://kibana.saudagars.org/admin
# Expected: 200 OK, login form
```

---

## 📊 Content Breakdown

### Pages & Copy

| Page | Sections | Copy Length |
|------|----------|-------------|
| Home | Hero, About, Testimonials, CTA | 500 words |
| Menu | 4 categories, 15+ dishes | 1000 words |
| Banquets | 3-5 halls, services, pricing | 800 words |
| Gallery | Image captions, video descriptions | 200 words |
| Reviews | Testimonials (5-10) | 500 words |
| Book | Form labels, confirmation | 100 words |

### Media Assets

| Type | Count | Source |
|------|-------|--------|
| Images | 80+ | kibana.jaipur Instagram |
| Videos | 10+ | Existing or to film |
| Mux Assets | 10+ | Mux library |

---

## 🎯 Success Criteria

✅ **Phase 1 MVP is LIVE when:**
1. kibana.saudagars.org resolves & loads
2. All pages render without errors
3. Images display correctly
4. Booking form functional
5. Admin panel works (owner can login)
6. Reviews system working
7. No console errors
8. Mobile responsive
9. <3s page load time (Lighthouse >85)

---

## 📅 Phase 2+ (Future)

Once Phase 1 is stable:

**Phase 2: 3D Tours**
- Interactive 3D tour of restaurant & banquet halls
- AR preview on mobile
- Virtual table seating

**Phase 3: Advanced Booking**
- Menu customization for events
- Decorator/photographer booking
- Real-time availability calendar
- Payment integration (Razorpay)

**Phase 4: Social & Marketing**
- Instagram feed integration
- Email marketing (Mailchimp)
- Wedding showcase (user-submitted photos)
- Social proof (recent bookings)

---

## 📞 Quick Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Fly.io Dashboard | https://fly.io/dashboard |
| Neon Console | https://console.neon.tech |
| GitHub Repo | https://github.com/ansujn/victor |
| Domain DNS | saudagars.org DNS records |

---

**Status:** ✅ Ready to Deploy  
**Timeline:** 2-4 hours from now  
**Launch URL:** https://kibana.saudagars.org  

🎉 **Let's make Kibana Jaipur the best restaurant website!**
