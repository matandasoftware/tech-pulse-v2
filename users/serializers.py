"""
Serializers for users app.
"""

from datetime import date

from django.contrib.auth.password_validation import validate_password
from django.db import models
from rest_framework import serializers

from interactions.models import Note, ReadingHistory, UserArticle

from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for CustomUser model.

    Used for user profile display and updates.
    """

    total_bookmarks = serializers.ReadOnlyField()
    total_read = serializers.ReadOnlyField()
    total_notes = serializers.ReadOnlyField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "dark_mode",
            "email_notifications",
            "preferred_categories",
            "total_bookmarks",
            "total_read",
            "total_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    Includes password confirmation and validation.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop("password_confirm")

        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.

    Excludes sensitive fields like password.
    """

    class Meta:
        model = CustomUser
        fields = [
            "first_name",
            "last_name",
            "bio",
            "dark_mode",
            "email_notifications",
            "preferred_categories",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile with statistics.
    """

    # Statistics
    total_bookmarks = serializers.SerializerMethodField()
    total_notes = serializers.SerializerMethodField()
    total_articles_read = serializers.SerializerMethodField()
    total_reading_time = serializers.SerializerMethodField()
    pending_followups = serializers.SerializerMethodField()
    overdue_followups = serializers.SerializerMethodField()
    due_today_followups = serializers.SerializerMethodField()
    upcoming_followups = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "dark_mode",
            "email_notifications",
            "created_at",
            "total_bookmarks",
            "total_notes",
            "total_articles_read",
            "total_reading_time",
            "pending_followups",
            "overdue_followups",
            "due_today_followups",
            "upcoming_followups",
        ]
        read_only_fields = ["id", "username", "created_at"]

    def get_total_bookmarks(self, obj):
        """Get count of bookmarked articles."""
        return UserArticle.objects.filter(user=obj, is_bookmarked=True).count()

    def get_total_notes(self, obj):
        """Get count of notes."""
        return Note.objects.filter(user=obj).count()

    def get_total_articles_read(self, obj):
        """Get count of articles marked as read."""
        return UserArticle.objects.filter(user=obj, is_read=True).count()

    def get_total_reading_time(self, obj):
        """Get total time spent reading in seconds."""
        total = ReadingHistory.objects.filter(user=obj).aggregate(
            total=models.Sum("time_spent")
        )["total"]
        return total or 0

    def get_pending_followups(self, obj):
        """Get count of notes with pending follow-ups (total)."""
        return Note.objects.filter(
            user=obj, has_follow_up=True, follow_up_done=False
        ).count()

    def get_overdue_followups(self, obj):
        """Get count of overdue follow-ups (past the due date)."""
        today = date.today()
        return Note.objects.filter(
            user=obj, has_follow_up=True, follow_up_done=False, follow_up_date__lt=today
        ).count()

    def get_due_today_followups(self, obj):
        """Get count of follow-ups due today."""
        today = date.today()
        return Note.objects.filter(
            user=obj, has_follow_up=True, follow_up_done=False, follow_up_date=today
        ).count()

    def get_upcoming_followups(self, obj):
        """Get count of upcoming follow-ups (future dates)."""
        today = date.today()
        return Note.objects.filter(
            user=obj, has_follow_up=True, follow_up_done=False, follow_up_date__gt=today
        ).count()


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """Validate passwords match."""
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        if len(attrs["new_password"]) < 8:
            raise serializers.ValidationError(
                {"new_password": "Password must be at least 8 characters."}
            )

        return attrs
