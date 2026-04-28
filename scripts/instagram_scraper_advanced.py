#!/usr/bin/env python3
"""
Advanced Instagram Scraper using instagrapi
Requires Instagram credentials (supports session saving)
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict
import time

try:
    from instagrapi import Client
    from instagrapi.exceptions import LoginRequired
except ImportError:
    print("❌ instagrapi not installed. Install with:")
    print("   pip install instagrapi")
    sys.exit(1)


class AdvancedInstagramScraper:
    def __init__(self, username: str, password: Optional[str] = None,
                 output_dir: str = "instagram_downloads"):
        self.username = username
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        # Create subdirectories
        self.subdirs = {
            "ambiance": self.output_dir / "ambiance",
            "food": self.output_dir / "food",
            "event": self.output_dir / "event",
            "interior": self.output_dir / "interior",
            "staff": self.output_dir / "staff",
            "other": self.output_dir / "other"
        }

        for subdir in self.subdirs.values():
            subdir.mkdir(exist_ok=True)

        self.client = Client()
        self.metadata = []
        self.account_username = username  # Account to scrape
        self.account_password = password  # Login credentials (if scraping own account)

    def login(self, account_username: str, account_password: str) -> bool:
        """Login to Instagram account"""
        try:
            print(f"🔐 Logging in as @{account_username}...")
            self.client.login(account_username, account_password)
            print("✅ Login successful")
            return True
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False

    def scrape_user_posts(self, target_username: str, limit: int = 999) -> List[Dict]:
        """
        Scrape posts from a specific Instagram user
        Can be any public account
        """
        try:
            print(f"\n📸 Fetching posts from @{target_username}...")
            user = self.client.user_info_by_username(target_username)
            print(f"✅ Found: {user.full_name} ({user.biography})")

            # Get medias (posts)
            medias = self.client.user_medias(user.pk, amount=limit)
            print(f"✅ Found {len(medias)} posts")

            posts = []
            for idx, media in enumerate(medias):
                # instagrapi exposes caption as caption_text and the cover image as thumbnail_url.
                caption_text = getattr(media, 'caption_text', '') or ''
                image_url = getattr(media, 'thumbnail_url', None)
                if image_url is None:
                    image_url = str(image_url) if image_url else None
                else:
                    image_url = str(image_url)

                # For carousels/albums, also collect every resource thumbnail.
                extra_urls = []
                for res in (getattr(media, 'resources', []) or []):
                    rurl = getattr(res, 'thumbnail_url', None)
                    if rurl:
                        extra_urls.append(str(rurl))

                post_data = {
                    'index': idx,
                    'caption': caption_text,
                    'likes': media.like_count,
                    'comments': media.comment_count,
                    'timestamp': int(media.taken_at.timestamp()),
                    'image_url': image_url,
                    'extra_urls': extra_urls,
                    'media_type': media.media_type,
                    'media_id': str(media.id),
                }

                posts.append(post_data)
                preview = caption_text[:50] if caption_text else 'No caption'
                print(f"  [{idx+1}] {preview}...")

                # Respect rate limits
                if (idx + 1) % 10 == 0:
                    time.sleep(2)

            return posts

        except LoginRequired:
            print("❌ Login required. Please provide Instagram credentials.")
            return []
        except Exception as e:
            print(f"❌ Error scraping posts: {e}")
            return []

    def download_images(self, posts: List[Dict]) -> None:
        """Download images from posts"""
        if not posts:
            print("No posts to download")
            return

        print(f"\n📥 Downloading {len(posts)} images...")
        download_count = 0

        import requests
        for idx, post in enumerate(posts):
            caption = post.get('caption', '') or ''
            urls = []
            primary = post.get('image_url')
            if primary:
                urls.append(primary)
            urls.extend(post.get('extra_urls') or [])
            # de-dupe while preserving order
            seen = set()
            urls = [u for u in urls if not (u in seen or seen.add(u))]

            if not urls:
                print(f"  ⚠️ [{idx+1}] No image URL")
                continue

            category = self._categorize_post(caption)
            category_dir = self.subdirs.get(category, self.subdirs['other'])
            timestamp = datetime.fromtimestamp(post['timestamp']).strftime('%Y-%m-%d')

            for slide_i, image_url in enumerate(urls):
                try:
                    suffix = '' if slide_i == 0 else f"_s{slide_i}"
                    filename = f"{timestamp}_{idx:03d}{suffix}.jpg"
                    filepath = category_dir / filename

                    if filepath.exists() and filepath.stat().st_size > 0:
                        # Already downloaded — skip but still record metadata
                        download_count += 1
                    else:
                        response = requests.get(image_url, timeout=20)
                        if response.status_code != 200:
                            print(f"  ❌ [{idx+1}.{slide_i}] HTTP {response.status_code}")
                            continue
                        with open(filepath, 'wb') as f:
                            f.write(response.content)
                        download_count += 1
                        print(f"  ✅ [{idx+1}/{len(posts)}.{slide_i}] {filename} ({category})")

                    self.metadata.append({
                        'filename': filename,
                        'category': category,
                        'caption': caption[:300].replace('\n', ' '),
                        'timestamp': timestamp,
                        'likes': post.get('likes', 0),
                        'comments': post.get('comments', 0),
                        'media_id': post.get('media_id'),
                    })

                    time.sleep(0.4)  # rate-limit politeness

                except Exception as e:
                    print(f"  ⚠️ [{idx+1}.{slide_i}] Error: {e}")

        print(f"\n✅ Downloaded {download_count}/{len(posts)} images")

    def _categorize_post(self, caption: str) -> str:
        """Auto-categorize posts based on caption"""
        caption_lower = caption.lower()

        keywords = {
            'food': ['food', 'dish', 'menu', 'recipe', 'cuisine', 'taste', 'eat', 'delicious', 'yummy', 'appetizer', 'dessert', 'beverage'],
            'ambiance': ['ambiance', 'ambience', 'decor', 'atmosphere', 'vibe', 'cozy', 'elegant', 'mood', 'lighting', 'setting'],
            'event': ['event', 'wedding', 'celebration', 'party', 'gathering', 'function', 'ceremony', 'banquet', 'reception'],
            'interior': ['interior', 'dining', 'restaurant', 'space', 'seating', 'hall', 'room', 'setup', 'table'],
            'staff': ['staff', 'team', 'chef', 'kitchen', 'server', 'service', 'hospitality', 'staff'],
        }

        for category, words in keywords.items():
            if any(word in caption_lower for word in words):
                return category

        return 'other'

    def save_metadata(self) -> None:
        """Save metadata to JSON + IMAGE_CATALOG.csv"""
        metadata_file = self.output_dir / "metadata.json"

        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

        print(f"📋 Metadata saved: {metadata_file}")

        # Also emit IMAGE_CATALOG.csv (filename, category, caption, timestamp, likes, recommended_for)
        import csv
        catalog_file = self.output_dir / "IMAGE_CATALOG.csv"
        recommend_map = {
            'food': 'menu, hero',
            'ambiance': 'hero, gallery',
            'event': 'events page, gallery',
            'interior': 'about, gallery',
            'staff': 'about',
            'other': 'gallery',
        }
        with open(catalog_file, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f)
            w.writerow(['filename', 'category', 'caption', 'timestamp', 'likes', 'recommended_for'])
            for m in self.metadata:
                w.writerow([
                    m['filename'],
                    m['category'],
                    (m.get('caption') or '').replace('\n', ' ')[:300],
                    m.get('timestamp', ''),
                    m.get('likes', 0),
                    recommend_map.get(m['category'], 'gallery'),
                ])
        print(f"📋 Catalog saved:  {catalog_file}")

    def generate_summary(self) -> None:
        """Generate summary report"""
        summary = {
            'account': self.account_username,
            'download_date': datetime.now().isoformat(),
            'total_images': len(self.metadata),
            'by_category': {}
        }

        for item in self.metadata:
            cat = item['category']
            summary['by_category'][cat] = summary['by_category'].get(cat, 0) + 1

        summary_file = self.output_dir / "SUMMARY.json"
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)

        print("\n" + "=" * 70)
        print("📊 INSTAGRAM DOWNLOAD SUMMARY")
        print("=" * 70)
        print(f"Account: @{self.account_username}")
        print(f"Total Images Downloaded: {len(self.metadata)}")
        print(f"Downloaded: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\nBreakdown by Category:")

        for cat, count in sorted(summary['by_category'].items()):
            print(f"  • {cat.capitalize():<15} {count:>3} images")

        print(f"\n📁 Location: {self.output_dir.absolute()}")
        print("=" * 70)

        # Print next steps
        print("\n🚀 NEXT STEPS:")
        print("1. Review downloaded images in folders (organize if needed)")
        print("2. Upload to CDN (Cloudinary, S3, or Mux)")
        print("3. Update database with image URLs")
        print("4. Add metadata to restaurant profile on website")


def main():
    print("🍽️  Advanced Instagram Restaurant Content Scraper")
    print("=" * 70)

    # Configuration
    TARGET_ACCOUNT = "kibana.jaipur"  # Account to scrape
    OUTPUT_DIR = "instagram_downloads/kibana_jaipur"

    print(f"\n📍 Target Account: @{TARGET_ACCOUNT}")
    print(f"📁 Output Directory: {OUTPUT_DIR}\n")

    scraper = AdvancedInstagramScraper(TARGET_ACCOUNT, output_dir=OUTPUT_DIR)

    # Option 1: Scrape without login (public posts only)
    print("Option 1: Scrape as anonymous (public posts only)")
    print("-" * 70)
    try:
        posts = scraper.scrape_user_posts(TARGET_ACCOUNT)

        if posts:
            scraper.download_images(posts)
            scraper.save_metadata()
            scraper.generate_summary()
        else:
            print("\n⚠️ Could not fetch posts. Trying Option 2...\n")
            option_2 = True
    except Exception as e:
        print(f"Anonymous scraping failed: {e}")
        option_2 = True

    # Option 2: Login with credentials
    if 'option_2' in locals() and option_2:
        print("\nOption 2: Login with credentials (all posts, including private)")
        print("-" * 70)

        # Prefer env vars (non-interactive); fall back to prompt if a TTY exists.
        ig_username = os.environ.get('IG_USERNAME', '').strip()
        ig_password = os.environ.get('IG_PASSWORD', '').strip()
        if not ig_username or not ig_password:
            if sys.stdin.isatty():
                ig_username = ig_username or input("Enter Instagram username: ").strip()
                ig_password = ig_password or input("Enter Instagram password (or press Enter to skip): ").strip()
            else:
                print("⚠️  Non-interactive run and IG_USERNAME / IG_PASSWORD env vars not set.")
                print("   Re-run with:  IG_USERNAME=kibana.jaipur IG_PASSWORD=*** python3 instagram_scraper_advanced.py")
                return

        if ig_username and ig_password:
            if scraper.login(ig_username, ig_password):
                posts = scraper.scrape_user_posts(TARGET_ACCOUNT)

                if posts:
                    scraper.download_images(posts)
                    scraper.save_metadata()
                    scraper.generate_summary()
                else:
                    print("No posts found")
        else:
            print("Skipped login. Using anonymous mode (public posts only)")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
