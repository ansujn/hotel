# Instagram Content Download Guide

Extract all images from `kibana.jaipur` Instagram account for the restaurant website.

---

## 🚀 Quick Start

### Option 1: Simple Python Script (No Login)
```bash
cd scripts/
python3 instagram_scraper.py
```

**What it does:**
- Scrapes public posts from @kibana.jaipur
- Downloads images automatically
- Organizes by category (food, ambiance, event, interior, staff)
- Saves metadata (captions, likes, comments)

**Requirements:**
```bash
pip install requests
```

---

### Option 2: Advanced Script (With Login - Recommended)
```bash
cd scripts/
pip install instagrapi
python3 instagram_scraper_advanced.py
```

**What it does:**
- Login to your Instagram account (kibana.jaipur credentials)
- Download ALL posts (including any private/drafts)
- Better success rate (Instagram blocking is less aggressive)
- Faster downloads

**Prompted for:**
```
Enter Instagram username: kibana.jaipur
Enter Instagram password: ****
```

---

## 📁 Output Structure

After running the script, you'll get:

```
instagram_downloads/kibana_jaipur/
├── ambiance/           # Decor, lighting, mood
│   ├── 2026-01-15_001.jpg
│   ├── 2026-01-12_002.jpg
│   └── ...
├── food/               # Dishes, plating, menu
│   ├── 2026-01-20_001.jpg
│   ├── 2026-01-18_002.jpg
│   └── ...
├── event/              # Weddings, celebrations, gatherings
│   ├── 2026-01-10_001.jpg
│   └── ...
├── interior/           # Restaurant layout, dining area
│   └── ...
├── staff/              # Team photos, kitchen, service
│   └── ...
├── other/              # Uncategorized
│   └── ...
├── metadata.json       # Captions, likes, timestamps
└── SUMMARY.json        # Statistics
```

---

## 📋 Metadata File Example

**metadata.json:**
```json
[
  {
    "filename": "2026-01-20_001.jpg",
    "category": "food",
    "caption": "Delicious biryani with raita! 🍛 #kibana #jaipur",
    "timestamp": "2026-01-20",
    "likes": 245,
    "comments": 18,
    "media_id": "17987654321"
  },
  {
    "filename": "2026-01-15_002.jpg",
    "category": "ambiance",
    "caption": "Evening vibes at Kibana 🌅✨",
    "timestamp": "2026-01-15",
    "likes": 512,
    "comments": 42
  }
]
```

**SUMMARY.json:**
```json
{
  "account": "kibana.jaipur",
  "download_date": "2026-04-28T13:45:23.123456",
  "total_images": 87,
  "by_category": {
    "food": 35,
    "ambiance": 28,
    "event": 12,
    "interior": 10,
    "staff": 2
  }
}
```

---

## 🐛 Troubleshooting

### "LoginRequired" Error
**Solution:** Instagram detected login from new location. Either:
1. Try Option 1 (anonymous scraping) first
2. Or manually approve login on your phone
3. Then run Option 2 again

### "429 Too Many Requests"
**Solution:** Instagram rate-limiting you. The script has delays built-in, but:
- Wait 5-10 minutes before retrying
- Or use a VPN/proxy

### Images won't download
**Solution:**
- Check internet connection
- Ensure account is public: Settings → Privacy → Public Account
- Try with `--insecure` flag if SSL errors

### Instagrapi not installing
**Solution:**
```bash
python3 -m pip install --upgrade pip
pip install instagrapi --no-cache-dir
```

---

## 🎯 Manual Alternative (If Scripts Fail)

### Using Instagram's Data Export
1. Go to Instagram Settings → Your Activity → Download Your Information
2. Click "Download Your Data"
3. Choose email to receive data
4. Instagram sends .zip file (24-48 hours)
5. Extract and find posts in: `posts_1/content/posts_1.json`

### Using yt-dlp (CLI Tool)
```bash
# Install
pip install yt-dlp

# Download all posts
yt-dlp --write-info-json -o "%(title)s.%(ext)s" \
  https://www.instagram.com/kibana.jaipur/
```

---

## 📤 After Downloading: Upload to Website

### Step 1: Organize Images (Manual Review)
```bash
ls instagram_downloads/kibana_jaipur/ambiance/
# Review and delete low-quality or duplicate images
```

### Step 2: Upload to CDN

#### Option A: Cloudinary (Free tier)
```bash
pip install cloudinary

# In Python:
from cloudinary.uploader import upload
for img in Path("instagram_downloads/kibana_jaipur/ambiance").glob("*.jpg"):
    upload(str(img), folder="kibana/ambiance")
```

#### Option B: AWS S3
```bash
aws s3 sync instagram_downloads/kibana_jaipur/ \
  s3://your-bucket/kibana-jaipur/ \
  --recursive
```

#### Option C: Self-hosted on Fly.io
```bash
# Copy to web/public/images/
cp -r instagram_downloads/kibana_jaipur/* web/public/images/
git add . && git commit -m "Add kibana.jaipur images"
git push  # Deploys to Vercel
```

### Step 3: Update Database

Once images are hosted, add them to your restaurant profile:

```sql
INSERT INTO images (restaurant_id, url, type, caption) VALUES
  ('kibana-jaipur-id', 'https://cdn.example.com/kibana/ambiance/2026-01-15_001.jpg', 'ambiance', 'Evening vibes at Kibana 🌅✨'),
  ('kibana-jaipur-id', 'https://cdn.example.com/kibana/food/2026-01-20_001.jpg', 'food', 'Delicious biryani with raita! 🍛'),
  ...
;
```

Or via API:
```bash
curl -X POST http://localhost:8080/v1/admin/restaurants/kibana-jaipur/images \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://cdn.example.com/kibana/ambiance/2026-01-15_001.jpg",
    "type": "ambiance",
    "caption": "Evening vibes at Kibana 🌅✨"
  }'
```

---

## 🎬 Bonus: Extract Videos

If you want to download videos too:

```bash
# Using yt-dlp with video support
yt-dlp -f best \
  -o "%(title)s.%(ext)s" \
  https://www.instagram.com/kibana.jaipur/

# Then convert MP4 → upload to Mux
# (See Phase 1 for video upload process)
```

---

## ✅ Checklist

- [ ] Run script and download images
- [ ] Review images (delete duplicates/low quality)
- [ ] Organize into folders (ambiance, food, event, interior, staff)
- [ ] Upload to CDN or S3
- [ ] Add image URLs to database
- [ ] Test on website
- [ ] Share with restaurant owner for feedback

---

## 📞 Need Help?

If scripts fail, you can:
1. Try manual Instagram export (Step by step above)
2. Run with debug output: `python3 instagram_scraper_advanced.py --debug`
3. Check Instagram's API docs: https://developers.instagram.com/
4. Use tools: https://github.com/instagrapi/instagrapi

---

**Status:** Ready to Run  
**Time Estimate:** 10-30 mins (depending on post count)  
**Output Size:** ~500MB-1GB (depending on image count)
