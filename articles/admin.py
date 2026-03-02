"""
Admin configuration for articles app.
"""

from django.contrib import admin
from .models import Category, Source, Article


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""
    
    list_display = ['name', 'created_at', 'article_count']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    
    def article_count(self, obj):
        """Display count of articles in this category."""
        return obj.articles.count()
    
    article_count.short_description = 'Articles'


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    """Admin interface for Source model."""
    
    list_display = [
        'name',
        'source_type',
        'is_active',
        'fetch_interval',
        'last_fetched',
        'article_count'
    ]
    
    list_filter = ['source_type', 'is_active']
    search_fields = ['name', 'url', 'description']
    readonly_fields = ['created_at', 'last_fetched']
    
    fieldsets = [
        ('Basic Information', {
            'fields': ('name', 'url', 'source_type', 'description')
        }),
        ('Fetch Configuration', {
            'fields': ('is_active', 'fetch_interval', 'last_fetched')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    ]
    
    def article_count(self, obj):
        """Display count of articles from this source."""
        return obj.articles.count()
    
    article_count.short_description = 'Articles'


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    """Admin interface for Article model."""
    
    list_display = [
        'title_truncated',
        'source',
        'category',
        'author',
        'published_at',
        'view_count',
        'bookmark_count'
    ]
    
    list_filter = [
        'category',
        'source',
        'published_at',
        'fetched_at'
    ]
    
    search_fields = [
        'title',
        'content',
        'summary',
        'author'
    ]
    
    readonly_fields = [
        'view_count',
        'bookmark_count',
        'fetched_at',
        'updated_at'
    ]
    
    fieldsets = [
        ('Content', {
            'fields': ('title', 'content', 'summary', 'author')
        }),
        ('Metadata', {
            'fields': ('url', 'image_url', 'source', 'category')
        }),
        ('Timestamps', {
            'fields': ('published_at', 'fetched_at', 'updated_at')
        }),
        ('Engagement', {
            'fields': ('view_count', 'bookmark_count')
        }),
    ]
    
    date_hierarchy = 'published_at'
    
    def title_truncated(self, obj):
        """Display truncated title."""
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    
    title_truncated.short_description = 'Title'