"""
Article models for Tech Pulse v2.0.

This module contains models for managing news articles, their sources,
and categorization system.
"""

from django.db import models
from django.utils import timezone


class Category(models.Model):
    """
    Article category for classification and filtering.
    
    Categories group articles by topic (e.g., AI, Technology, Science).
    Used for filtering, recommendations, and user preferences.
    
    Attributes:
        name (CharField): Category name (unique)
        description (TextField): Detailed category description
        created_at (DateTimeField): Category creation timestamp
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Category name (e.g., 'Artificial Intelligence')"
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
