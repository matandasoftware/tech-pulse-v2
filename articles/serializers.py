"""
Serializers for articles app.

Converts Django models to/from JSON for API responses.
"""

from rest_framework import serializers

from .models import Article, Bookmark, Category, Source


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""

    # Computed field showing how many articles belong to this category
    article_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "article_count", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_article_count(self, obj):
        """Return count of articles in this category."""
        return obj.articles.count()


class SourceSerializer(serializers.ModelSerializer):
    """Serializer for Source model."""

    # Computed field showing how many articles are from this source
    article_count = serializers.SerializerMethodField()

    class Meta:
        model = Source
        fields = [
            "id",
            "name",
            "website_url",
            "rss_feed_url",
            "is_active",
            "fetch_frequency",
            "last_fetched",
            "article_count",
            "created_at",
        ]
        read_only_fields = ["id", "last_fetched", "created_at"]

    def get_article_count(self, obj):
        """Return count of articles from this source."""
        return obj.articles.count()

    def get_is_bookmarked(self, obj):
        """Check if current user has bookmarked this article."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            # Uses related_name from Bookmark model
            return obj.bookmarked_by.filter(user=request.user).exists()
        return False


class ArticleListSerializer(serializers.ModelSerializer):
    """
    Serializer for article list view.
    Includes related source and category data.
    Shows is_bookmarked status for authenticated users.
    """

    source = SourceSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "summary",
            "url",
            "image_url",
            "author",
            "published_at",
            "source",
            "category",
            "view_count",
            "bookmark_count",
            "is_bookmarked",
            "state",
            "archived_at",
        ]
        read_only_fields = [
            "id",
            "view_count",
            "bookmark_count",
            "published_at",
            "state",
            "archived_at",
        ]

    def get_is_bookmarked(self, obj):
        """
        Check if current user has bookmarked this article.
        Returns False for anonymous users.
        """
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        # Check UserArticle model instead of old Bookmark model
        from interactions.models import UserArticle

        return UserArticle.objects.filter(
            user=request.user, article=obj, is_bookmarked=True
        ).exists()


class ArticleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for article detail view.
    Includes all article data with related objects.
    Shows is_bookmarked status for authenticated users.
    """

    source = SourceSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "content",
            "summary",
            "url",
            "image_url",
            "author",
            "published_at",
            "source",
            "category",
            "view_count",
            "bookmark_count",
            "is_bookmarked",
            "state",
            "archived_at",
        ]
        read_only_fields = [
            "id",
            "view_count",
            "bookmark_count",
            "published_at",
            "state",
            "archived_at",
        ]

    def get_is_bookmarked(self, obj):
        """
        Check if current user has bookmarked this article.
        Returns False for anonymous users.
        """
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        # Check UserArticle model instead of old Bookmark model
        from interactions.models import UserArticle

        return UserArticle.objects.filter(
            user=request.user, article=obj, is_bookmarked=True
        ).exists()


class ArticleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating articles - uses IDs instead of nested objects."""

    class Meta:
        model = Article
        fields = [
            "title",
            "content",
            "summary",
            "url",
            "author",
            "source",  # Accepts source ID, not full object
            "category",  # Accepts category ID, not full object
            "image_url",
            "published_at",
        ]


class BookmarkSerializer(serializers.ModelSerializer):
    """Handles bookmark creation and retrieval."""

    # For GET requests - returns full article details
    article = ArticleListSerializer(read_only=True)

    # For POST requests - accepts just the article ID
    # Lighter payload: {"article_id": 5} instead of entire article object
    article_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Bookmark
        fields = ["id", "article", "article_id", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        """Override create to automatically add authenticated user."""
        # User comes from JWT token, not request body (prevents bookmark spoofing)
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
