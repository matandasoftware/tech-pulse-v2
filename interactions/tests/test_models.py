"""
Tests for UserArticle and Note models.

Tests bookmarking and note-taking functionality.
"""

import pytest
from interactions.models import UserArticle, Note


@pytest.mark.django_db
class TestUserArticle:
    """Test UserArticle model."""

    def test_bookmark_article(self, user, article):
        """Test bookmarking an article."""
        user_article = UserArticle.objects.create(
            user=user,
            article=article,
            is_bookmarked=True
        )
        assert user_article.is_bookmarked is True
        assert user_article.user == user
        assert user_article.article == article


@pytest.mark.django_db
class TestNote:
    """Test Note model."""

    def test_create_note(self, user, article):
        """Test creating a note."""
        note = Note.objects.create(
            user=user,
            article=article,
            content='Great article!',
            is_reviewed=False
        )
        assert note.content == 'Great article!'
        assert note.is_reviewed is False

    def test_note_str(self, user, article):
        """Test note string representation."""
        note = Note.objects.create(
            user=user,
            article=article,
            content='Test note'
        )
        assert 'note by testuser' in str(note).lower()
