# Automated Background Tasks with Celery

This guide explains how to set up and use Celery for automated article fetching and archiving in Tech Pulse.

## Prerequisites

### 1. Install Redis
Celery requires Redis as a message broker.

**Windows:**
```powershell
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
# After install, start Redis:
redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### 2. Verify Redis is Running
```bash
redis-cli ping
# Should return: PONG
```

## What Gets Automated

### 1. Fetch Articles
- **Schedule**: Every hour (at minute 0)
- **Task**: Fetches new articles from all configured RSS feeds
- **Example**: Runs at 1:00 AM, 2:00 AM, 3:00 AM, etc.

### 2. Archive Old Articles
- **Schedule**: Daily at 2:00 AM UTC
- **Task**: Archives articles older than 30 days (excludes bookmarked/read)
- **Example**: Runs every night at 2:00 AM to keep your feed clean

## Quick Start

### Option 1: Run Everything (Recommended for Development)

**Terminal 1 - Django Server:**
```bash
python manage.py runserver
```

**Terminal 2 - Celery Worker:**
```bash
# Windows
.\start_worker.ps1

# Mac/Linux
bash start_worker.sh
```

**Terminal 3 - Celery Beat Scheduler:**
```bash
# Windows
.\start_beat.ps1

# Mac/Linux
bash start_beat.sh
```

**Terminal 4 - Redis Server:**
```bash
redis-server
```

### Option 2: Manual Commands

**Start Celery Worker:**
```bash
celery -A config worker --loglevel=info --pool=solo
```

**Start Celery Beat:**
```bash
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

## Testing

### 1. Test Celery Connection
```python
# In Django shell (python manage.py shell)
from articles.tasks import test_celery
result = test_celery.delay()
print(result.get())  # Should print: "Celery task executed successfully"
```

### 2. Test Article Fetching Task
```python
from articles.tasks import fetch_articles_task
result = fetch_articles_task.delay()
print(result.get())  # Returns status of the fetch operation
```

### 3. Test Archive Task
```python
from articles.tasks import archive_old_articles_task
result = archive_old_articles_task.delay()
print(result.get())  # Returns status of the archive operation
```

## Monitoring Tasks

### Django Admin
1. Navigate to: `http://localhost:8000/admin/`
2. Go to **Django Celery Beat** section
3. View:
   - **Periodic Tasks**: See scheduled tasks and their configurations
   - **Crontab Schedules**: View/edit cron schedules
   - **Intervals**: Manage interval-based schedules

### Logs
Watch the Celery worker terminal for real-time logs:
```
[2024-03-08 02:00:00] INFO: Starting scheduled article fetch...
[2024-03-08 02:00:15] INFO: ✅ Scheduled article fetch completed successfully
```

## Customization

### Change Fetch Frequency

**Edit:** `config/celery.py`

```python
app.conf.beat_schedule = {
    'fetch-articles-every-hour': {
        'task': 'articles.tasks.fetch_articles_task',
        'schedule': crontab(minute=0),  # Every hour
        # Change to: crontab(minute='*/30')  # Every 30 minutes
        # Or: crontab(minute=0, hour='*/2')  # Every 2 hours
    },
}
```

### Change Archive Schedule

```python
'archive-old-articles-daily': {
    'task': 'articles.tasks.archive_old_articles_task',
    'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    # Change to: crontab(hour=3, minute=30)  # Daily at 3:30 AM
    # Or: crontab(hour=2, day_of_week='sunday')  # Weekly on Sunday at 2 AM
},
```

### Crontab Syntax Reference

```python
crontab(minute='*/15')          # Every 15 minutes
crontab(minute=0, hour='*/3')   # Every 3 hours
crontab(minute=0, hour=2)       # Daily at 2:00 AM
crontab(minute=0, hour='*/4')   # Every 4 hours
crontab(day_of_week='monday')   # Every Monday
crontab(hour=0, day_of_month=1) # First day of every month
```

## Troubleshooting

### "Error: No module named 'celery'"
```bash
pip install celery redis django-celery-beat
```

### "Error: Celery broker connection failed"
- Verify Redis is running: `redis-cli ping`
- Check Redis URL in `config/settings.py`
- Default: `CELERY_BROKER_URL = 'redis://localhost:6379/0'`

### Tasks Not Running
1. **Check Celery Worker is Running**: You should see worker logs
2. **Check Celery Beat is Running**: You should see beat scheduler logs
3. **Check Django Admin**: Verify tasks are enabled in Periodic Tasks
4. **Check Logs**: Look for errors in worker/beat terminals

### "Database is locked" on Windows
- Use `--pool=solo` flag when starting worker (already in scripts)
- Ensure only one worker is running

### Redis Not Installed
- **Windows**: Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
- **macOS**: `brew install redis`
- **Linux**: `sudo apt-get install redis-server`

## Advanced Usage

### Run Specific Task Manually
```python
# In Django shell
from articles.tasks import fetch_articles_task
fetch_articles_task.delay()  # Async execution
fetch_articles_task.apply()  # Sync execution (blocks)
```

### Task Retries
Tasks automatically retry on failure:
- **Fetch Articles**: Retries 3 times, 5-minute intervals
- **Archive Articles**: Retries 2 times, 1-hour intervals

### View Task Results
```python
from celery.result import AsyncResult
result = AsyncResult('task-id-here')
print(result.status)   # PENDING, SUCCESS, FAILURE
print(result.result)   # Task return value
```

## Benefits

- Automatic Content Updates: Articles fetch every hour without manual intervention
- Clean Feed: Old articles auto-archive daily
- Scalable: Add more workers to handle increased load
- Reliable: Automatic retries on failures
- Monitorable: Track all tasks via Django admin
- Flexible: Easy to add new scheduled tasks

## Adding New Tasks

1. **Create Task** (`articles/tasks.py`):
```python
from celery import shared_task

@shared_task(name='articles.tasks.my_new_task')
def my_new_task():
    # Your task logic here
    return "Task completed"
```

2. **Schedule Task** (`config/celery.py`):
```python
app.conf.beat_schedule = {
    # ... existing tasks ...
    'my-new-task-daily': {
        'task': 'articles.tasks.my_new_task',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
    },
}
```

3. **Restart Celery**: Stop and restart worker and beat

## Production Considerations

- Use environment variables for Redis URL
- Set up monitoring (Flower, Prometheus)
- Use supervisor/systemd to auto-restart Celery processes
- Configure task result expiration
- Set up logging to files
- Use separate Redis databases for different environments

## Need Help?

- Celery Docs: https://docs.celeryq.dev/
- Django-Celery-Beat: https://django-celery-beat.readthedocs.io/
- Redis Docs: https://redis.io/documentation
