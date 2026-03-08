"""
Celery tasks for articles app.

Background tasks for fetching articles from RSS feeds and archiving old content.
"""

import logging

from celery import shared_task
from django.core.management import call_command
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, name="articles.tasks.fetch_articles_task")
def fetch_articles_task(self):
    """
    Fetch articles from all active RSS feeds.

    This task runs hourly to keep the article feed fresh with new content.
    """
    try:
        logger.info("Starting scheduled article fetch...")
        call_command("fetch_articles")
        logger.info("✅ Scheduled article fetch completed successfully")
        return {
            "status": "success",
            "timestamp": timezone.now().isoformat(),
            "message": "Articles fetched successfully",
        }
    except Exception as exc:
        logger.error(f"❌ Error fetching articles: {exc}")
        # Retry the task in 5 minutes if it fails
        raise self.retry(exc=exc, countdown=300, max_retries=3)


@shared_task(bind=True, name="articles.tasks.archive_old_articles_task")
def archive_old_articles_task(self):
    """
    Archive old articles to keep the feed clean.

    This task runs daily at 2 AM to archive articles older than 30 days
    that haven't been bookmarked or read.
    """
    try:
        logger.info("Starting scheduled article archiving...")
        call_command("archive_old_articles")
        logger.info("✅ Scheduled article archiving completed successfully")
        return {
            "status": "success",
            "timestamp": timezone.now().isoformat(),
            "message": "Old articles archived successfully",
        }
    except Exception as exc:
        logger.error(f"❌ Error archiving articles: {exc}")
        # Retry the task in 1 hour if it fails
        raise self.retry(exc=exc, countdown=3600, max_retries=2)


@shared_task(name="articles.tasks.test_celery")
def test_celery():
    """Simple test task to verify Celery is working."""
    logger.info("🎉 Celery is working!")
    return "Celery task executed successfully"
