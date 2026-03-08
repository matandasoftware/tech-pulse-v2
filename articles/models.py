"""
Article models for Tech Pulse v2.0.

This module contains models for managing news articles, their sources,
and categorization system.
"""

from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Category(models.Model):
    """
    Article category for classification and filtering.
    
    Categories group articles by topic (e.g., AI, Technology, Science).
    Used for filtering, recommendations, and user preferences.
    
    Attributes:
        name (CharField): Category name (unique)
        slug (SlugField): URL-friendly version of name
        description (TextField): Detailed category description
        created_at (DateTimeField): Category creation timestamp
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Category name (e.g., 'Artificial Intelligence')"
    )
    
    slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        help_text="URL-friendly version of name"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Detailed description of what this category covers"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when category was created"
    )
    
    class Meta:
        """Meta options for Category model."""
        
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        """
        Return string representation of category.
        
        Returns:
            str: Category name
        """
        return self.name


class Source(models.Model):
    """
    News source configuration.

    Stores source information and RSS feed URL for automatic fetching.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Source name (e.g., TechCrunch, The Verge)"
    )

    website_url = models.URLField(
        help_text="Main website URL"
    )

    rss_feed_url = models.URLField(
        blank=True,
        null=True,
        help_text="RSS feed URL for automatic article fetching"
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Whether to fetch articles from this source"
    )

    fetch_frequency = models.IntegerField(
        default=60,
        help_text="How often to fetch (in minutes)"
    )

    last_fetched = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last time articles were fetched from this source"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when source was added"
    )

    class Meta:
        """Meta options for Source model."""
        ordering = ['name']

    def __str__(self):
        """Return source name."""
        return self.name

    def should_fetch(self):
        """
        Determine if it's time to fetch new articles from this source.

        Returns:
            bool: True if source should be fetched now
        """
        if not self.is_active or not self.rss_feed_url:
            return False

        if not self.last_fetched:
            return True

        time_since_fetch = timezone.now() - self.last_fetched
        return time_since_fetch.total_seconds() >= (self.fetch_frequency * 60)

    def fetch_articles(self):
        """
        Fetch articles from RSS feed and create Article objects.

        Returns:
            tuple: (articles_created_count, articles_updated_count, error_message)
        """
        import feedparser
        from datetime import datetime

        if not self.rss_feed_url:
            return 0, 0, "No RSS feed URL configured"

        try:
            # Parse the RSS feed
            feed = feedparser.parse(self.rss_feed_url)

            if feed.bozo:
                # Feed has errors
                error_msg = f"Feed parsing error: {feed.bozo_exception}"
                return 0, 0, error_msg

            created_count = 0
            updated_count = 0

            # Process each entry in the feed
            for entry in feed.entries:
                # Extract article data
                title = entry.get('title', 'No Title')
                url = entry.get('link', '')
                summary = entry.get('summary', entry.get('description', ''))
                author = entry.get('author', '')

                # Get published date
                published_at = None
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_at = datetime(*entry.published_parsed[:6])
                elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                    published_at = datetime(*entry.updated_parsed[:6])

                # Get image URL
                image_url = ''
                if hasattr(entry, 'media_content') and entry.media_content:
                    image_url = entry.media_content[0].get('url', '')
                elif hasattr(entry, 'links'):
                    for link in entry.links:
                        if link.get('type', '').startswith('image/'):
                            image_url = link.get('href', '')
                            break

                # Skip if no URL
                if not url:
                    continue

                # Create or update article
                article, created = Article.objects.update_or_create(
                    url=url,
                    defaults={
                        'title': title[:500],  # Truncate to max length
                        'summary': summary,
                        'content': summary,  # Use summary as content for now
                        'author': author[:200] if author else '',
                        'source': self,
                        'image_url': image_url,
                        'published_at': published_at or timezone.now(),
                    }
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

            # Update source fetch timestamp
            self.last_fetched = timezone.now()
            self.save()

            return created_count, updated_count, None

        except Exception as e:
            error_msg = f"Error fetching articles: {str(e)}"
            return 0, 0, error_msg


class Article(models.Model):
    """
    News article with content, metadata, and engagement tracking.

    Represents individual news articles fetched from RSS sources.
    Tracks views, bookmarks, and relationships to sources/categories.

    Article Lifecycle States:
        - fresh: New articles (0-7 days old)
        - active: Recent but not new (7-30 days old)
        - archived: Old and unread (30+ days old)

    Attributes:
        title (CharField): Article headline
        slug (SlugField): URL-friendly version of title
        content (TextField): Full article content
        summary (TextField): Short summary/excerpt
        url (URLField): Original article URL (unique)
        author (CharField): Article author name
        source (ForeignKey): RSS source this article came from
        category (ForeignKey): Article category (nullable)
        image_url (URLField): Featured image URL
        published_at (DateTimeField): Original publication date
        fetched_at (DateTimeField): When we fetched this article
        updated_at (DateTimeField): Last update timestamp
        state (CharField): Article lifecycle state
        archived_at (DateTimeField): When article was archived
        view_count (IntegerField): Number of views
        bookmark_count (IntegerField): Number of bookmarks
    """

    STATE_CHOICES = [
        ('fresh', 'Fresh (0-7 days)'),
        ('active', 'Active (7-30 days)'),
        ('archived', 'Archived (30+ days)'),
    ]

    title = models.CharField(
        max_length=500,
        help_text="Article headline"
    )

    slug = models.SlugField(
        max_length=500,
        unique=True,
        blank=True,
        help_text="URL-friendly version of title"
    )

    content = models.TextField(
        help_text="Full article content"
    )

    summary = models.TextField(
        blank=True,
        help_text="Short summary or excerpt"
    )

    url = models.URLField(
        unique=True,
        max_length=1000,
        help_text="Original article URL (must be unique)"
    )

    author = models.CharField(
        max_length=200,
        blank=True,
        help_text="Article author name"
    )
    
    source = models.ForeignKey(
        Source,
        on_delete=models.CASCADE,
        related_name='articles',
        help_text="RSS source this article came from"
    )
    
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='articles',
        help_text="Article category (optional)"
    )
    
    image_url = models.URLField(
        max_length=1000,
        blank=True,
        help_text="Featured image URL"
    )

    published_at = models.DateTimeField(
        default=timezone.now,
        help_text="Original publication date"
    )

    fetched_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when article was fetched"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of last update"
    )

    state = models.CharField(
        max_length=20,
        choices=STATE_CHOICES,
        default='fresh',
        help_text="Article lifecycle state"
    )

    archived_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when article was archived"
    )

    view_count = models.IntegerField(
        default=0,
        help_text="Number of times article was viewed"
    )

    bookmark_count = models.IntegerField(
        default=0,
        help_text="Number of users who bookmarked this article"
    )

    class Meta:
        """Meta options for Article model."""

        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['category']),
            models.Index(fields=['source']),
            models.Index(fields=['state']),
            models.Index(fields=['published_at', 'state']),
        ]
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from title if not provided."""
        if not self.slug:
            base_slug = slugify(self.title)[:450]  # Leave room for uniqueness suffix
            slug = base_slug
            counter = 1
            while Article.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Auto-update state based on age
        self.update_state()

        super().save(*args, **kwargs)

    def update_state(self):
        """Update article state based on age and engagement."""
        from datetime import timedelta

        # Don't change state if bookmarked or read by anyone
        if self.bookmark_count > 0:
            return

        age = timezone.now() - self.published_at

        if age.days < 7:
            self.state = 'fresh'
        elif age.days < 30:
            self.state = 'active'
        else:
            self.state = 'archived'
            if not self.archived_at:
                self.archived_at = timezone.now()

    def is_fresh(self):
        """Check if article is fresh (0-7 days old)."""
        return self.state == 'fresh'

    def is_archived(self):
        """Check if article is archived."""
        return self.state == 'archived'

    def age_in_days(self):
        """Get article age in days."""
        return (timezone.now() - self.published_at).days

    def __str__(self):
        """
        Return string representation of article.
        
        Returns:
            str: Article title
        """
        return self.title
    
    def increment_views(self):
        """
        Increment article view count by 1.
        
        Called when user opens article. Updates only view_count field
        for performance (avoids updating all fields).
        """
        self.view_count += 1
        self.save(update_fields=['view_count'])

class Bookmark(models.Model):
    """Links users to articles they want to save for later reading.
    
    Ensures each user can only bookmark an article once using unique_together.
    Bookmarks are ordered by creation date (newest first).
    """
    
    user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='bookmarks',  # Enables: user.bookmarks.all()
        help_text="User who created this bookmark"
    )
    
    article = models.ForeignKey(
        'Article',
        on_delete=models.CASCADE,
        related_name='bookmarked_by',  # Enables: article.bookmarked_by.count()
        help_text="Article being bookmarked"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When bookmark was created"
    )

    class Meta:
        # Prevents duplicate bookmarks at database level (better than app-level checks for race conditions)
        unique_together = ('user', 'article')
        
        ordering = ['-created_at']
        
        # Optimizes common query: user.bookmarks.all().order_by('-created_at')
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} → {self.article.title}"