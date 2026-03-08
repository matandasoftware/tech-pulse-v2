.. _api-endpoints:

=============
API Reference
=============

Base URL
========

Development: ``http://localhost:8000/api/``

Production: ``https://yourdomain.com/api/``

Authentication
==============

All endpoints (except registration and login) require Token authentication.

Include token in Authorization header:

.. code-block:: http

   Authorization: Token YOUR_TOKEN_HERE

See :ref:`authentication` for detailed authentication guide.

Article Endpoints
=================

List Articles
-------------

.. http:get:: /api/articles/

   List all articles (excludes archived by default).

   **Query Parameters:**

   * ``category`` (integer) - Filter by category ID
   * ``source`` (integer) - Filter by source ID
   * ``search`` (string) - Search in title/content
   * ``state`` (string) - Filter by state: ``fresh``, ``active``, ``archived``
   * ``ordering`` (string) - Sort field (e.g., ``-created_at``, ``view_count``)
   * ``page`` (integer) - Page number for pagination

   **Example Request:**

   .. code-block:: bash

      curl -H "Authorization: Token YOUR_TOKEN" \
           "http://localhost:8000/api/articles/?category=1&state=fresh"

   **Example Response:**

   .. code-block:: json

      {
        "count": 100,
        "next": "http://localhost:8000/api/articles/?page=2",
        "previous": null,
        "results": [
          {
            "id": 1,
            "title": "AI Breakthrough in 2026",
            "content": "Article preview content...",
            "url": "https://techcrunch.com/article",
            "source": {
              "id": 1,
              "name": "TechCrunch",
              "slug": "techcrunch"
            },
            "category": {
              "id": 1,
              "name": "Artificial Intelligence",
              "slug": "ai"
            },
            "state": "fresh",
            "view_count": 10,
            "notes_count": 2,
            "created_at": "2026-03-08T00:00:00Z"
          }
        ]
      }

   :status 200: Articles retrieved successfully

Get Article
-----------

.. http:get:: /api/articles/(int:id)/

   Get detailed article information. Automatically increments view count.

   **Example Response:**

   .. code-block:: json

      {
        "id": 1,
        "title": "AI Breakthrough in 2026",
        "content": "Full article content here...",
        "url": "https://techcrunch.com/article",
        "source": {...},
        "category": {...},
        "state": "fresh",
        "view_count": 11,
        "notes_count": 2,
        "created_at": "2026-03-08T00:00:00Z",
        "published_date": "2026-03-07T20:30:00Z"
      }

   :status 200: Article retrieved
   :status 404: Article not found

Get Article Statistics
----------------------

.. http:get:: /api/article-stats/

   Get article statistics (total, fresh, active, archived counts).

   **Example Response:**

   .. code-block:: json

      {
        "total_articles": 500,
        "fresh_count": 50,
        "active_count": 350,
        "archived_count": 100
      }

   :status 200: Statistics retrieved

Category Endpoints
==================

List Categories
---------------

.. http:get:: /api/categories/

   List all categories with article counts.

   **Example Response:**

   .. code-block:: json

      [
        {
          "id": 1,
          "name": "Artificial Intelligence",
          "slug": "ai",
          "description": "AI and machine learning news",
          "article_count": 125
        }
      ]

   :status 200: Categories retrieved

Source Endpoints
================

List Sources
------------

.. http:get:: /api/sources/

   List all news sources with article counts.

   **Example Response:**

   .. code-block:: json

      [
        {
          "id": 1,
          "name": "TechCrunch",
          "slug": "techcrunch",
          "website_url": "https://techcrunch.com",
          "is_active": true,
          "article_count": 250
        }
      ]

   :status 200: Sources retrieved

User Interaction Endpoints
===========================

Create/Get User Article Interaction
------------------------------------

.. http:post:: /api/user-articles/

   Create or update article interaction (bookmark, read, save for later).

   **Request Body:**

   .. code-block:: json

      {
        "article": 1,
        "is_bookmarked": true,
        "is_read": false,
        "saved_for_later": false
      }

   **Response:**

   .. code-block:: json

      {
        "id": 1,
        "article": {...},
        "is_bookmarked": true,
        "is_read": false,
        "saved_for_later": false,
        "bookmarked_at": "2026-03-08T10:30:00Z",
        "read_at": null,
        "saved_at": null
      }

   :status 201: Interaction created
   :status 400: Validation error

List Bookmarked Articles
-------------------------

.. http:get:: /api/user-articles/?is_bookmarked=true

   Get all bookmarked articles for authenticated user.

   :status 200: Bookmarks retrieved

List Read Articles
------------------

.. http:get:: /api/user-articles/?is_read=true

   Get all read articles for authenticated user.

   :status 200: Read articles retrieved

Notes Endpoints
===============

Create Note
-----------

.. http:post:: /api/notes/

   Create a note on an article.

   **Request Body:**

   .. code-block:: json

      {
        "article": 1,
        "content": "Important insights on AI development",
        "followup_date": "2026-03-15",
        "is_reviewed": false,
        "external_link": "https://example.com/reference"
      }

   **Response:**

   .. code-block:: json

      {
        "id": 1,
        "article": 1,
        "content": "Important insights on AI development",
        "followup_date": "2026-03-15",
        "is_reviewed": false,
        "external_link": "https://example.com/reference",
        "created_at": "2026-03-08T10:30:00Z"
      }

   :status 201: Note created
   :status 400: Validation error

List Notes
----------

.. http:get:: /api/notes/

   List all notes for authenticated user.

   **Query Parameters:**

   * ``article_id`` (integer) - Filter notes by article

   :status 200: Notes retrieved

Update Note
-----------

.. http:patch:: /api/notes/(int:id)/

   Update a note.

   **Request Body:**

   .. code-block:: json

      {
        "content": "Updated content",
        "is_reviewed": true
      }

   :status 200: Note updated
   :status 404: Note not found

Delete Note
-----------

.. http:delete:: /api/notes/(int:id)/

   Delete a note.

   :status 204: Note deleted
   :status 404: Note not found

Analytics Endpoints
===================

Reading Overview
----------------

.. http:get:: /api/analytics/overview/

   Get reading statistics overview.

   **Response:**

   .. code-block:: json

      {
        "total_articles_read": 42,
        "total_bookmarks": 15,
        "total_notes": 8,
        "reading_streak": 7,
        "avg_read_per_day": 2.5
      }

   :status 200: Overview retrieved

Reading Trends
--------------

.. http:get:: /api/analytics/trends/

   Get reading trends over time.

   **Response:**

   .. code-block:: json

      {
        "daily_reading": [
          {"date": "2026-03-01", "count": 3},
          {"date": "2026-03-02", "count": 5}
        ],
        "weekly_reading": [
          {"week": "Week 1", "count": 15}
        ]
      }

   :status 200: Trends retrieved

Reading Preferences
-------------------

.. http:get:: /api/analytics/preferences/

   Get category and source preferences.

   **Response:**

   .. code-block:: json

      {
        "favorite_categories": [
          {"name": "AI", "count": 25},
          {"name": "Web Dev", "count": 17}
        ],
        "favorite_sources": [
          {"name": "TechCrunch", "count": 30}
        ]
      }

   :status 200: Preferences retrieved

Error Responses
===============

400 Bad Request
---------------

.. code-block:: json

   {
     "field_name": ["Error message"]
   }

401 Unauthorized
----------------

.. code-block:: json

   {
     "detail": "Authentication credentials were not provided."
   }

404 Not Found
-------------

.. code-block:: json

   {
     "detail": "Not found."
   }

Rate Limiting
=============

API endpoints are rate-limited to prevent abuse:

* **Anonymous users**: 100 requests/hour
* **Authenticated users**: 1000 requests/hour

Rate limit headers included in responses:

.. code-block:: http

   X-RateLimit-Limit: 1000
   X-RateLimit-Remaining: 999
   X-RateLimit-Reset: 1709913600