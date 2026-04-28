# 🚀 Production Deployment: kibana.saudagars.org

**Status:** Phase 1 MVP Ready for Production  
**Launch Date:** TODAY  
**Domain:** kibana.saudagars.org  

---

## 🌐 Domain Configuration

### DNS Setup Required

Add these DNS records to **saudagars.org** domain:

```
CNAME Record:
  Host: kibana
  Points to: cname.vercel-dns.com
  (Vercel will provide exact CNAME during setup)

CNAME Record:
  Host: api.kibana
  Points to: [fly.io-provided-DNS]
  (Fly.io will provide exact endpoint)
```

**Alternatively (if using Vercel for subdomain):**
```
TXT Record:
  Host: _vercel
  Value: [verification-token-from-Vercel]
```

---

## 🔌 Environment Variables

### Vercel (Web Frontend)

**Project:** victor-sir-restaurant  
**Framework:** Next.js 15  
**Build Command:** `pnpm build`  
**Start Command:** `pnpm start`  

**Environment Variables:**
```
NEXT_PUBLIC_API_BASE_URL=https://api.kibana.saudagars.org
NEXT_PUBLIC_SITE_URL=https://kibana.saudagars.org
NEXT_PUBLIC_GA_ID=[Google Analytics ID if using]
```

**Deploy from:** GitHub branch `main`

### Fly.io (API Backend)

**App Name:** victor-api-kibana (or existing app)  
**Framework:** Go 1.23  
**Port:** 8080  

**Environment Variables:**
```
APP_ENV=production
API_PORT=8080
DATABASE_URL=postgresql://[user]:[password]@[neon-host]/[db]
JWT_SECRET=[generate-random-secret]
ADMIN_PASSWORD=[secure-password-for-admin-panel]
MSG91_AUTH_KEY=[MSG91-API-key-if-using-SMS]
MUX_TOKEN_ID=[Mux-credentials]
MUX_TOKEN_SECRET=[Mux-credentials]
```

**Deploy from:** GitHub branch `main` (auto-deploy on push)

### Neon PostgreSQL (Database)

**Connection String:**
```
postgresql://[user]:[password]@[neon-host]/[db]?sslmode=require
```

**Migrations:** Run automatically on Fly.io startup  
**Backup:** Enabled on Neon (daily)

---

## 📋 Pre-Launch Checklist

### DNS & Domains
- [ ] DNS CNAME for `kibana.saudagars.org` → Vercel (get from Vercel dashboard)
- [ ] DNS CNAME for `api.kibana.saudagars.org` → Fly.io
- [ ] Wait 24-48 hours for DNS propagation (or check: `nslookup kibana.saudagars.org`)
- [ ] SSL certificates auto-provisioned by Vercel & Fly.io

### Vercel Setup
- [ ] Create Vercel project (link to GitHub victor repo)
- [ ] Set environment variables (see above)
- [ ] Configure production domain: kibana.saudagars.org
- [ ] Enable automatic deployments from `main` branch
- [ ] Run preview build to verify

### Fly.io Setup
- [ ] App deployed (push to main → auto-deploys)
- [ ] Environment variables set in Fly.io dashboard
- [ ] Database migrations ran successfully
- [ ] API listening on 0.0.0.0:8080
- [ ] Health check: `curl https://api.kibana.saudagars.org/v1/restaurants` → 200 OK

### Database (Neon)
- [ ] Connection pooling enabled
- [ ] Backups configured
- [ ] Connection string in Fly.io env vars
- [ ] Migrations table created

### Code Ready
- [ ] All 3 agents completed their tasks
- [ ] Seed data created (5-10 restaurants)
- [ ] Frontend wired to production API
- [ ] Images in /web/public/images/
- [ ] All merged to `main` branch
- [ ] No uncommitted changes

---

## 🚀 Deployment Steps (In Order)

### 1. Finalize Code (Next 1-2 hours)

**Each agent:**
- [ ] api-builder: Push seed data migration
- [ ] frontend-builder: Push API wiring + .env.production
- [ ] content-manager: Push images to /web/public/

```bash
# From repo root
git pull origin main
git add .
git commit -m "feat: Phase 1 MVP production ready"
git push origin main
```

### 2. Verify Builds (Automated, ~5 mins)

**Vercel:**
- [ ] GitHub webhook triggers build
- [ ] Build succeeds (`pnpm build`)
- [ ] Deploy preview generated
- [ ] Preview at: kibana--[vercel-hash].vercel.app

**Fly.io:**
- [ ] GitHub webhook triggers build
- [ ] Docker image builds
- [ ] Pushed to Fly.io
- [ ] New version deployed
- [ ] Old version gracefully shut down

### 3. DNS Propagation (24-48 hours, but test immediately)

```bash
# Test DNS resolution
nslookup kibana.saudagars.org
nslookup api.kibana.saudagars.org

# Test API endpoint
curl https://api.kibana.saudagars.org/v1/restaurants

# Test web page
curl https://kibana.saudagars.org/restaurants
```

### 4. Post-Deploy Smoke Tests

```bash
# API Health
curl -i https://api.kibana.saudagars.org/v1/restaurants
# Expected: 200 OK, JSON with restaurant list

# Web Frontend
curl -i https://kibana.saudagars.org/restaurants
# Expected: 200 OK, HTML with restaurant cards

# Admin Dashboard
curl -i https://kibana.saudagars.org/admin/r-001
# Expected: 200 OK, password-protected form

# Images Loading
curl -i https://kibana.saudagars.org/images/kibana-jaipur/ambiance/2026-01-15_001.jpg
# Expected: 200 OK, JPEG image

# Reviews Endpoint
curl -i https://api.kibana.saudagars.org/v1/reviews/r-001
# Expected: 200 OK, empty array (no reviews yet)
```

### 5. Browser Testing (Post-DNS)

1. **Home Page:** https://kibana.saudagars.org/restaurants
   - [ ] Page loads
   - [ ] Filters visible (cuisine, location, price)
   - [ ] Restaurants load from API
   - [ ] Images display
   - [ ] No console errors

2. **Restaurant Detail:** Click any restaurant
   - [ ] Detail page loads
   - [ ] Hero image displays
   - [ ] Videos load in Mux player
   - [ ] Image carousel works
   - [ ] Reviews section visible

3. **Admin Panel:** https://kibana.saudagars.org/admin/r-001
   - [ ] Password prompt appears
   - [ ] Enter admin password → access granted
   - [ ] Profile tab shows restaurant info
   - [ ] Can edit fields
   - [ ] Analytics tab shows data

4. **Mobile Test:** Open on iPhone/Android
   - [ ] Responsive layout works
   - [ ] Touch scrolling smooth
   - [ ] Images load correctly
   - [ ] Filters accessible

---

## 📊 Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 User Browser                                 │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────────────────┐
    │                             │
    ▼                             ▼
┌─────────────────────┐    ┌──────────────────────┐
│ kibana.saudagars.   │    │ api.kibana.saudagars │
│ org (Vercel)        │    │ .org (Fly.io)        │
│                     │    │                      │
│ - Next.js 15        │    │ - Go API             │
│ - Images: /public   │───→│ - Port 8080          │
│ - React 19          │    │ - chi router         │
│ - TypeScript        │    │ - pgx/sqlc           │
└─────────────────────┘    └──────────────────────┘
                                   │
                                   ▼
                            ┌─────────────────────┐
                            │ Neon PostgreSQL     │
                            │ (ap-south-1)        │
                            │                     │
                            │ - restaurants       │
                            │ - videos            │
                            │ - images            │
                            │ - reviews           │
                            └─────────────────────┘

External Services:
  ├─ Mux (video streaming)
  ├─ Resend (email verification)
  ├─ MSG91 (SMS notifications, optional)
  └─ Google Analytics
```

---

## 🔐 Security Checklist

- [ ] HTTPS enforced (auto by Vercel & Fly.io)
- [ ] Admin password secured (env var, not in code)
- [ ] Database password in Neon secret
- [ ] API CORS configured to accept kibana.saudagars.org
- [ ] No secrets in .env.example
- [ ] GitHub branch protection enabled (main)
- [ ] Reviews email verified before public

---

## 📈 Monitoring & Alerts

**Vercel Analytics:**
- Lighthouse scores
- Performance metrics
- Deployment logs

**Fly.io Monitoring:**
- CPU/Memory usage
- Request counts
- Error logs

**Database:**
- Connection pool usage
- Query performance
- Backup status

**Setup uptime monitoring:**
```bash
# Option 1: Uptime Robot
https://uptimerobot.com
- Monitor: https://api.kibana.saudagars.org/v1/restaurants
- Alert: If down >5 min

# Option 2: BetterStack
https://betterstack.com
- Replaces /status.viktheatre.in for this project
```

---

## 🆘 Troubleshooting

### Website loads but no restaurants
- Check: API_BASE_URL in .env.production
- Check: Fly.io app running (`fly logs`)
- Check: Database has seed data (`SELECT * FROM restaurants;`)

### Images not loading
- Check: Images in /web/public/images/kibana-jaipur/
- Check: CORS headers allow kibana.saudagars.org
- Check: Image URLs in browser console

### Admin password not working
- Check: ADMIN_PASSWORD env var set in Fly.io
- Check: Password sent via X-Admin-Password header
- Check: Handler checks `r.Header.Get("X-Admin-Password")`

### SSL certificate issues
- Vercel & Fly.io auto-provision after DNS setup
- Wait 24 hours, then refresh
- Check: SSL Labs rating

---

## 📞 Support & Escalation

| Issue | Severity | Action |
|-------|----------|--------|
| Website down | CRITICAL | Check Vercel/Fly.io dashboards, check health endpoint |
| Slow performance | HIGH | Check database, review CDN caching |
| Images not loading | MEDIUM | Check paths, CORS headers |
| Reviews not visible | MEDIUM | Check email verification flow |

---

## ✨ Success Criteria

✅ **Phase 1 MVP is live when:**
1. kibana.saudagars.org resolves (DNS ready)
2. Web loads without errors (Vercel deployed)
3. API returns restaurants (Fly.io deployed)
4. Images display (Vercel serving static files)
5. Admin panel works (password protected)
6. Reviews can be submitted (email verification working)

---

**Status:** Ready to Deploy  
**Estimated Time to Live:** 2-4 hours (after agents finish)  
**Rollback Plan:** Git revert to previous commit, re-push to main  

🚀 **Let's launch!**
