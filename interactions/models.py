"""
Interaction models for Tech Pulse v2.0.

This module contains models for tracking user interactions with articles:
bookmarks, read status, notes, article references, and reading history.
"""

from django.conf import settings
from django.db import models


class UserArticle(models.Model):
    """
    Track user interactions with individual articles.
    
    Stores bookmarks, read status, save-for-later, and keep/delete decisions.
    One row per user-article combination (enforced by unique_together).
    
    Attributes:
        user (ForeignKey): User who interacted with article
        article (ForeignKey): Article that was interacted with
        is_read (BooleanField): Whether user marked as read
        is_bookmarked (BooleanField): Whether user bookmarked
        is_saved_for_later (BooleanField): Whether user saved for later
        keep_decision (CharField): User's keep/delete decision
        bookmarked_at (DateTimeField): Bookmark timestamp (nullable)
        read_at (DateTimeField): Read timestamp (nullable)
        saved_at (DateTimeField): Save-for-later timestamp (nullable)
        created_at (DateTimeField): Interaction creation timestamp
        updated_at (DateTimeField): Last update timestamp
    """
    
    DECISION_CHOICES = [
        ('undecided', 'Undecided'),
        ('keep', 'Keep'),
        ('delete', 'Delete'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='article_interactions',
        help_text="User who interacted with the article"
    )
    
    article = models.ForeignKey(
        'articles.Article',
        on_delete=models.CASCADE,
        related_name='user_interactions',
        help_text="Article that was interacted with"
    )
    
    is_read = models.BooleanField(
        default=False,
        help_text="Whether user marked this article as read"
    )
    
    is_bookmarked = models.BooleanField(
        default=False,
        help_text="Whether user bookmarked this article"
    )
    
    is_saved_for_later = models.BooleanField(
        default=False,
        help_text="Whether user saved this article for later reading"
    )
    
    keep_decision = models.CharField(
        max_length=10,
        choices=DECISION_CHOICES,
        default='undecided',
        help_text="User's decision to keep or delete this article"
    )
    
    bookmarked_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when article was bookmarked"
    )
    
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when article was marked as read"
    )
    
    saved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when article was saved for later"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when interaction was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when interaction was last updated"
    )
    
    class Meta:
        """Meta options for UserArticle model."""
        
        unique_together = ['user', 'article']
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'is_bookmarked']),
            models.Index(fields=['user', 'is_read']),
        ]
    
    def __str__(self):
        """
        Return string representation of user-article interaction.
        
        Returns:
            str: User and article title (truncated to 50 chars)
        """
        return f"{self.user.username} - {self.article.title[:50]}"


class Note(models.Model):
    """
    User note on an article with follow-up tracking.
    
    Allows users to write notes on articles and mark notes that
    require follow-up action. Tracks completion status.
    
    Attributes:
        user (ForeignKey): User who wrote the note
        article (ForeignKey): Article the note is about
        content (TextField): Note content
        has_follow_up (BooleanField): Whether note requires follow-up
        follow_up_done (BooleanField): Whether follow-up is completed
        follow_up_date (DateTimeField): Optional follow-up deadline
        created_at (DateTimeField): Note creation timestamp
        updated_at (DateTimeField): Last update timestamp
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notes',
        help_text="User who wrote this note"
    )
    
    article = models.ForeignKey(
        'articles.Article',
        on_delete=models.CASCADE,
        related_name='notes',
        help_text="Article this note is about"
    )
    
    content = models.TextField(
        help_text="Note content"
    )
    
    has_follow_up = models.BooleanField(
        default=False,
        help_text="Whether this note requires follow-up action"
    )
    
    follow_up_done = models.BooleanField(
        default=False,
        help_text="Whether follow-up action has been completed"
    )
    
    follow_up_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Optional deadline for follow-up action"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when note was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when note was last updated"
    )
    
    class Meta:
        """Meta options for Note model."""
        
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'article']),
            models.Index(fields=['has_follow_up', 'follow_up_done']),
        ]
    
    def __str__(self):
        """
        Return string representation of note.
        
        Returns:
            str: User and article title (truncated to 30 chars)
        """
        return f"Note by {self.user.username} on {self.article.title[:30]}"
    
    @property
    def is_pending_followup(self):
        """
        Check if follow-up is pending.
        
        Returns:
            bool: True if follow-up needed and not done, False otherwise
        """
        return self.has_follow_up and not self.follow_up_done


class ArticleReference(models.Model):
    """
    Link between a note and a referenced article.
    
    Allows notes to reference other articles, creating connections
    between related content. Enables "See also" functionality.
    
    Attributes:
        source_note (ForeignKey): Note containing the reference
        referenced_article (ForeignKey): Article being referenced
        created_at (DateTimeField): Reference creation timestamp
    """
    
    source_note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='references',
        help_text="Note that contains this reference"
    )
    
    referenced_article = models.ForeignKey(
        'articles.Article',
        on_delete=models.CASCADE,
        related_name='referenced_in_notes',
        help_text="Article being referenced"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when reference was created"
    )
    
    class Meta:
        """Meta options for ArticleReference model."""
        
        unique_together = ['source_note', 'referenced_article']
        ordering = ['-created_at']
    
    def __str__(self):
        """
        Return string representation of article reference.
        
        Returns:
            str: Source note ID and referenced article ID
        """
        return (
            f"Reference from note {self.source_note.id} "
            f"to article {self.referenced_article.id}"
        )


class ReadingHistory(models.Model):
    """
    Track user reading patterns for personalized recommendations.
    
    Records when users read articles and how long they spent reading.
    Used to analyze interests and generate recommendations.
    
    Attributes:
        user (ForeignKey): User who read the article
        article (ForeignKey): Article that was read
        read_at (DateTimeField): When article was opened
        time_spent (IntegerField): Seconds spent reading
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reading_history',
        help_text="User who read the article"
    )
    
    article = models.ForeignKey(
        'articles.Article',
        on_delete=models.CASCADE,
        related_name='read_by',
        help_text="Article that was read"
    )
    
    read_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when article was opened"
    )
    
    time_spent = models.IntegerField(
        default=0,
        help_text="Time spent reading in seconds"
    )
    
    class Meta:
        """Meta options for ReadingHistory model."""
        
        verbose_name_plural = 'Reading histories'
        ordering = ['-read_at']
        indexes = [
            models.Index(fields=['user', '-read_at']),
        ]
    
    def __str__(self):
        """
        Return string representation of reading history entry.
        
        Returns:
            str: User, article title (truncated), and timestamp
        """
        return (
            f"{self.user.username} read "
            f"{self.article.title[:30]} at {self.read_at}"
        )