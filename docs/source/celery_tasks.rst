.. _celery-tasks:

============
Celery Tasks
============

Tech Pulse v2.0 uses Celery for automated background tasks and scheduled jobs.

Overview
========

**Automated Tasks:**

* **Hourly**: Fetch new articles from RSS feeds
* **Daily (2 AM)**: Archive articles older than 30 days

**Benefits:**

* Hands-free content management
* Saves 2+ hours/week of manual work
* Consistent content updates
* Smart article lifecycle management

Architecture
============

.. code-block:: text

   Django App
      ↓
   Celery Worker (processes tasks)
      ↓
   Celery Beat (schedules tasks)
      ↓
   Database Backend (stores task results)

Configuration
=============

Celery App Setup
----------------

**config/celery.py:**

.. code-block:: python

   import os
   from celery import Celery
   from celery.schedules import crontab
   
   # Set Django settings module
   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
   
   # Create Celery app
   app = Celery('tech_pulse')
   
   # Load config from Django settings
   app.config_from_object('django.conf:settings', namespace='CELERY')
   
   # Auto-discover tasks
   app.autodiscover_tasks()
   
   # Scheduled tasks
   app.conf.beat_schedule = {
       'fetch-articles-hourly': {
           'task': 'articles.tasks.fetch_articles_task',
           'schedule': crontab(minute=0),  # Every hour
       },
       'archive-old-articles-daily': {
           'task': 'articles.tasks.archive_old_articles_task',
           'schedule': crontab(hour=2, minute=0),  # 2 AM daily
       },
   }

Django Settings
---------------

**config/settings.py:**

.. code-block:: python

   # Celery Configuration
   CELERY_BROKER_URL = 'redis://localhost:6379/0'  # Or database backend
   CELERY_RESULT_BACKEND = 'django-db'
   CELERY_CACHE_BACKEND = 'django-cache'
   CELERY_ACCEPT_CONTENT = ['json']
   CELERY_TASK_SERIALIZER = 'json'
   CELERY_RESULT_SERIALIZER = 'json'
   CELERY_TIMEZONE = 'UTC'
   
   # Installed apps
   INSTALLED_APPS = [
       # ...
       'django_celery_beat',
       'django_celery_results',
   ]

Database Backend (No Redis)
----------------------------

For development without Redis:

.. code-block:: python

   # Use database as broker
   CELERY_BROKER_URL = 'django://'
   CELERY_RESULT_BACKEND = 'django-db'

Install:

.. code-block:: bash

   pip install kombu django-celery-results

Tasks
=====

Fetch Articles Task
-------------------

**articles/tasks.py:**

.. code-block:: python

   from celery import shared_task
   from django.core.management import call_command
   
   @shared_task(name='articles.tasks.fetch_articles_task')
   def fetch_articles_task():
       """
       Fetch new articles from all active RSS feeds.
       
       Runs: Hourly
       Duration: 1-5 minutes depending on sources
       
       Returns:
           str: Success or error message
       """
       try:
           call_command('fetch_articles')
           return 'Article fetching completed successfully'
       except Exception as e:
           return f'Error fetching articles: {str(e)}'

**How it works:**

1. Queries all active sources (``is_active=True``)
2. Respects ``fetch_frequency`` setting
3. Parses RSS feeds with feedparser
4. Auto-detects categories from keywords
5. Tracks fetch status and errors
6. Updates ``last_fetch_at`` timestamp

Archive Articles Task
---------------------

.. code-block:: python

   @shared_task(name='articles.tasks.archive_old_articles_task')
   def archive_old_articles_task():
       """
       Archive articles older than 30 days.
       
       Runs: Daily at 2 AM
       Duration: < 1 minute
       
       Protects:
           - Bookmarked articles (never archived)
           - Articles with notes
       
       Returns:
           str: Count of archived articles or error
       """
       try:
           call_command('archive_old_articles')
           return 'Article archiving completed successfully'
       except Exception as e:
           return f'Error archiving articles: {str(e)}'

**Archiving Logic:**

* **Fresh** (0-7 days): Top priority, stays visible
* **Active** (7-30 days): Normal visibility
* **Archived** (30+ days): Hidden from default feed

**Protected Articles:**

* Bookmarked by any user
* Has user notes
* Manually marked important

Running Celery
==============

Start Celery Worker
-------------------

**Windows PowerShell:**

.. code-block:: powershell

   # start_worker.ps1
   celery -A config worker --loglevel=info --pool=solo

**Linux/Mac:**

.. code-block:: bash

   # start_worker.sh
   celery -A config worker --loglevel=info

Start Celery Beat
-----------------

**Windows PowerShell:**

.. code-block:: powershell

   # start_beat.ps1
   celery -A config beat --loglevel=info

**Linux/Mac:**

.. code-block:: bash

   # start_beat.sh
   celery -A config beat --loglevel=info

Start All Services
------------------

.. code-block:: bash

   # Terminal 1: Django
   python manage.py runserver
   
   # Terminal 2: Celery Worker
   celery -A config worker --loglevel=info
   
   # Terminal 3: Celery Beat
   celery -A config beat --loglevel=info

Production Deployment
=====================

Supervisor Configuration
------------------------

**/etc/supervisor/conf.d/celery.conf:**

.. code-block:: ini

   [program:celery-worker]
   command=/home/ubuntu/tech-pulse-v2/venv/bin/celery -A config worker --loglevel=info
   directory=/home/ubuntu/tech-pulse-v2
   user=ubuntu
   autostart=true
   autorestart=true
   redirect_stderr=true
   stdout_logfile=/var/log/celery/worker.log
   
   [program:celery-beat]
   command=/home/ubuntu/tech-pulse-v2/venv/bin/celery -A config beat --loglevel=info
   directory=/home/ubuntu/tech-pulse-v2
   user=ubuntu
   autostart=true
   autorestart=true
   redirect_stderr=true
   stdout_logfile=/var/log/celery/beat.log

.. code-block:: bash

   # Create log directory
   sudo mkdir -p /var/log/celery
   sudo chown ubuntu:ubuntu /var/log/celery
   
   # Update supervisor
   sudo supervisorctl reread
   sudo supervisorctl update
   
   # Start services
   sudo supervisorctl start celery-worker
   sudo supervisorctl start celery-beat
   
   # Check status
   sudo supervisorctl status

Systemd Services
----------------

**/etc/systemd/system/celery-worker.service:**

.. code-block:: ini

   [Unit]
   Description=Celery Worker
   After=network.target
   
   [Service]
   Type=forking
   User=ubuntu
   Group=ubuntu
   WorkingDirectory=/home/ubuntu/tech-pulse-v2
   Environment="PATH=/home/ubuntu/tech-pulse-v2/venv/bin"
   ExecStart=/home/ubuntu/tech-pulse-v2/venv/bin/celery -A config worker --loglevel=info --detach
   ExecStop=/home/ubuntu/tech-pulse-v2/venv/bin/celery -A config control shutdown
   
   [Install]
   WantedBy=multi-user.target

.. code-block:: bash

   # Enable and start
   sudo systemctl enable celery-worker
   sudo systemctl start celery-worker
   sudo systemctl status celery-worker

Docker Compose
--------------

See :ref:`deployment` for full Docker setup with Celery services.

Monitoring
==========

Celery Flower
-------------

Web-based monitoring tool:

.. code-block:: bash

   # Install
   pip install flower
   
   # Run
   celery -A config flower
   
   # Access at http://localhost:5555

View Tasks
----------

.. code-block:: python

   from django_celery_results.models import TaskResult
   
   # Recent tasks
   recent_tasks = TaskResult.objects.order_by('-date_created')[:10]
   
   for task in recent_tasks:
       print(f"{task.task_name}: {task.status} - {task.result}")

Logs
----

.. code-block:: bash

   # Worker logs
   tail -f /var/log/celery/worker.log
   
   # Beat logs
   tail -f /var/log/celery/beat.log

Manual Task Execution
=====================

From Django Shell
-----------------

.. code-block:: python

   from articles.tasks import fetch_articles_task, archive_old_articles_task
   
   # Run immediately
   result = fetch_articles_task.delay()
   
   # Check result
   print(result.status)
   print(result.result)

From Management Commands
------------------------

.. code-block:: bash

   # Fetch articles manually
   python manage.py fetch_articles
   
   # Force fetch (ignore frequency)
   python manage.py fetch_articles --force
   
   # Archive articles manually
   python manage.py archive_old_articles
   
   # Preview archival (dry run)
   python manage.py archive_old_articles --dry-run
   
   # Custom threshold (60 days)
   python manage.py archive_old_articles --days 60

Testing Tasks
=============

Test Script
-----------

**test_celery_tasks.ps1:**

.. code-block:: powershell

   Write-Host "Testing Celery Setup..." -ForegroundColor Cyan
   
   # Test worker connection
   celery -A config inspect ping
   
   # Test scheduled tasks
   celery -A config inspect scheduled
   
   # Trigger fetch task
   python -c "from articles.tasks import fetch_articles_task; fetch_articles_task.delay()"
   
   Write-Host "Tasks triggered. Check worker logs." -ForegroundColor Green

Unit Tests
----------

**articles/tests/test_tasks.py:**

.. code-block:: python

   import pytest
   from unittest.mock import patch, MagicMock
   from articles.tasks import fetch_articles_task
   
   @pytest.mark.django_db
   class TestFetchArticlesTask:
       @patch('articles.tasks.call_command')
       def test_fetch_articles_success(self, mock_call_command):
           """Test successful article fetching task."""
           result = fetch_articles_task()
           
           mock_call_command.assert_called_once_with('fetch_articles')
           assert 'completed' in result
       
       @patch('articles.tasks.call_command')
       def test_fetch_articles_error(self, mock_call_command):
           """Test task with error."""
           mock_call_command.side_effect = Exception('Fetch error')
           
           result = fetch_articles_task()
           
           assert 'Error' in result

Performance Optimization
========================

Task Timeouts
-------------

.. code-block:: python

   @shared_task(time_limit=300, soft_time_limit=240)
   def fetch_articles_task():
       """Task with 5-minute timeout."""
       pass

Task Retries
------------

.. code-block:: python

   @shared_task(
       bind=True,
       autoretry_for=(Exception,),
       retry_kwargs={'max_retries': 3, 'countdown': 60}
   )
   def fetch_articles_task(self):
       """Task with automatic retries."""
       try:
           call_command('fetch_articles')
       except Exception as exc:
           raise self.retry(exc=exc)

Rate Limiting
-------------

.. code-block:: python

   @shared_task(rate_limit='10/h')
   def limited_task():
       """Max 10 executions per hour."""
       pass

Troubleshooting
===============

Worker Not Starting
-------------------

.. code-block:: bash

   # Check logs
   celery -A config worker --loglevel=debug
   
   # Verify configuration
   python -c "from config.celery import app; print(app.conf)"

Tasks Not Running
-----------------

.. code-block:: bash

   # Check beat is running
   celery -A config inspect scheduled
   
   # Verify timezone
   python -c "from celery import current_app; print(current_app.conf.timezone)"

Redis Connection Error
----------------------

.. code-block:: bash

   # Check Redis is running
   redis-cli ping
   
   # Test connection
   python -c "import redis; r = redis.Redis(); r.ping()"

Database Backend Issues
-----------------------

.. code-block:: bash

   # Run migrations
   python manage.py migrate django_celery_results
