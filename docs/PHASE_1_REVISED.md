# Phase 1: Restaurant Discovery Platform (No Booking, No Payments)

## 🎯 Simple MVP Scope

### What Users Can Do:
- ✅ Search restaurants by cuisine, location, price, highlights
- ✅ View restaurant profiles (hours, address, phone, website)
- ✅ Watch videos (ambiance, chef specials, food showcases)
- ✅ View image gallery
- ✅ Read reviews & ratings (anyone can submit)
- ✅ See trending restaurants

### What Phase 1 Does NOT Have:
- ❌ No user login/registration (reviews use email verification only)
- ❌ No booking system
- ❌ No payments
- ❌ No 3D tours (Phase 2)
- ❌ No customization

---

## 📱 Pages to Build

### Public Pages
```
/ 
  → Home with featured restaurants, trending videos

/restaurants
  → Discovery page with filters (cuisine, location, price, highlights)
  → Search bar with autocomplete

/restaurants/[id]
  → Restaurant detail page
  → Hero image
  → Videos (Mux player)
  → Image gallery
  → Reviews & ratings
  → Contact info
  → Hours & address
```

### Admin Pages (Password-protected, no login needed)
```
/admin/[restaurant-id]
  → Edit restaurant profile
  → Upload videos (drag-drop to Mux)
  → Upload images
  → View reviews (moderation)
  → Analytics (views, video plays)
```

---

## 🔧 Tech Stack (Phase 1)

### Frontend
```
Next.js 15 (existing)
  - /app/page.tsx                 — home
  - /app/restaurants/page.tsx      — discovery
  - /app/restaurants/[id]/page.tsx — detail
  - /app/admin/[id]/page.tsx       — admin dashboard

Components:
  - SearchBar (autocomplete)
  - FilterBar (cuisine, location, price, highlights)
  - VideoGallery (Mux player)
  - ImageCarousel
  - ReviewsList
```

### Backend API (Go, existing)
```
GET /v1/restaurants
  - filters: cuisine, location, min_price, max_price, capacity
  - pagination
  - sorting: rating, newest, trending

GET /v1/restaurants/{id}
  - full detail with videos, images, reviews

POST /v1/admin/restaurants/{id}
  - password: simple password (stored in env)
  - update name, cuisine, hours, pricing, etc

POST /v1/admin/restaurants/{id}/videos
  - title, type (ambiance|chef|menu|event)
  - file upload → delegate to Mux

GET /v1/restaurants/{id}/videos
  - return video list with mux playback IDs

POST /v1/reviews
  - restaurant_id, rating, comment
  - user_email (for moderation)
  - user_name

GET /v1/reviews/{restaurant_id}
  - paginated, sorted by recent
```

### Database
```
PostgreSQL (existing on Neon)

Tables:
  - restaurants
      id, name, cuisine[], location, city, address, phone, 
      hours (JSON), avg_price, capacity, highlights[], 
      rating_avg, review_count

  - videos
      id, restaurant_id, title, type, 
      mux_asset_id, mux_playback_id, thumbnail_url, views

  - images
      id, restaurant_id, url, type (ambiance|food|event), caption

  - reviews
      id, restaurant_id, rating, comment, user_name, user_email, 
      created_at
```

### Video Hosting
```
Mux (existing integration in web/)
  - Use existing Mux token from .env
  - Upload API: POST /mux/upload
  - Playback: @mux/mux-player-react (already in package.json)
```

---

## 📊 Development Plan

### Week 1-2: Core API & Database
- [ ] Database migrations (restaurants, videos, images, reviews)
- [ ] Restaurant CRUD endpoints
- [ ] Video endpoints (list, get, upload)
- [ ] Review endpoints (POST, GET)
- [ ] Admin auth (simple password check)

### Week 2-3: Frontend - Discovery
- [ ] Home page with featured restaurants
- [ ] Search page with filters
- [ ] Restaurant detail page (basic layout)
- [ ] Mux video player integration
- [ ] Image carousel

### Week 3-4: Admin & Polish
- [ ] Admin dashboard (upload videos, edit profile)
- [ ] Reviews section (read, display, moderation)
- [ ] Analytics (view counts, video plays)
- [ ] Mobile responsiveness
- [ ] Deploy to Vercel + Fly.io
- [ ] SEO (meta tags, sitemap)

---

## 🚀 Launch Readiness Checklist

- [ ] 50+ restaurants onboarded with videos
- [ ] All Mux videos working (playback tests)
- [ ] Search & filters functional
- [ ] Reviews moderation working
- [ ] Admin dashboard tested by restaurant owners
- [ ] Mobile responsive
- [ ] Performance optimized (<3s LCP)
- [ ] Deployed and live
- [ ] Analytics tracking (Google Analytics)

---

## 💰 Zero-Cost Phase 1

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | Free tier | Web hosting |
| Fly.io | Free tier | API hosting (~$2.50/mo) |
| Neon | Free tier | Database (~5 restaurants) |
| Mux | Pay-as-you-go | ~$100/mo (5 videos × 500h views) |
| **TOTAL** | ~$100/mo | Minimal cost |

---

## 📝 Admin Onboarding Flow (Simple)

1. Owner visits `/admin/[restaurant-id]?password=xxx`
2. Sees form to:
   - Edit restaurant name, cuisine, hours, pricing
   - Upload hero image
   - Upload up to 20 videos (drag-drop)
   - Upload up to 50 images (drag-drop)
   - Set highlights (checkboxes: rooftop, bar, live music, etc)
3. Save → goes live immediately
4. View analytics dashboard (views, video plays)
5. Read reviews (mark as "verified owner response")

---

## 🎨 Design Notes

- **Home**: Hero with 3-4 featured restaurants, trending videos carousel
- **Discovery**: Grid of restaurant cards (image, name, cuisines, rating, avg_price)
- **Detail**: Clean layout - hero image, info sidebar, videos section, images section, reviews section
- **Admin**: Simple form-based interface (no complex UI)

---

## 🔜 Next Phase (Phase 2)

Once Phase 1 is stable with 50+ restaurants:
- Add 3D tours (Three.js)
- Add floor plans
- Add AR preview
- Then move to booking (Phase 4)

---

**Status**: ✅ Simplified, Ready to Build  
**Timeline**: 4 weeks  
**Team Size**: 1-2 devs  
**Complexity**: Low (mostly CRUD + Mux integration)
