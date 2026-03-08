# Start Celery Beat Scheduler (Windows PowerShell)
#
# This script starts the Celery Beat scheduler on Windows.
# Beat triggers periodic tasks at their scheduled times.
#
# Usage: .\start_beat.ps1

Write-Host "⏰ Starting Celery Beat Scheduler..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scheduled Tasks:" -ForegroundColor Yellow
Write-Host "  • Fetch Articles: Every hour" -ForegroundColor White
Write-Host "  • Archive Old Articles: Daily at 2:00 AM UTC" -ForegroundColor White
Write-Host ""

# Start Celery beat scheduler
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler

# Note:
# - The schedule is stored in the database (django_celery_beat tables)
# - You can manage schedules via Django admin or code
# - Press Ctrl+C to stop the scheduler
