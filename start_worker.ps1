# Start Celery Worker (Windows PowerShell)
#
# This script starts the Celery worker process on Windows.
# The worker listens to the Redis broker for new tasks and processes them.
#
# Usage: .\start_worker.ps1

Write-Host "🚀 Starting Celery Worker..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Start Celery worker with solo pool (required for Windows)
celery -A config worker --loglevel=info --pool=solo

# Note:
# - --pool=solo is required for Windows compatibility
# - Use --loglevel=debug for troubleshooting
# - Press Ctrl+C to stop the worker
