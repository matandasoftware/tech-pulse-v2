"""
Serializers for interactions app.
"""

from rest_framework import serializers

from articles.serializers import ArticleListSerializer

from .models import ArticleReference, Note, ReadingHistory, UserArticle


class UserArticleSerializer(serializers.ModelSerializer):
    """
    Serializer for UserArticle model.
    Handles user interactions with articles (bookmarks, read status, etc.)
    """

    # Nested article data for reading
    article = ArticleListSerializer(read_only=True)

    # Article ID for writing (creating/updating)
    article_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = UserArticle
        fields = [
            "id",
            "user",
            "article",
            "article_id",
            "is_read",
            "is_bookmarked",
            "is_saved_for_later",
            "keep_decision",
            "bookmarked_at",
            "read_at",
            "saved_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "bookmarked_at",
            "read_at",
            "saved_at",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        """
        Create or update UserArticle record.
        Uses get_or_create to avoid duplicates.
        Automatically manages timestamps based on boolean flags.
        """
        from django.utils import timezone

        # Extract article_id
        article_id = validated_data.pop("article_id", None)

        # If article field was provided instead of article_id
        if not article_id and "article" in validated_data:
            article_id = validated_data.pop("article").id

        if not article_id:
            raise serializers.ValidationError({"article": "Article ID is required"})

        # Get user from context
        user = validated_data.get("user")
        if not user:
            raise serializers.ValidationError({"user": "User is required"})

        # Get or create UserArticle
        user_article, created = UserArticle.objects.get_or_create(
            user=user,
            article_id=article_id,
            defaults={},  # Don't set defaults, we'll update below
        )

        # Update all fields from validated_data
        for key, value in validated_data.items():
            setattr(user_article, key, value)

        # Automatically manage timestamps based on boolean flags
        if user_article.is_bookmarked:
            if not user_article.bookmarked_at:
                user_article.bookmarked_at = timezone.now()
        else:
            user_article.bookmarked_at = None

        if user_article.is_read:
            if not user_article.read_at:
                user_article.read_at = timezone.now()
        else:
            user_article.read_at = None

        if user_article.is_saved_for_later:
            if not user_article.saved_at:
                user_article.saved_at = timezone.now()
        else:
            user_article.saved_at = None

        user_article.save()

        return user_article

    def update(self, instance, validated_data):
        """
        Update UserArticle and automatically manage timestamps.
        Ensures timestamps are consistent with boolean flags.
        """
        from django.utils import timezone

        # Update fields
        for key, value in validated_data.items():
            setattr(instance, key, value)

        # Automatically manage timestamps based on boolean flags
        if instance.is_bookmarked:
            if not instance.bookmarked_at:
                instance.bookmarked_at = timezone.now()
        else:
            instance.bookmarked_at = None

        if instance.is_read:
            if not instance.read_at:
                instance.read_at = timezone.now()
        else:
            instance.read_at = None

        if instance.is_saved_for_later:
            if not instance.saved_at:
                instance.saved_at = timezone.now()
        else:
            instance.saved_at = None

        instance.save()
        return instance


class NoteSerializer(serializers.ModelSerializer):
    """Serializer for Note model."""

    article = ArticleListSerializer(read_only=True)
    article_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__(
            "articles.models", fromlist=["Article"]
        ).Article.objects.all(),
        source="article",
        write_only=True,
    )
    is_pending_followup = serializers.ReadOnlyField()

    class Meta:
        model = Note
        fields = [
            "id",
            "user",
            "article",
            "article_id",
            "content",
            "has_follow_up",
            "follow_up_done",
            "follow_up_date",
            "is_pending_followup",
            "is_reviewed",
            "external_link",
            "external_links",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
            "is_pending_followup",
        ]


class ArticleReferenceSerializer(serializers.ModelSerializer):
    """Serializer for ArticleReference model."""

    referenced_article = ArticleListSerializer(read_only=True)
    referenced_article_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__(
            "articles.models", fromlist=["Article"]
        ).Article.objects.all(),
        source="referenced_article",
        write_only=True,
    )

    class Meta:
        model = ArticleReference
        fields = [
            "id",
            "source_note",
            "referenced_article",
            "referenced_article_id",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ReadingHistorySerializer(serializers.ModelSerializer):
    """Serializer for ReadingHistory model."""

    article = ArticleListSerializer(read_only=True)
    article_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__(
            "articles.models", fromlist=["Article"]
        ).Article.objects.all(),
        source="article",
        write_only=True,
    )
    time_spent_formatted = serializers.SerializerMethodField()

    class Meta:
        model = ReadingHistory
        fields = [
            "id",
            "user",
            "article",
            "article_id",
            "read_at",
            "time_spent",
            "time_spent_formatted",
        ]
        read_only_fields = ["id", "user", "read_at"]

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
