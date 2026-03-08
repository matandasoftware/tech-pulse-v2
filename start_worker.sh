#!/usr/bin/env bash
# Start Celery Worker
#
# This script starts the Celery worker process that executes background tasks.
# The worker listens to the Redis broker for new tasks and processes them.
#
# Usage: ./start_worker.sh
# Or on Windows: bash start_worker.sh

echo "🚀 Starting Celery Worker..."
echo "================================"
echo ""

# Start Celery worker with INFO logging level
celery -A config worker --loglevel=info --pool=solo

# Note: 
# - Use --pool=solo on Windows (required for Windows compatibility)
# - Use --loglevel=info for detailed logging
# - Use --loglevel=debug for troubleshooting
# - Press Ctrl+C to stop the worker
