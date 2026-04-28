# Kibana Jaipur — Instagram Extraction Handoff

**Account:** @kibana.jaipur (confirmed: "Kibana - Restaurants & Banquets", 63 posts)
**Owner:** ansujain3@gmail.com (Phase 1 task lead)
**Status:** Scaffolding ready, scrape pending Instagram rate-limit / credentials

---

## What was set up

1. **Python venv with `instagrapi` + `requests`**
   - `scripts/.venv/` (Python 3.14.4 + instagrapi)
   - Run any command via `./scripts/.venv/bin/python3 …`

2. **Bug fixes in `scripts/instagram_scraper_advanced.py`**
   - `media.caption` → `media.caption_text` (instagrapi field name)
   - `media.image_versions2.candidate_0.url` → `media.thumbnail_url`
   - Carousel/album posts now download every slide (`_s1.jpg`, `_s2.jpg`, …)
   - `main()` now reads credentials from `IG_USERNAME` / `IG_PASSWORD` env
     vars when stdin is not a TTY (so it can run in CI / agents).
   - `save_metadata()` also writes `IMAGE_CATALOG.csv` with the schema:
     `filename, category, caption, timestamp, likes, recommended_for`.

3. **Directory tree (created, empty)**
   - `instagram_downloads/kibana_jaipur/{ambiance,food,event,interior,staff,other}/`
   - `web/public/images/kibana-jaipur/{ambiance,food,event,interior,staff,other}/`

---

## Why no images yet

Anonymous fetch succeeded for `user_info_by_username` (confirmed 63 posts on the
account) but `user_medias` triggered Instagram's `PleaseWaitFewMinutes` block on
the first run. A second run was scheduled with a 6-minute back-off — see the
log at `/tmp/ig_run.log`. Instagram aggressively throttles datacenter / shared
IPs; reliable extraction needs **logged-in credentials** for `@kibana.jaipur`
(the user owns the account).

---

## How to finish the extraction

### Option A — anonymous (only if rate-limit cleared)
```bash
cd "$(git rev-parse --show-toplevel)"
./scripts/.venv/bin/python3 scripts/instagram_scraper_advanced.py
```

### Option B — logged-in (recommended, owner's credentials)
```bash
cd "$(git rev-parse --show-toplevel)"
IG_USERNAME=kibana.jaipur \
IG_PASSWORD='<your-password>' \
  ./scripts/.venv/bin/python3 scripts/instagram_scraper_advanced.py
```

Heads-up: Instagram may send a 6-digit verification code to the account's
email/SMS the first time. The `instagrapi` Client will prompt for it — run
**from a terminal** (not in the background) so you can paste the code.

### Option C — Instagram Data Export (zero rate-limit risk)
1. Instagram → Settings → Your Activity → Download Your Information
2. Choose JSON, all data, send to email
3. Extract the zip → posts live under `media/posts/`
4. Run `scripts/instagram_scraper_advanced.py` is NOT needed here — instead,
   feed the extracted JPEGs through a small categorizer (TODO: write
   `scripts/categorize_export.py` reusing `_categorize_post()`).

---

## After download

The scraper writes:

- `instagram_downloads/kibana_jaipur/<category>/YYYY-MM-DD_NNN.jpg`
- `instagram_downloads/kibana_jaipur/metadata.json`
- `instagram_downloads/kibana_jaipur/IMAGE_CATALOG.csv`
- `instagram_downloads/kibana_jaipur/SUMMARY.json`

### QC pass (manual, ~30 min)
1. Open each category folder; delete blurry/dark/duplicate frames.
2. Re-categorize obvious mis-bucketed posts (caption-keyword auto-tagging
   is approximate — e.g. event photos with food usually land in `food`).
3. Aim for the target distribution:
   `food 30–40 / ambiance 20–30 / event 10–15 / interior 10–15 / staff 5–10`.

### Sync to web
```bash
rsync -av --exclude '*.json' --exclude '*.csv' \
  instagram_downloads/kibana_jaipur/ \
  web/public/images/kibana-jaipur/
```

Then `git add web/public/images/kibana-jaipur && git commit`.

---

## Deliverables checklist

- [x] Scraper bugs fixed and made non-interactive
- [x] Directory tree created (instagram_downloads + web/public/images)
- [x] IMAGE_CATALOG.csv schema established
- [ ] 80–100 high-quality images downloaded *(blocked on credentials / rate limit)*
- [ ] QC pass (manual)
- [ ] Synced to `web/public/images/kibana-jaipur/`
