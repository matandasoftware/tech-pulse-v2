"""
Management command to fetch articles from RSS feeds.

Usage:
    python manage.py fetch_articles
    python manage.py fetch_articles --source "TechCrunch"
"""

from datetime import timedelta

import feedparser
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.utils import timezone

from articles.models import Article, Category, Source


class Command(BaseCommand):
    help = "Fetch articles from RSS feeds"

    def add_arguments(self, parser):
        parser.add_argument(
            "--source",
            type=str,
            help="Fetch from specific source only",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force fetch even if recently fetched",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting article fetch..."))

        # Get sources to fetch from
        sources = Source.objects.filter(is_active=True)

        if options["source"]:
            sources = sources.filter(name__icontains=options["source"])

        if not sources.exists():
            self.stdout.write(self.style.WARNING("No active sources found"))
            return

        total_fetched = 0
        total_created = 0

        for source in sources:
            self.stdout.write(f"\nFetching from {source.name}...")

            # Check if we should fetch (based on frequency)
            if not options["force"] and source.last_fetched:
                time_since_fetch = timezone.now() - source.last_fetched
                if time_since_fetch < timedelta(minutes=source.fetch_frequency):
                    minutes_ago = time_since_fetch.seconds // 60
                    self.stdout.write(
                        self.style.WARNING(
                            f"  Skipping (last fetched {minutes_ago} minutes ago)"
                        )
                    )
                    continue

            if not source.rss_feed_url:
                self.stdout.write(
                    self.style.WARNING("  No RSS feed URL configured")
                )
                continue

            # Fetch and parse RSS feed
            try:
                feed = feedparser.parse(source.rss_feed_url)

                if feed.bozo:
                    self.stdout.write(
                        self.style.ERROR(f"  Error parsing feed: {feed.bozo_exception}")
                    )
                    continue

                entries = feed.entries
                self.stdout.write(f"  Found {len(entries)} entries")

                created_count = 0

                for entry in entries:
                    total_fetched += 1

                    # Extract article data
                    title = entry.get("title", "").strip()
                    url = entry.get("link", "").strip()

                    if not title or not url:
                        continue

                    # Check if article already exists
                    if Article.objects.filter(url=url).exists():
                        continue

                    # Extract content
                    content = self._extract_content(entry)
                    summary = entry.get("summary", "")[:500]

                    # Extract published date
                    published_date = self._extract_date(entry)

                    # Extract image
                    image_url = self._extract_image(entry) or ""

                    # Determine category
                    category = self._determine_category(title, content, entry)

                    # Create article
                    try:
                        Article.objects.create(
                            title=title,
                            url=url,
                            content=content,
                            summary=summary,
                            source=source,
                            category=category,
                            image_url=image_url,
                            published_at=published_date or timezone.now(),
                        )
                        created_count += 1
                        total_created += 1

                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f"  Error creating article: {e}")
                        )

                # Update last fetched time
                source.last_fetched = timezone.now()
                source.save()

                self.stdout.write(
                    self.style.SUCCESS(f"  Created {created_count} new articles")
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  Error fetching feed: {e}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nFetch complete! Processed {total_fetched} entries, "
                f"created {total_created} new articles"
            )
        )

    def _extract_content(self, entry):
        """Extract article content from entry."""
        content = entry.get("content", [{}])[0].get("value", "")
        if not content:
            content = entry.get("description", "")
        if not content:
            content = entry.get("summary", "")

        # Strip HTML tags
        soup = BeautifulSoup(content, "html.parser")
        return soup.get_text()[:5000]  # Limit to 5000 chars

    def _extract_date(self, entry):
        """Extract published date from entry."""
        date_str = entry.get("published", "") or entry.get("updated", "")

        if date_str:
            try:
                # Parse various date formats
                from dateutil import parser

                dt = parser.parse(date_str)
                return timezone.make_aware(dt) if timezone.is_naive(dt) else dt
            except Exception:
                # Silently ignore date parsing errors and return None
                pass

        return None

    def _extract_image(self, entry):
        """Extract image URL from entry."""
        # Try media:thumbnail
        if hasattr(entry, "media_thumbnail"):
            return entry.media_thumbnail[0]["url"]

        # Try media:content
        if hasattr(entry, "media_content"):
            for media in entry.media_content:
                if "image" in media.get("type", ""):
                    return media.get("url")

        # Try enclosures
        if hasattr(entry, "enclosures"):
            for enc in entry.enclosures:
                if "image" in enc.get("type", ""):
                    return enc.get("href")

        # Try to find image in content
        content = entry.get("content", [{}])[0].get("value", "")
        if content:
            soup = BeautifulSoup(content, "html.parser")
            img = soup.find("img")
            if img and img.get("src"):
                return img["src"]

        return None

    def _determine_category(self, title, content, entry):
        """Determine article category based on content."""
        text = (title + " " + content).lower()

        # Category keywords
        categories_keywords = {
            "Artificial Intelligence": [
                "ai",
                "artificial intelligence",
                "machine learning",
                "deep learning",
                "neural network",
                "gpt",
                "llm",
            ],
            "Cybersecurity": [
                "security",
                "hack",
                "breach",
                "vulnerability",
                "cybersecurity",
                "malware",
                "ransomware",
            ],
            "Cloud Computing": [
                "cloud",
                "aws",
                "azure",
                "google cloud",
                "serverless",
                "kubernetes",
            ],
            "Mobile": [
                "mobile",
                "iphone",
                "android",
                "ios",
                "smartphone",
                "app store",
            ],
            "Programming": [
                "programming",
                "code",
                "developer",
                "javascript",
                "python",
                "github",
            ],
            "Hardware": [
                "hardware",
                "processor",
                "chip",
                "cpu",
                "gpu",
                "semiconductor",
            ],
            "Startups": ["startup", "funding", "venture capital", "ipo", "acquisition"],
            "Web Development": [
                "web",
                "frontend",
                "backend",
                "react",
                "vue",
                "angular",
            ],
        }

        # Check for category matches
        for category_name, keywords in categories_keywords.items():
            if any(keyword in text for keyword in keywords):
                category, _ = Category.objects.get_or_create(name=category_name)
                return category

        # Default category
        category, _ = Category.objects.get_or_create(name="Technology")
        return category
