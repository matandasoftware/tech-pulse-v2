"""
Tests for Article, Category, and Source models.

Tests article lifecycle, state transitions, and age calculations.
"""

import pytest
from datetime import timedelta
from django.utils import timezone
from articles.models import Article, Category, Source


@pytest.mark.django_db
class TestArticle:
    """Test Article model."""

    def test_article_creation(self, article):
        """Test article creation."""
        assert article.title == 'Test Article'
        assert article.state == 'fresh'
        assert article.view_count == 0

    def test_article_str(self, article):
        """Test article string representation."""
        assert str(article) == 'Test Article'

    def test_is_fresh(self, article):
        """Test is_fresh method."""
        assert article.is_fresh() is True

    def test_is_archived(self, article):
        """Test is_archived method."""
        assert article.is_archived() is False

    def test_age_in_days(self, article):
        """Test age_in_days method."""
        assert article.age_in_days() == 0

    def test_article_becomes_archived(self, article):
        """Test article archival after 30 days."""
        article.published_at = timezone.now() - timedelta(days=31)
        article.save()
        assert article.age_in_days() == 31


@pytest.mark.django_db
class TestCategory:
    """Test Category model."""

    def test_category_creation(self, category):
        """Test category creation."""
        assert category.name == 'Technology'
        assert category.slug == 'technology'

    def test_category_str(self, category):
        """Test category string representation."""
        assert str(category) == 'Technology'


@pytest.mark.django_db
class TestSource:
    """Test Source model."""

    def test_source_creation(self, source):
        """Test source creation."""
        assert source.name == 'TechCrunch'
        assert source.is_active is True

    def test_source_str(self, source):
        """Test source string representation."""
        assert str(source) == 'TechCrunch'
