#!/usr/bin/env python3
"""
Instagram Image Scraper for Restaurant Content
Extracts images, captions, and metadata from a public Instagram account
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import requests
from typing import Optional, List, Dict
import time

# Requirements: pip install requests

class InstagramScraper:
    def __init__(self, username: str, output_dir: str = "instagram_downloads"):
        self.username = username
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        # Create subdirectories for organization
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

        self.metadata = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def scrape_public_profile(self) -> List[Dict]:
        """
        Scrape public Instagram profile data (no login required)
        Uses Instagram's public API endpoints
        """
        print(f"Scraping public profile: {self.username}")

        try:
            # Method 1: Use Instagram's embed endpoint (public)
            url = f"https://www.instagram.com/{self.username}/?__a=1"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }

            response = self.session.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                data = response.json()
                print(f"✅ Connected to @{self.username}")
                return self._extract_posts_from_response(data)
            else:
                print(f"⚠️ Instagram returned {response.status_code}")
                print("Trying alternative method...")
                return self._scrape_graphql_method()

        except Exception as e:
            print(f"❌ Error: {e}")
            print("\n📋 ALTERNATIVE: Manual Download via Instagram Data Export")
            print("=" * 60)
            self._print_manual_instructions()
            return []

    def _scrape_graphql_method(self) -> List[Dict]:
        """
        Alternative method using GraphQL (may be rate-limited)
        """
        try:
            # Instagram's public GraphQL endpoint
            graphql_url = "https://www.instagram.com/graphql/query/"

            # Query variables for profile
            variables = {
                "user_id": self._get_user_id(),
                "first": 50  # Get 50 posts
            }

            print("Using GraphQL method...")
            # This is a simplified approach; full implementation may require
            # additional authentication or token handling
            return []

        except Exception as e:
            print(f"GraphQL method failed: {e}")
            return []

    def _get_user_id(self) -> Optional[str]:
        """Get Instagram user ID from username"""
        try:
            url = f"https://www.instagram.com/{self.username}/"
            response = self.session.get(url)

            # Search for user ID in HTML
            if 'profilePage_' in response.text:
                start = response.text.find('"id":"') + 6
                end = response.text.find('"', start)
                return response.text[start:end]
        except:
            return None

    def _extract_posts_from_response(self, data: Dict) -> List[Dict]:
        """Extract posts from Instagram API response"""
        posts = []

        try:
            user_data = data.get('user', {})
            media_items = user_data.get('edge_user_to_photos_of_you', {}).get('edges', [])

            if not media_items:
                # Try alternative path
                media_items = user_data.get('media', [])

            print(f"Found {len(media_items)} posts")

            for idx, item in enumerate(media_items):
                post_data = self._extract_post_data(item, idx)
                if post_data:
                    posts.append(post_data)
                    print(f"  [{idx+1}] {post_data['caption'][:50]}...")

            return posts

        except Exception as e:
            print(f"Error extracting posts: {e}")
            return []

    def _extract_post_data(self, item: Dict, index: int) -> Optional[Dict]:
        """Extract post data from item"""
        try:
            node = item.get('node', item)

            post = {
                'index': index,
                'caption': node.get('edge_media_to_caption', {}).get('edges', [{}])[0].get('node', {}).get('text', ''),
                'likes': node.get('edge_liked_by', {}).get('count', 0),
                'comments': node.get('edge_media_to_comment', {}).get('count', 0),
                'timestamp': node.get('taken_at_timestamp', int(time.time())),
                'image_url': node.get('display_url', ''),
                'media_type': node.get('typename', 'GraphImage'),
            }

            return post

        except Exception as e:
            print(f"Error extracting post data: {e}")
            return None

    def download_images(self, posts: List[Dict]) -> None:
        """Download images from posts"""
        if not posts:
            print("No posts to download")
            return

        print(f"\n📥 Downloading {len(posts)} images...")

        for idx, post in enumerate(posts):
            image_url = post.get('image_url')
            caption = post.get('caption', 'no-caption')

            if not image_url:
                continue

            try:
                # Categorize based on caption keywords
                category = self._categorize_post(caption)
                category_dir = self.subdirs.get(category, self.subdirs['other'])

                # Create filename
                timestamp = datetime.fromtimestamp(post['timestamp']).strftime('%Y-%m-%d')
                filename = f"{timestamp}_{idx:03d}.jpg"
                filepath = category_dir / filename

                # Download image
                response = self.session.get(image_url, timeout=15)
                if response.status_code == 200:
                    with open(filepath, 'wb') as f:
                        f.write(response.content)

                    print(f"  ✅ [{idx+1}/{len(posts)}] {filename} ({category})")

                    # Store metadata
                    self.metadata.append({
                        'filename': filename,
                        'category': category,
                        'caption': caption,
                        'timestamp': timestamp,
                        'likes': post.get('likes', 0),
                        'comments': post.get('comments', 0),
                        'original_url': image_url
                    })
                else:
                    print(f"  ❌ [{idx+1}] Failed to download: {response.status_code}")

                time.sleep(0.5)  # Rate limiting

            except Exception as e:
                print(f"  ⚠️ Error downloading image: {e}")

    def _categorize_post(self, caption: str) -> str:
        """Categorize post based on caption keywords"""
        caption_lower = caption.lower()

        keywords = {
            'food': ['food', 'dish', 'menu', 'recipe', 'cuisine', 'taste', 'eat', 'delicious', 'yummy'],
            'ambiance': ['ambiance', 'ambience', 'decor', 'atmosphere', 'vibe', 'cozy', 'elegant', 'mood', 'lighting'],
            'event': ['event', 'wedding', 'celebration', 'party', 'gathering', 'function', 'ceremony', 'banquet'],
            'interior': ['interior', 'dining', 'restaurant', 'space', 'seating', 'hall', 'room', 'setup'],
            'staff': ['staff', 'team', 'chef', 'kitchen', 'server', 'service', 'hospitality'],
        }

        for category, words in keywords.items():
            if any(word in caption_lower for word in words):
                return category

        return 'other'

    def save_metadata(self) -> None:
        """Save metadata JSON file"""
        metadata_file = self.output_dir / "metadata.json"

        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

        print(f"\n📋 Metadata saved to {metadata_file}")

    def generate_summary(self) -> None:
        """Generate summary of downloaded content"""
        summary = {
            'username': self.username,
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

        print("\n" + "=" * 60)
        print("📊 DOWNLOAD SUMMARY")
        print("=" * 60)
        print(f"Username: @{self.username}")
        print(f"Total Images: {len(self.metadata)}")
        print(f"Downloaded: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\nBreakdown by Category:")
        for cat, count in summary['by_category'].items():
            print(f"  • {cat.capitalize()}: {count}")
        print(f"\nLocation: {self.output_dir.absolute()}")
        print("=" * 60)

    def _print_manual_instructions(self) -> None:
        """Print manual download instructions"""
        print("""
If automated scraping fails, follow these manual steps:

1. Go to Instagram Settings → Your Activity → Download Your Information
2. Select "Download Your Data"
3. Choose the email to receive the data
4. Instagram will send you a .zip file (may take 24-48 hours)
5. Extract the .zip and find posts in: posts_1/content/posts_1.json

Alternatively:
1. Open https://www.instagram.com/kibana.jaipur/ in browser
2. Use browser DevTools → Network tab
3. Filter for requests containing "graphql"
4. Look for image URLs in responses
5. Download manually or use a tool like yt-dlp:

   yt-dlp --write-info-json -o "%(title)s.%(ext)s" \
     https://www.instagram.com/kibana.jaipur/

More info: https://github.com/instagrapi/instagrapi
        """)


def main():
    username = "kibana.jaipur"  # Change if needed
    output_dir = "instagram_downloads/kibana_jaipur"

    print("🍽️  Instagram Restaurant Content Scraper")
    print("=" * 60)

    scraper = InstagramScraper(username, output_dir)

    # Scrape posts
    posts = scraper.scrape_public_profile()

    if posts:
        # Download images
        scraper.download_images(posts)

        # Save metadata
        scraper.save_metadata()

        # Generate summary
        scraper.generate_summary()
    else:
        print("\n⚠️ Could not scrape posts using automated method.")
        print("Please use manual method above or provide Instagram credentials.")


if __name__ == "__main__":
    main()
