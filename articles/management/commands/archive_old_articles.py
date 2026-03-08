"""
Management command to archive old unread articles.

Automatically archives articles that are:
- 30+ days old
- Not bookmarked
- Not read

Usage:
    python manage.py archive_old_articles
    python manage.py archive_old_articles --dry-run  # See what would be archived
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from articles.models import Article


class Command(BaseCommand):
    help = "Archive old unread articles (30+ days)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be archived without actually archiving",
        )
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Archive articles older than this many days (default: 30)",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        days = options["days"]

        cutoff_date = timezone.now() - timedelta(days=days)

        self.stdout.write(f"🔍 Finding articles to archive (older than {days} days)...")

        # Find articles to archive
        articles_to_archive = Article.objects.filter(
            published_at__lt=cutoff_date,
            bookmark_count=0,  # Not bookmarked
            state__in=["fresh", "active"],  # Not already archived
        )

        count = articles_to_archive.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("✅ No articles need archiving"))
            return

        self.stdout.write(f"📦 Found {count} articles to archive")

        if dry_run:
            self.stdout.write(
                self.style.WARNING("\n🔍 DRY RUN - No changes will be made")
            )
            for article in articles_to_archive[:10]:  # Show first 10
                self.stdout.write(
                    f"  - {article.title[:60]}... ({article.age_in_days()} days old)"
                )
            if count > 10:
                self.stdout.write(f"  ... and {count - 10} more")
            return

        # Archive articles
        archived_count = 0
        for article in articles_to_archive:
            article.state = "archived"
            article.archived_at = timezone.now()
            article.save()
            archived_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"\n✅ Archived {archived_count} articles")
        )
