.. _deployment:

==========
Deployment
==========

This guide covers deploying Tech Pulse v2.0 to production.

Production Checklist
====================

Before Deployment
-----------------

.. code-block:: bash

   # 1. Set DEBUG to False
   DEBUG=False
   
   # 2. Generate secure SECRET_KEY
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   
   # 3. Configure allowed hosts
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   
   # 4. Set database URL
   DATABASE_URL=postgresql://user:password@host:port/dbname
   
   # 5. Configure static files
   STATIC_ROOT=/var/www/techpulse/static/
   
   # 6. Set up CORS
   CORS_ALLOWED_ORIGINS=https://yourdomain.com

Security Settings
-----------------

Update ``config/settings.py`` for production:

.. code-block:: python

   # Security
   DEBUG = False
   SECURE_SSL_REDIRECT = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   SECURE_BROWSER_XSS_FILTER = True
   SECURE_CONTENT_TYPE_NOSNIFF = True
   X_FRAME_OPTIONS = 'DENY'
   
   # HSTS
   SECURE_HSTS_SECONDS = 31536000
   SECURE_HSTS_INCLUDE_SUBDOMAINS = True
   SECURE_HSTS_PRELOAD = True

Docker Deployment
=================

Dockerfile
----------

Create ``Dockerfile`` in project root:

.. code-block:: dockerfile

   FROM python:3.12-slim
   
   # Set environment variables
   ENV PYTHONDONTWRITEBYTECODE=1
   ENV PYTHONUNBUFFERED=1
   
   # Set work directory
   WORKDIR /app
   
   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       postgresql-client \
       && rm -rf /var/lib/apt/lists/*
   
   # Install Python dependencies
   COPY requirements.txt /app/
   RUN pip install --upgrade pip && \
       pip install -r requirements.txt
   
   # Copy project
   COPY . /app/
   
   # Collect static files
   RUN python manage.py collectstatic --noinput
   
   # Run gunicorn
   CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]

docker-compose.yml
------------------

Create ``docker-compose.yml``:

.. code-block:: yaml

   version: '3.8'
   
   services:
     db:
       image: postgres:15
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         POSTGRES_DB: techpulse
         POSTGRES_USER: techpulseuser
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       ports:
         - "5432:5432"
     
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
     
     web:
       build: .
       command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
       volumes:
         - .:/app
         - static_volume:/app/staticfiles
       ports:
         - "8000:8000"
       env_file:
         - .env
       depends_on:
         - db
         - redis
     
     celery:
       build: .
       command: celery -A config worker -l info
       volumes:
         - .:/app
       env_file:
         - .env
       depends_on:
         - db
         - redis
     
     celery-beat:
       build: .
       command: celery -A config beat -l info
       volumes:
         - .:/app
       env_file:
         - .env
       depends_on:
         - db
         - redis
     
     nginx:
       image: nginx:alpine
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - static_volume:/app/staticfiles
         - ./frontend/dist:/usr/share/nginx/html
       ports:
         - "80:80"
         - "443:443"
       depends_on:
         - web
   
   volumes:
     postgres_data:
     static_volume:

Build and Run
-------------

.. code-block:: bash

   # Build containers
   docker-compose build
   
   # Run migrations
   docker-compose run web python manage.py migrate
   
   # Create superuser
   docker-compose run web python manage.py createsuperuser
   
   # Add sources
   docker-compose run web python manage.py add_sources
   
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f

Heroku Deployment
=================

Prerequisites
-------------

* Heroku account
* Heroku CLI installed

Files Required
--------------

**Procfile:**

.. code-block:: text

   web: gunicorn config.wsgi
   worker: celery -A config worker -l info
   beat: celery -A config beat -l info

**runtime.txt:**

.. code-block:: text

   python-3.12.1

Deploy to Heroku
----------------

.. code-block:: bash

   # Login to Heroku
   heroku login
   
   # Create app
   heroku create techpulse-v2
   
   # Add PostgreSQL
   heroku addons:create heroku-postgresql:mini
   
   # Add Redis
   heroku addons:create heroku-redis:mini
   
   # Set environment variables
   heroku config:set DEBUG=False
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set ALLOWED_HOSTS=techpulse-v2.herokuapp.com
   
   # Deploy
   git push heroku main
   
   # Run migrations
   heroku run python manage.py migrate
   
   # Create superuser
   heroku run python manage.py createsuperuser
   
   # Add sources
   heroku run python manage.py add_sources
   
   # Scale workers
   heroku ps:scale web=1 worker=1 beat=1

Railway Deployment
==================

.. code-block:: bash

   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   
   # Add PostgreSQL
   railway add
   # Select PostgreSQL
   
   # Add Redis
   railway add
   # Select Redis
   
   # Deploy
   railway up

DigitalOcean App Platform
==========================

1. **Create App** on DigitalOcean
2. **Connect GitHub** repository
3. **Add PostgreSQL** database
4. **Add Redis** cache
5. **Configure Environment Variables**:

   .. code-block:: bash

      DEBUG=False
      SECRET_KEY=your-secret-key
      DATABASE_URL=${db.DATABASE_URL}
      REDIS_URL=${redis.REDIS_URL}

6. **Deploy**

AWS Deployment (EC2 + RDS)
===========================

EC2 Setup
---------

.. code-block:: bash

   # SSH into EC2 instance
   ssh -i keypair.pem ubuntu@ec2-instance
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python 3.12
   sudo apt install python3.12 python3.12-venv python3-pip -y
   
   # Install PostgreSQL client
   sudo apt install postgresql-client -y
   
   # Clone repository
   git clone https://github.com/matandasoftware/tech-pulse-v2.git
   cd tech-pulse-v2
   
   # Create virtual environment
   python3.12 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   pip install gunicorn
   
   # Set environment variables
   export DATABASE_URL=postgresql://user:pass@rds-endpoint/dbname
   export SECRET_KEY=your-secret-key
   export DEBUG=False
   
   # Run migrations
   python manage.py migrate
   
   # Collect static files
   python manage.py collectstatic --noinput
   
   # Create superuser
   python manage.py createsuperuser

Gunicorn Service
----------------

Create ``/etc/systemd/system/techpulse.service``:

.. code-block:: ini

   [Unit]
   Description=Tech Pulse Gunicorn
   After=network.target
   
   [Service]
   User=ubuntu
   Group=www-data
   WorkingDirectory=/home/ubuntu/tech-pulse-v2
   Environment="PATH=/home/ubuntu/tech-pulse-v2/venv/bin"
   ExecStart=/home/ubuntu/tech-pulse-v2/venv/bin/gunicorn \
             --workers 3 \
             --bind unix:/home/ubuntu/tech-pulse-v2/techpulse.sock \
             config.wsgi:application
   
   [Install]
   WantedBy=multi-user.target

.. code-block:: bash

   # Enable and start service
   sudo systemctl enable techpulse
   sudo systemctl start techpulse
   sudo systemctl status techpulse

Nginx Configuration
-------------------

Create ``/etc/nginx/sites-available/techpulse``:

.. code-block:: nginx

   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location /static/ {
           alias /home/ubuntu/tech-pulse-v2/staticfiles/;
       }
       
       location /media/ {
           alias /home/ubuntu/tech-pulse-v2/media/;
       }
       
       location / {
           proxy_pass http://unix:/home/ubuntu/tech-pulse-v2/techpulse.sock;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }

.. code-block:: bash

   # Enable site
   sudo ln -s /etc/nginx/sites-available/techpulse /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx

SSL with Let's Encrypt
-----------------------

.. code-block:: bash

   # Install certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Obtain certificate
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   
   # Auto-renewal
   sudo certbot renew --dry-run

Frontend Deployment
===================

Build Frontend
--------------

.. code-block:: bash

   cd frontend
   
   # Update API URL in .env
   VITE_API_URL=https://api.yourdomain.com
   
   # Build for production
   npm run build
   
   # Deploy dist/ folder to:
   # - Vercel
   # - Netlify
   # - Cloudflare Pages
   # - AWS S3 + CloudFront

Vercel Deployment
-----------------

.. code-block:: bash

   cd frontend
   
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod

Database Backup
===============

PostgreSQL Backup
-----------------

.. code-block:: bash

   # Backup
   pg_dump -h localhost -U techpulseuser techpulse > backup.sql
   
   # Restore
   psql -h localhost -U techpulseuser techpulse < backup.sql

Automated Backups (Cron)
-------------------------

.. code-block:: bash

   # Add to crontab
   0 2 * * * pg_dump -h localhost -U user dbname > /backups/db_$(date +\%Y\%m\%d).sql

Monitoring
==========

Health Check Endpoint
---------------------

Add to ``config/urls.py``:

.. code-block:: python

   from django.http import JsonResponse
   
   def health_check(request):
       return JsonResponse({'status': 'healthy'})
   
   urlpatterns = [
       path('health/', health_check),
       # ... other patterns
   ]

Logs
----

.. code-block:: bash

   # Django logs
   tail -f /var/log/techpulse/django.log
   
   # Nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   
   # Celery logs
   tail -f /var/log/celery/worker.log

Performance Optimization
========================

Database
--------

.. code-block:: python

   # Use select_related for ForeignKey
   articles = Article.objects.select_related('category', 'source').all()
   
   # Use prefetch_related for reverse ForeignKey
   users = User.objects.prefetch_related('userarticle_set').all()
   
   # Add database indexes
   class Article(models.Model):
       class Meta:
           indexes = [
               models.Index(fields=['state', '-created_at']),
           ]

Caching
-------

.. code-block:: python

   # Redis caching
   CACHES = {
       'default': {
           'BACKEND': 'django.core.cache.backends.redis.RedisCache',
           'LOCATION': 'redis://127.0.0.1:6379/1',
       }
   }

Troubleshooting
===============

502 Bad Gateway
---------------

* Check Gunicorn is running: ``sudo systemctl status techpulse``
* Check socket permissions: ``ls -la techpulse.sock``
* Check Nginx configuration: ``sudo nginx -t``

Static Files Not Loading
-------------------------

.. code-block:: bash

   python manage.py collectstatic --clear --noinput
   sudo systemctl restart nginx

Database Connection Error
-------------------------

* Verify DATABASE_URL is correct
* Check PostgreSQL is running: ``sudo systemctl status postgresql``
* Test connection: ``psql -h host -U user -d dbname``

Next Steps
==========

* :ref:`getting-started` - Initial setup
* :ref:`testing` - Run tests before deployment
* :ref:`celery-tasks` - Configure automation