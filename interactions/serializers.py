"""
Serializers for interactions app.
"""

from rest_framework import serializers
from .models import UserArticle, Note, ArticleReference, ReadingHistory
from articles.serializers import ArticleListSerializer


class UserArticleSerializer(serializers.ModelSerializer):
    """Serializer for UserArticle model."""
    
    article = ArticleListSerializer(read_only=True)
    article_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('articles.models', fromlist=['Article']).Article.objects.all(),
        source='article',
        write_only=True
    )
    
    class Meta:
        model = UserArticle
        fields = [
            'id',
            'user',
            'article',
            'article_id',
            'is_read',
            'is_bookmarked',
            'is_saved_for_later',
            'keep_decision',
            'bookmarked_at',
            'read_at',
            'saved_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'user',
            'bookmarked_at',
            'read_at',
            'saved_at',
            'created_at',
            'updated_at'
        ]
    
    def update(self, instance, validated_data):
        """Update timestamps when status changes."""
        from django.utils import timezone
        
        if 'is_bookmarked' in validated_data:
            if validated_data['is_bookmarked']:
                instance.bookmarked_at = timezone.now()
            else:
                instance.bookmarked_at = None
        
        if 'is_read' in validated_data:
            if validated_data['is_read']:
                instance.read_at = timezone.now()
        
        if 'is_saved_for_later' in validated_data:
            if validated_data['is_saved_for_later']:
                instance.saved_at = timezone.now()
            else:
                instance.saved_at = None
        
        return super().update(instance, validated_data)


class NoteSerializer(serializers.ModelSerializer):
    """Serializer for Note model."""
    
    article = ArticleListSerializer(read_only=True)
    article_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('articles.models', fromlist=['Article']).Article.objects.all(),
        source='article',
        write_only=True
    )
    is_pending_followup = serializers.ReadOnlyField()
    
    class Meta:
        model = Note
        fields = [
            'id',
            'user',
            'article',
            'article_id',
            'content',
            'has_follow_up',
            'follow_up_done',
            'follow_up_date',
            'is_pending_followup',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ArticleReferenceSerializer(serializers.ModelSerializer):
    """Serializer for ArticleReference model."""
    
    referenced_article = ArticleListSerializer(read_only=True)
    referenced_article_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('articles.models', fromlist=['Article']).Article.objects.all(),
        source='referenced_article',
        write_only=True
    )
    
    class Meta:
        model = ArticleReference
        fields = [
            'id',
            'source_note',
            'referenced_article',
            'referenced_article_id',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReadingHistorySerializer(serializers.ModelSerializer):
    """Serializer for ReadingHistory model."""
    
    article = ArticleListSerializer(read_only=True)
    article_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('articles.models', fromlist=['Article']).Article.objects.all(),
        source='article',
        write_only=True
    )
    time_spent_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = ReadingHistory
        fields = [
            'id',
            'user',
            'article',
            'article_id',
            'read_at',
            'time_spent',
            'time_spent_formatted'
        ]
        read_only_fields = ['id', 'user', 'read_at']
    
    def get_time_spent_formatted(self, obj):
        """Format time spent in human-readable format."""
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