# conftest.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from articles.models import Category, Source, Article
from interactions.models import UserArticle, Note

User = get_user_model()


@pytest.fixture
def api_client():
    """API client for testing."""
    return APIClient()


@pytest.fixture
def user(db):
    """Create test user."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Authenticated API client."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def category(db):
    """Create test category."""
    return Category.objects.create(
        name='Technology',
        slug='technology',
        description='Tech articles'
    )


@pytest.fixture
def source(db):
    """Create test source."""
    return Source.objects.create(
        name='TechCrunch',
        website_url='https://techcrunch.com',
        rss_feed_url='https://techcrunch.com/feed/',
        is_active=True,
        fetch_frequency=60
    )


@pytest.fixture
def article(db, category, source):
    """Create test article."""
    return Article.objects.create(
        title='Test Article',
        slug='test-article',
        content='This is test content.',
        url='https://example.com/article',
        category=category,
        source=source
    )
