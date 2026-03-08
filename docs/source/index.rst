Tech Pulse v2.0 - API Documentation
====================================

.. image:: https://img.shields.io/badge/Django-5.0-green.svg
   :target: https://www.djangoproject.com/
   :alt: Django Version

.. image:: https://img.shields.io/badge/DRF-3.15-blue.svg
   :target: https://www.django-rest-framework.org/
   :alt: DRF Version

.. image:: https://img.shields.io/badge/Python-3.x-yellow.svg
   :target: https://www.python.org/
   :alt: Python Version

.. image:: https://img.shields.io/badge/Tests-69%2F69-brightgreen.svg
   :alt: Test Coverage

**Advanced News Aggregation Platform with Intelligent Article Management**

Tech Pulse v2.0 is a production-ready Django REST Framework application that aggregates 
tech news from multiple sources, featuring automated content fetching, intelligent article 
lifecycle management, and comprehensive user interaction tracking.

Features
--------

* **Automated RSS Fetching**: Hourly content aggregation from 8 major tech sources
* **Intelligent Lifecycle**: Smart article state management (fresh/active/archived)
* **User Interactions**: Bookmarks, notes, follow-ups, and reading history
* **Analytics Dashboard**: Reading streaks, trends, and preference insights
* **Celery Automation**: Background tasks for fetching and archiving
* **Comprehensive Testing**: 69/69 tests passing with 76% backend coverage
* **PEP 8 Compliant**: 100% code quality standards

Technology Stack
----------------

**Backend:**

* Django 5.0
* Django REST Framework 3.15.2
* Celery 5.3.4
* PostgreSQL/SQLite
* Token Authentication

**Frontend:**

* React 18
* Vite
* Tailwind CSS
* React Router
* Recharts (Analytics)

**Testing:**

* pytest (Backend)
* Vitest (Frontend)
* 76% Backend Coverage
* 100% Frontend Component Coverage

Quick Links
-----------

* :ref:`getting-started`
* :ref:`api-endpoints`
* :ref:`models-reference`
* :ref:`authentication`
* :ref:`celery-tasks`

.. toctree::
   :maxdepth: 2
   :caption: User Guide:

   getting_started
   authentication
   deployment

.. toctree::
   :maxdepth: 2
   :caption: API Reference:

   api/index
   models/index

.. toctree::
   :maxdepth: 2
   :caption: Development:

   testing
   celery_tasks
   contributing

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`