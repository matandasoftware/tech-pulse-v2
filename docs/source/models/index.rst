.. _models-reference:

===============
Database Models
===============

Tech Pulse v2.0 uses 8 core models organized across 3 Django apps.

Overview
========

**users app:**

* :ref:`model-customuser` - Extended user model with preferences

**articles app:**

* :ref:`model-category` - Article categorization
* :ref:`model-source` - RSS feed sources
* :ref:`model-article` - News articles with lifecycle management

**interactions app:**

* :ref:`model-userarticle` - User-article interactions
* :ref:`model-note` - User notes with follow-ups
* :ref:`model-articlereference` - Note-to-article references
* :ref:`model-readinghistory` - Reading pattern tracking

.. _model-customuser:

CustomUser
==========

Extended Django user model with additional fields.

**Location:** ``users.models.CustomUser``

Fields
------

.. py:class:: CustomUser

   Inherits from ``django.contrib.auth.models.AbstractUser``

   .. py:attribute:: bio
      :type: TextField

      User biography (optional, max 500 characters)

   .. py:attribute:: prefers_dark_mode
      :type: BooleanField

      Dark mode preference (default: False)

   .. py:attribute:: created_at
      :type: DateTimeField

      Account creation timestamp (auto)

   .. py:attribute:: updated_at
      :type: DateTimeField

      Last update timestamp (auto)

Computed Properties
-------------------

.. py:method:: total_bookmarks()

   Returns count of bookmarked articles.

   :rtype: int

.. py:method:: total_notes()

   Returns count of user notes.

   :rtype: int

.. py:method:: total_read()

   Returns count of read articles.

   :rtype: int

Example
-------

.. code-block:: python

   from users.models import CustomUser
   
   user = CustomUser.objects.create_user(
       username='johndoe',
       email='john@example.com',
       password='securepass',
       bio='Tech enthusiast',
       prefers_dark_mode=True
   )
   
   print(user.total_bookmarks)  # 0
   print(user.total_notes)      # 0

.. _model-category:

Category
========

Article categorization system.

**Location:** ``articles.models.Category``

Fields
------

.. py:class:: Category

   .. py:attribute:: name
      :type: CharField

      Category name (max 100 characters, unique)

   .. py:attribute:: slug
      :type: SlugField

      URL-friendly slug (unique, auto-generated)

   .. py:attribute:: description
      :type: TextField

      Category description (optional)

   .. py:attribute:: created_at
      :type: DateTimeField

      Creation timestamp (auto)

Methods
-------

.. py:method:: __str__()

   Returns category name.

   :rtype: str

Example
-------

.. code-block:: python

   from articles.models import Category
   
   category = Category.objects.create(
       name='Artificial Intelligence',
       description='AI and ML news'
   )
   
   print(category.slug)  # 'artificial-intelligence'

.. _model-source:

Source
======

RSS feed source configuration.

**Location:** ``articles.models.Source``

Fields
------

.. py:class:: Source

   .. py:attribute:: name
      :type: CharField

      Source name (max 200 characters)

   .. py:attribute:: slug
      :type: SlugField

      URL slug (unique, auto-generated)

   .. py:attribute:: website_url
      :type: URLField

      Source website URL

   .. py:attribute:: rss_feed_url
      :type: URLField

      RSS feed URL (optional)

   .. py:attribute:: is_active
      :type: BooleanField

      Active status (default: True)

   .. py:attribute:: fetch_frequency
      :type: IntegerField

      Fetch interval in minutes (default: 60)

   .. py:attribute:: last_fetch_at
      :type: DateTimeField

      Last fetch timestamp (nullable)

   .. py:attribute:: last_fetch_status
      :type: CharField

      Last fetch status: 'success', 'error', 'pending'

   .. py:attribute:: last_fetch_error
      :type: TextField

      Last error message (nullable)

Example
-------

.. code-block:: python

   from articles.models import Source
   
   source = Source.objects.create(
       name='TechCrunch',
       website_url='https://techcrunch.com',
       rss_feed_url='https://techcrunch.com/feed/',
       fetch_frequency=60
   )

.. _model-article:

Article
=======

News article with intelligent lifecycle management.

**Location:** ``articles.models.Article``

Fields
------

.. py:class:: Article

   .. py:attribute:: title
      :type: CharField

      Article title (max 500 characters)

   .. py:attribute:: slug
      :type: SlugField

      URL slug (unique, auto-generated)

   .. py:attribute:: content
      :type: TextField

      Full article content

   .. py:attribute:: url
      :type: URLField

      Original article URL

   .. py:attribute:: category
      :type: ForeignKey

      Article category (ForeignKey to Category)

   .. py:attribute:: source
      :type: ForeignKey

      Article source (ForeignKey to Source)

   .. py:attribute:: state
      :type: CharField

      Lifecycle state: 'fresh' (0-7 days), 'active' (7-30 days), 'archived' (30+ days)

   .. py:attribute:: published_date
      :type: DateTimeField

      Original publication date (nullable)

   .. py:attribute:: archived_at
      :type: DateTimeField

      Archival timestamp (nullable)

   .. py:attribute:: view_count
      :type: IntegerField

      View counter (default: 0)

   .. py:attribute:: created_at
      :type: DateTimeField

      Creation timestamp (auto)

Methods
-------

.. py:method:: is_fresh()

   Check if article is fresh (0-7 days old).

   :rtype: bool

.. py:method:: is_archived()

   Check if article is archived.

   :rtype: bool

.. py:method:: age_in_days()

   Get article age in days.

   :rtype: int

Example
-------

.. code-block:: python

   from articles.models import Article
   
   article = Article.objects.get(id=1)
   
   if article.is_fresh():
       print("Fresh content!")
   
   print(f"Age: {article.age_in_days()} days")

.. _model-userarticle:

UserArticle
===========

User interactions with articles (bookmarks, read status, etc.).

**Location:** ``interactions.models.UserArticle``

Fields
------

.. py:class:: UserArticle

   .. py:attribute:: user
      :type: ForeignKey

      User (ForeignKey to CustomUser)

   .. py:attribute:: article
      :type: ForeignKey

      Article (ForeignKey to Article)

   .. py:attribute:: is_bookmarked
      :type: BooleanField

      Bookmark status (default: False)

   .. py:attribute:: is_read
      :type: BooleanField

      Read status (default: False)

   .. py:attribute:: saved_for_later
      :type: BooleanField

      Saved for later status (default: False)

   .. py:attribute:: bookmarked_at
      :type: DateTimeField

      Bookmark timestamp (nullable, auto-set)

   .. py:attribute:: read_at
      :type: DateTimeField

      Read timestamp (nullable, auto-set)

   .. py:attribute:: saved_at
      :type: DateTimeField

      Saved timestamp (nullable, auto-set)

Constraints
-----------

* Unique together: (user, article)

.. _model-note:

Note
====

User notes on articles with follow-up tracking.

**Location:** ``interactions.models.Note``

Fields
------

.. py:class:: Note

   .. py:attribute:: user
      :type: ForeignKey

      Note author (ForeignKey to CustomUser)

   .. py:attribute:: article
      :type: ForeignKey

      Related article (ForeignKey to Article)

   .. py:attribute:: content
      :type: TextField

      Note content

   .. py:attribute:: followup_date
      :type: DateField

      Follow-up reminder date (nullable)

   .. py:attribute:: is_reviewed
      :type: BooleanField

      Review status (default: False)

   .. py:attribute:: external_link
      :type: URLField

      External reference link (nullable)

   .. py:attribute:: created_at
      :type: DateTimeField

      Creation timestamp (auto)

   .. py:attribute:: updated_at
      :type: DateTimeField

      Last update timestamp (auto)

Database Schema
===============

Relationships
-------------

.. code-block:: text

   CustomUser
      ├── UserArticle (user → article interactions)
      ├── Note (user notes)
      └── ReadingHistory (reading patterns)
   
   Category
      └── Article (categorized articles)
   
   Source
      └── Article (sourced articles)
   
   Article
      ├── UserArticle (user interactions)
      ├── Note (user notes)
      ├── ArticleReference (note references)
      └── ReadingHistory (reading tracking)

Indexes
-------

* ``Article.state`` - For lifecycle queries
* ``Article.created_at`` - For date-based ordering
* ``UserArticle (user, article)`` - Unique constraint
* ``Note.followup_date`` - For follow-up queries