.. _getting-started:

===============
Getting Started
===============

Installation
============

Prerequisites
-------------

* Python 3.8+
* Node.js 18+ (for frontend)
* PostgreSQL 12+ (production) or SQLite (development)
* Git

Backend Setup
-------------

1. Clone the Repository
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   git clone https://github.com/matandasoftware/tech-pulse-v2.git
   cd tech-pulse-v2

2. Create Virtual Environment
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python -m venv venv
   
   # On Windows PowerShell:
   .\venv\Scripts\activate
   
   # On Linux/Mac:
   source venv/bin/activate

3. Install Dependencies
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   pip install -r requirements.txt

4. Run Migrations
~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python manage.py migrate

5. Create Superuser
~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python manage.py createsuperuser

6. Add News Sources
~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python manage.py add_sources

This command populates the database with 8 major tech news sources:

* TechCrunch
* The Verge
* Ars Technica
* Wired
* VentureBeat
* Hacker News
* MIT Technology Review
* ZDNet

7. Fetch Initial Articles
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python manage.py fetch_articles

8. Start Development Server
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python manage.py runserver

The backend API will be available at http://localhost:8000

Frontend Setup
--------------

1. Navigate to Frontend Directory
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   cd frontend

2. Install Dependencies
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   npm install

3. Start Development Server
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   npm run dev

The frontend will be available at http://localhost:5173

Celery Setup (Optional)
------------------------

For automated article fetching and archiving:

1. Start Celery Worker
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Windows PowerShell:
   .\start_worker.ps1
   
   # Linux/Mac:
   ./start_worker.sh

2. Start Celery Beat Scheduler
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Windows PowerShell:
   .\start_beat.ps1
   
   # Linux/Mac:
   ./start_beat.sh

Scheduled Tasks:

* **Hourly**: Fetch new articles from RSS feeds
* **Daily (2 AM)**: Archive articles older than 30 days

Configuration
=============

Environment Variables
---------------------

Create a ``.env`` file in the project root (optional):

.. code-block:: bash

   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///db.sqlite3
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:5173

Production Settings
-------------------

For production deployment:

.. code-block:: bash

   DEBUG=False
   SECRET_KEY=generate-secure-key
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   CELERY_BROKER_URL=redis://localhost:6379/0

Database Configuration
----------------------

**Development (SQLite)**

Default configuration uses SQLite. No additional setup required.

**Production (PostgreSQL)**

1. Install PostgreSQL
2. Create database:

   .. code-block:: sql

      CREATE DATABASE techpulse;
      CREATE USER techpulseuser WITH PASSWORD 'yourpassword';
      GRANT ALL PRIVILEGES ON DATABASE techpulse TO techpulseuser;

3. Update ``DATABASE_URL`` in ``.env``

Testing
=======

Backend Tests
-------------

Run all backend tests:

.. code-block:: bash

   pytest

Run with coverage:

.. code-block:: bash

   pytest --cov

Run with verbose output:

.. code-block:: bash

   pytest -v

Results:

* **35 tests** across 3 apps
* **76% code coverage**
* **100% pass rate**

Frontend Tests
--------------

.. code-block:: bash

   cd frontend
   npm test

Run with UI:

.. code-block:: bash

   npm run test:ui

Run with coverage:

.. code-block:: bash

   npm run test:coverage

Results:

* **34 tests** for components, contexts, and pages
* **100% pass rate**

Run All Tests
-------------

.. code-block:: bash

   # Windows PowerShell:
   .\run_all_tests.ps1

Total: **69/69 tests passing** (100%)

Admin Panel
===========

Access the Django admin panel at http://localhost:8000/admin

Features:

* User management
* Article management with state filters
* Source configuration
* Category management
* Interaction tracking

API Documentation
=================

Interactive API documentation available at:

* http://localhost:8000/api/ - API root with endpoint discovery

Quick Start Commands
====================

.. code-block:: bash

   # Fetch new articles
   python manage.py fetch_articles
   
   # Force fetch (ignore frequency limits)
   python manage.py fetch_articles --force
   
   # Archive old articles
   python manage.py archive_old_articles
   
   # Preview archival (dry run)
   python manage.py archive_old_articles --dry-run
   
   # Custom archive threshold (60 days)
   python manage.py archive_old_articles --days 60

Troubleshooting
===============

Port Already in Use
-------------------

Backend (port 8000):

.. code-block:: bash

   python manage.py runserver 8001

Frontend (port 5173):

.. code-block:: bash

   npm run dev -- --port 5174

Database Locked (SQLite)
-------------------------

.. code-block:: bash

   # Stop all Django processes
   # Delete db.sqlite3
   # Run migrations again
   python manage.py migrate

Celery Not Working
------------------

Ensure you have either:

* Database backend (default, no Redis needed)
* Redis installed and running (for production)

Next Steps
==========

* :ref:`authentication` - Learn about API authentication
* :ref:`api-endpoints` - Explore available endpoints
* :ref:`models-reference` - Understand data models
* :ref:`deployment` - Deploy to production