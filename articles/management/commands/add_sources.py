"""
Management command to add initial tech news sources.

Usage:
    python manage.py add_sources
"""

from django.core.management.base import BaseCommand

from articles.models import Source


class Command(BaseCommand):
    help = "Add initial tech news sources with RSS feeds"

    def handle(self, *args, **options):
        sources = [
            {
                "name": "TechCrunch",
                "website_url": "https://techcrunch.com",
                "rss_feed_url": "https://techcrunch.com/feed/",
                "fetch_frequency": 30,
            },
            {
                "name": "The Verge",
                "website_url": "https://www.theverge.com",
                "rss_feed_url": "https://www.theverge.com/rss/index.xml",
                "fetch_frequency": 30,
            },
            {
                "name": "Ars Technica",
                "website_url": "https://arstechnica.com",
                "rss_feed_url": "https://feeds.arstechnica.com/arstechnica/index",
                "fetch_frequency": 60,
            },
            {
                "name": "Wired",
                "website_url": "https://www.wired.com",
                "rss_feed_url": "https://www.wired.com/feed/rss",
                "fetch_frequency": 60,
            },
            {
                "name": "VentureBeat",
                "website_url": "https://venturebeat.com",
                "rss_feed_url": "https://venturebeat.com/feed/",
                "fetch_frequency": 60,
            },
            {
                "name": "Hacker News",
                "website_url": "https://news.ycombinator.com",
                "rss_feed_url": "https://hnrss.org/frontpage",
                "fetch_frequency": 30,
            },
            {
                "name": "MIT Technology Review",
                "website_url": "https://www.technologyreview.com",
                "rss_feed_url": "https://www.technologyreview.com/feed/",
                "fetch_frequency": 120,
            },
            {
                "name": "ZDNet",
                "website_url": "https://www.zdnet.com",
                "rss_feed_url": "https://www.zdnet.com/news/rss.xml",
                "fetch_frequency": 60,
            },
        ]

        created_count = 0
        updated_count = 0

        for source_data in sources:
            source, created = Source.objects.update_or_create(
                name=source_data["name"], defaults=source_data
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"✅ Created: {source.name}"))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f"🔄 Updated: {source.name}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Done! Created {created_count}, Updated {updated_count}"
            )
        )
