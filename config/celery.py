"""
Celery configuration for Tech Pulse.

This module configures Celery for background task processing and periodic scheduling.
"""

import os

from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("config")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Configure Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    "fetch-articles-every-hour": {
        "task": "articles.tasks.fetch_articles_task",
        "schedule": crontab(minute=0),  # Run every hour at minute 0
        "options": {
            "expires": 3600,  # Task expires after 1 hour
        },
    },
    "archive-old-articles-daily": {
        "task": "articles.tasks.archive_old_articles_task",
        "schedule": crontab(hour=2, minute=0),  # Run daily at 2:00 AM
        "options": {
            "expires": 86400,  # Task expires after 24 hours
        },
    },
}

# Configure timezone for Celery Beat
app.conf.timezone = "UTC"


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task to test Celery configuration."""
    print(f"Request: {self.request!r}")
