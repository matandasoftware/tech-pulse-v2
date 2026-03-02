"""
Admin configuration for interactions app.
"""

from django.contrib import admin
from .models import UserArticle, Note, ArticleReference, ReadingHistory


@admin.register(UserArticle)
class UserArticleAdmin(admin.ModelAdmin):
    """Admin interface for UserArticle model."""
    
    list_display = [
        'user',
        'article_truncated',
        'is_read',
        'is_bookmarked',
        'is_saved_for_later',
        'keep_decision',
        'updated_at'
    ]
    
    list_filter = [
        'is_read',
        'is_bookmarked',
        'is_saved_for_later',
        'keep_decision',
        'updated_at'
    ]
    
    search_fields = [
        'user__username',
        'article__title'
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'bookmarked_at',
        'read_at',
        'saved_at'
    ]
    
    fieldsets = [
        ('Relationship', {
            'fields': ('user', 'article')
        }),
        ('Interaction Status', {
            'fields': (
                'is_read',
                'is_bookmarked',
                'is_saved_for_later',
                'keep_decision'
            )
        }),
        ('Timestamps', {
            'fields': (
                'bookmarked_at',
                'read_at',
                'saved_at',
                'created_at',
                'updated_at'
            )
        }),
    ]
    
    def article_truncated(self, obj):
        """Display truncated article title."""
        return obj.article.title[:40] + '...' if len(obj.article.title) > 40 else obj.article.title
    
    article_truncated.short_description = 'Article'


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    """Admin interface for Note model."""
    
    list_display = [
        'user',
        'article_truncated',
        'content_preview',
        'has_follow_up',
        'follow_up_done',
        'follow_up_status',
        'created_at'
    ]
    
    list_filter = [
        'has_follow_up',
        'follow_up_done',
        'created_at'
    ]
    
    search_fields = [
        'user__username',
        'article__title',
        'content'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = [
        ('Relationship', {
            'fields': ('user', 'article')
        }),
        ('Note Content', {
            'fields': ('content',)
        }),
        ('Follow-up Tracking', {
            'fields': (
                'has_follow_up',
                'follow_up_done',
                'follow_up_date'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    ]
    
    def article_truncated(self, obj):
        """Display truncated article title."""
        return obj.article.title[:30] + '...' if len(obj.article.title) > 30 else obj.article.title
    
    article_truncated.short_description = 'Article'
    
    def content_preview(self, obj):
        """Display first 50 characters of note."""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    content_preview.short_description = 'Content'
    
    def follow_up_status(self, obj):
        """Display follow-up status with icon."""
        if not obj.has_follow_up:
            return '—'
        elif obj.follow_up_done:
            return '✅ Done'
        else:
            return '⏳ Pending'
    
    follow_up_status.short_description = 'Status'


@admin.register(ArticleReference)
class ArticleReferenceAdmin(admin.ModelAdmin):
    """Admin interface for ArticleReference model."""
    
    list_display = [
        'source_note_info',
        'referenced_article_truncated',
        'created_at'
    ]
    
    search_fields = [
        'source_note__content',
        'referenced_article__title'
    ]
    
    readonly_fields = ['created_at']
    
    def source_note_info(self, obj):
        """Display source note info."""
        return f"{obj.source_note.user.username} - Note #{obj.source_note.id}"
    
    source_note_info.short_description = 'Source Note'
    
    def referenced_article_truncated(self, obj):
        """Display truncated referenced article title."""
        title = obj.referenced_article.title
        return title[:40] + '...' if len(title) > 40 else title
    
    referenced_article_truncated.short_description = 'Referenced Article'


@admin.register(ReadingHistory)
class ReadingHistoryAdmin(admin.ModelAdmin):
    """Admin interface for ReadingHistory model."""
    
    list_display = [
        'user',
        'article_truncated',
        'read_at',
        'time_spent_formatted'
    ]
    
    list_filter = [
        'read_at',
        'user'
    ]
    
    search_fields = [
        'user__username',
        'article__title'
    ]
    
    readonly_fields = ['read_at']
    
    date_hierarchy = 'read_at'
    
    def article_truncated(self, obj):
        """Display truncated article title."""
        return obj.article.title[:40] + '...' if len(obj.article.title) > 40 else obj.article.title
    
    article_truncated.short_description = 'Article'
    
    def time_spent_formatted(self, obj):
        """Display time spent in human-readable format."""
        seconds = obj.time_spent
        if seconds < 60:
            return f"{seconds}s"
        elif seconds < 3600:
            minutes = seconds // 60
            return f"{minutes}m {seconds % 60}s"
        else:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            return f"{hours}h {minutes}m"
    
    time_spent_formatted.short_description = 'Time Spent'