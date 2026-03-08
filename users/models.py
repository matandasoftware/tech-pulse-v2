"""
User models for Tech Pulse v2.0.

This module contains the custom user model with extended functionality
for user preferences, reading history tracking, and theme settings.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    Adds profile information, preferences, and computed properties
    for tracking user engagement with articles.

    Attributes:
        email (EmailField): Unique email address for login
        bio (TextField): User profile description (max 500 chars)
        dark_mode (BooleanField): Theme preference (True=dark, False=light)
        email_notifications (BooleanField): Email notification opt-in
        created_at (DateTimeField): Account creation timestamp
        updated_at (DateTimeField): Last profile update timestamp
        preferred_categories (ManyToManyField): Favorite article categories

    Properties:
        total_bookmarks (int): Count of bookmarked articles
        total_read (int): Count of articles marked as read
        total_notes (int): Count of notes written by user
    """

    email = models.EmailField(
        unique=True, help_text="User's email address, must be unique"
    )

    bio = models.TextField(
        max_length=500, blank=True, help_text="User profile description (optional)"
    )

    dark_mode = models.BooleanField(
        default=False, help_text="User theme preference: True for dark mode"
    )

    email_notifications = models.BooleanField(
        default=True, help_text="Opt-in for email notifications"
    )

    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp when user account was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True, help_text="Timestamp when user profile was last updated"
    )

    preferred_categories = models.ManyToManyField(
        "articles.Category",
        related_name="preferred_by_users",
        blank=True,
        help_text="User's favorite article categories for recommendations",
    )

    class Meta:
        """Meta options for CustomUser model."""

        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        """
        Return string representation of user.

        Returns:
            str: Username of the user
        """
        return self.username

    @property
    def total_bookmarks(self):
        """
        Count of articles bookmarked by this user.

        Returns:
            int: Number of bookmarked articles
        """
        return self.article_interactions.filter(is_bookmarked=True).count()

    @property
    def total_read(self):
        """
        Count of articles marked as read by this user.

        Returns:
            int: Number of read articles
        """
        return self.article_interactions.filter(is_read=True).count()

    @property
    def total_notes(self):
        """
        Count of notes written by this user.

        Returns:
            int: Number of notes
        """
        return self.notes.count()
