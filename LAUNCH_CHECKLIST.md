# 🚀 Restaurant Platform - Launch Checklist

## ⭐ PHASE 1: Discovery Platform (4 Weeks)

### 📥 WEEK 1: Content & Setup

**Monday - Instagram Content:**
- [ ] Run: `python3 scripts/instagram_scraper_advanced.py`
- [ ] Review downloaded images (delete duplicates, low-quality)
- [ ] Organize final 80-100 images by category
- [ ] Review metadata.json for captions
- [ ] Upload images to CDN (S3, Cloudinary, or /public/images)

**Tuesday - Database Setup:**
- [ ] Create migration: `migrations/001_restaurants.sql`
  - [ ] restaurants table
  - [ ] videos table
  - [ ] images table
  - [ ] reviews table
- [ ] Run: `cd api && make migrate-up`
- [ ] Test database connection

**Wednesday-Thursday - API Foundation:**
- [ ] Create Go handlers in `/api/internal/restaurants/`
  - [ ] GET /restaurants (with filters: cuisine, location, price)
  - [ ] GET /restaurants/{id} (detail view)
  - [ ] POST /admin/restaurants/{id}/images (upload)
  - [ ] POST /admin/restaurants/{id}/videos (upload)
  - [ ] GET /reviews/{restaurant_id} (list reviews)
- [ ] Add endpoints to `openapi.yaml`
- [ ] Generate TypeScript types: `pnpm gen:api` in /web

**Friday - Test Endpoints:**
- [ ] Test with curl or Postman
- [ ] Verify images/videos serve correctly
- [ ] Check pagination

---

### 🎨 WEEK 2: Frontend Core

**Monday - Home Page:**
- [ ] Create `/app/page.tsx` (home)
- [ ] Featured restaurants carousel
- [ ] Trending videos widget
- [ ] Call to action → discovery

**Tuesday - Discovery Page:**
- [ ] Create `/app/restaurants/page.tsx`
- [ ] Filter bar (cuisine, location, price, highlights)
- [ ] Restaurant grid cards
- [ ] Search autocomplete
- [ ] Pagination

**Wednesday - Restaurant Detail:**
- [ ] Create `/app/restaurants/[id]/page.tsx`
- [ ] Hero image + info sidebar
- [ ] Videos section (Mux player)
- [ ] Images gallery (carousel)
- [ ] Reviews section

**Thursday - Reviews Component:**
- [ ] Review list (paginated, recent first)
- [ ] Review form (email verification, no login)
- [ ] Star rating display
- [ ] Photo uploads in reviews

**Friday - Testing:**
- [ ] Test all pages on desktop
- [ ] Test filters and search
- [ ] Test image/video loading
- [ ] Check performance (Lighthouse)

---

### 🔧 WEEK 3: Admin Dashboard

**Monday - Admin Auth:**
- [ ] Create `/app/admin/[id]/page.tsx` (password protected)
- [ ] Password check (simple, from env variable)
- [ ] Session/cookie handling

**Tuesday - Edit Restaurant:**
- [ ] Form to edit:
  - [ ] Name, cuisine, location
  - [ ] Hours, phone, website
  - [ ] Avg price, capacity
  - [ ] Highlights checkboxes
- [ ] Save to database
- [ ] Success toast notification

**Wednesday - Image Upload:**
- [ ] Drag-drop image uploader
- [ ] Batch upload (multiple files)
- [ ] Show progress bar
- [ ] Save to database + CDN
- [ ] Display uploaded images

**Thursday - Video Upload:**
- [ ] Drag-drop video uploader (connect to Mux)
- [ ] Enter video title & type (ambiance, chef, menu, event)
- [ ] Generate Mux asset + get playback ID
- [ ] Save to database
- [ ] Display uploaded videos

**Friday - Admin Analytics:**
- [ ] View count per image
- [ ] Video view count
- [ ] Recent reviews
- [ ] Restaurant profile summary

---

### 🎯 WEEK 4: Optimization & Launch

**Monday - Mobile Responsive:**
- [ ] Test all pages on iPhone/Android
- [ ] Fix responsive issues
- [ ] Optimize images (next/image component)
- [ ] Test touch interactions

**Tuesday - SEO & Analytics:**
- [ ] Add meta tags (restaurant name, cuisine, location)
- [ ] Generate sitemap.xml
- [ ] Setup Google Analytics
- [ ] Setup Vercel Analytics
- [ ] Add robots.txt

**Wednesday - Performance:**
- [ ] Run Lighthouse audit
- [ ] Optimize images (WebP, lazy load)
- [ ] Minimize CSS/JS bundles
- [ ] Target: LCP <3s, CLS <0.1

**Thursday - Deploy:**
- [ ] Merge to main branch
- [ ] Push to GitHub
- [ ] Vercel auto-deploys web
- [ ] Fly.io auto-deploys API
- [ ] Run smoke tests
- [ ] Check production URLs

**Friday - Onboarding:**
- [ ] Onboard first 5 restaurants (kibana.jaipur + 4 others)
- [ ] Verify their content loads
- [ ] Get feedback
- [ ] Fix any issues
- [ ] Go live! 🎉

---

## 🏆 Phase 1 Launch Checklist

### Frontend ✅
- [ ] Home page (featured, trending)
- [ ] Discovery page (search, filters)
- [ ] Restaurant detail (videos, images, reviews)
- [ ] Admin dashboard (edit, upload)
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] SEO ready

### Backend ✅
- [ ] Database migrations
- [ ] Restaurant endpoints
- [ ] Video endpoints
- [ ] Image endpoints
- [ ] Review endpoints
- [ ] Admin authentication

### DevOps ✅
- [ ] Deploy to Vercel (web)
- [ ] Deploy to Fly.io (API)
- [ ] Database on Neon
- [ ] Images on CDN
- [ ] Analytics tracking
- [ ] Error monitoring

### Business ✅
- [ ] 50+ restaurants in system
- [ ] 5-10 live restaurants with content
- [ ] Reviews moderation process
- [ ] Restaurant owner onboarding doc
- [ ] Marketing assets ready

---

## 📊 Phase 1 Success Metrics

By end of Week 4:
- [ ] Website live and stable
- [ ] 100+ restaurants in database
- [ ] 5-10 with complete content
- [ ] 50K first-week page views target
- [ ] <2% error rate
- [ ] <3s page load time
- [ ] Mobile score >90

---

## 📝 Restaurant Onboarding Script

**Email template to send restaurants:**

```
Subject: List Your Restaurant on [Platform]

Hi [Restaurant Name],

We're launching a premium restaurant discovery platform.
Get your restaurant featured with:
✅ Video gallery (ambiance, menu, events)
✅ Beautiful image showcase
✅ Customer reviews & ratings
✅ Free to list (Phase 1)

To get started:
1. Go to: https://[domain].com/admin/[your-id]
2. Password: [provided separately]
3. Upload photos/videos of your restaurant
4. Add basic info (hours, price, cuisine)
5. Go live!

We'll handle the rest. Reviews come from real customers.

Questions? Contact: [email]

Cheers,
Victor Sir Team
```

---

## 🔄 Weekly Standups

### Week 1 Check-in
- [ ] Images downloaded and organized
- [ ] Database migrations complete
- [ ] API endpoints responding
- [ ] TypeScript types generated

### Week 2 Check-in
- [ ] All pages rendering
- [ ] Filters working
- [ ] Videos playing in Mux player
- [ ] Images loading from CDN

### Week 3 Check-in
- [ ] Admin dashboard functional
- [ ] File uploads working
- [ ] Restaurant owners testing
- [ ] No blocker bugs

### Week 4 Check-in
- [ ] Mobile fully responsive
- [ ] Performance metrics met
- [ ] Deployed to production
- [ ] First restaurants live
- [ ] Ready for Phase 2 ✅

---

## 🆘 If Stuck

**Instagram download failing?**
→ See `scripts/INSTAGRAM_DOWNLOAD_GUIDE.md` → Manual alternatives

**API not responding?**
→ Check `api/README.md` → `make dev` to run locally

**Images not loading?**
→ Verify CDN URL format, CORS headers

**Mux player not working?**
→ Check Mux credentials in `.env`, test with sample video ID

**Deploy failing?**
→ Check `docs/DEPLOY.md` for runbook

---

## 📞 Communication

- **Team Slack:** #restaurant-platform
- **Issues/Bugs:** GitHub Issues in victor repo
- **Deployed version:** https://[your-domain].com
- **Admin link:** https://[your-domain].com/admin/[restaurant-id]

---

## 🎯 Next Phase (Phase 2 - After Week 4)

Once Phase 1 is stable:
- [ ] Start 3D modeling (Blender or hire freelancer)
- [ ] Build Three.js 3D viewer
- [ ] Create floor plans UI
- [ ] Setup AR preview
- [ ] ~4 additional weeks

---

**Print this checklist and track daily progress!**  
**Update at end of each day.**  
**Weekly review with team.**

🚀 Let's build the best restaurant website!
