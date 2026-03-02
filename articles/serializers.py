"""
Serializers for articles app.
"""

from rest_framework import serializers
from .models import Category, Source, Article


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    article_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'description',
            'article_count',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_article_count(self, obj):
        """Return count of articles in this category."""
        return obj.articles.count()


class SourceSerializer(serializers.ModelSerializer):
    """Serializer for Source model."""
    
    article_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Source
        fields = [
            'id',
            'name',
            'url',
            'source_type',
            'description',
            'is_active',
            'fetch_interval',
            'last_fetched',
            'article_count',
            'created_at'
        ]
        read_only_fields = ['id', 'last_fetched', 'created_at']
    
    def get_article_count(self, obj):
        """Return count of articles from this source."""
        return obj.articles.count()


class ArticleListSerializer(serializers.ModelSerializer):
    """
    Serializer for Article list view.
    
    Includes nested source and category info.
    Excludes full content for performance.
    """
    
    source = SourceSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id',
            'title',
            'summary',
            'url',
            'author',
            'source',
            'category',
            'image_url',
            'published_at',
            'view_count',
            'bookmark_count'
        ]
        read_only_fields = [
            'id',
            'view_count',
            'bookmark_count',
            'fetched_at',
            'updated_at'
        ]


class ArticleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Article detail view.
    
    Includes full content.
    """
    
    source = SourceSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id',
            'title',
            'content',
            'summary',
            'url',
            'author',
            'source',
            'category',
            'image_url',
            'published_at',
            'fetched_at',
            'updated_at',
            'view_count',
            'bookmark_count'
        ]
        read_only_fields = [
            'id',
            'view_count',
            'bookmark_count',
            'fetched_at',
            'updated_at'
        ]


class ArticleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating articles.
    
    Uses IDs for source and category (not nested objects).
    """
    
    class Meta:
        model = Article
        fields = [
            'title',
            'content',
            'summary',
            'url',
            'author',
            'source',
            'category',
            'image_url',
            'published_at'
        ]