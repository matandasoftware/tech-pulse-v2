#!/usr/bin/env bash
# Start Celery Beat Scheduler
#
# This script starts the Celery Beat scheduler that triggers periodic tasks
# at their scheduled times. Beat reads the schedule from the database
# (configured via django-celery-beat).
#
# Usage: ./start_beat.sh
# Or on Windows: bash start_beat.sh

echo "⏰ Starting Celery Beat Scheduler..."
echo "===================================="
echo ""
echo "Scheduled Tasks:"
echo "  • Fetch Articles: Every hour"
echo "  • Archive Old Articles: Daily at 2:00 AM UTC"
echo ""

# Start Celery beat scheduler
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler

# Note:
# - The schedule is stored in the database (django_celery_beat tables)
# - You can manage schedules via Django admin or code
# - Press Ctrl+C to stop the scheduler
