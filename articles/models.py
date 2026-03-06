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
    RSS feed source for article aggregation.
    
    Represents external news sources that provide RSS feeds.
    Tracks fetch status and configuration for each source.
    
    Attributes:
        name (CharField): Source name (e.g., 'TechCrunch')
        slug (SlugField): URL-friendly version of name
        url (URLField): RSS feed URL (unique)
        source_type (CharField): Type of source (RSS, API, manual)
        description (TextField): Source description
        is_active (BooleanField): Whether to fetch from this source
        fetch_interval (IntegerField): Minutes between fetches
        last_fetched (DateTimeField): Last successful fetch timestamp
        created_at (DateTimeField): Source creation timestamp
    """
    
    SOURCE_TYPES = [
        ('rss', 'RSS Feed'),
        ('api', 'API'),
        ('manual', 'Manual Entry'),
    ]
    
    name = models.CharField(
        max_length=200,
        help_text="Name of the news source"
    )
    
    slug = models.SlugField(
        max_length=200,
        unique=True,
        blank=True,
        help_text="URL-friendly version of name"
    )
    
    url = models.URLField(
        unique=True,
        help_text="RSS feed URL or API endpoint"
    )
    
    source_type = models.CharField(
        max_length=10,
        choices=SOURCE_TYPES,
        default='rss',
        help_text="Type of source"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Description of the news source"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether to fetch articles from this source"
    )
    
    fetch_interval = models.IntegerField(
        default=60,
        help_text="Fetch interval in minutes"
    )
    
    last_fetched = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp of last successful fetch"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when source was added"
    )
    
    class Meta:
        """Meta options for Source model."""
        
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        """
        Return string representation of source.
        
        Returns:
            str: Source name
        """
        return self.name


class Article(models.Model):
    """
    News article with content, metadata, and engagement tracking.
    
    Represents individual news articles fetched from RSS sources.
    Tracks views, bookmarks, and relationships to sources/categories.
    
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
        view_count (IntegerField): Number of views
        bookmark_count (IntegerField): Number of bookmarks
    """
    
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
        super().save(*args, **kwargs)
    
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