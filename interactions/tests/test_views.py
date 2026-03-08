"""
Tests for interaction API endpoints.

Tests bookmark and note CRUD operations.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from interactions.models import UserArticle


@pytest.mark.django_db
class TestBookmarkAPI:
    """Test bookmark functionality."""

    def test_bookmark_article(self, authenticated_client, article, user):
        """Test bookmarking an article."""
        url = reverse('interactions:user-article-list')
        data = {
            'article_id': article.id,
            'is_bookmarked': True
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert UserArticle.objects.filter(
            user=user,
            article=article,
            is_bookmarked=True
        ).exists()

    def test_list_bookmarked_articles(self, authenticated_client, user, article):
        """Test listing bookmarked articles."""
        UserArticle.objects.create(
            user=user,
            article=article,
            is_bookmarked=True
        )
        url = reverse('interactions:user-article-list')
        response = authenticated_client.get(url, {'is_bookmarked': 'true'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


@pytest.mark.django_db
class TestNoteAPI:
    """Test note functionality."""

    def test_create_note(self, authenticated_client, article):
        """Test creating a note."""
        url = reverse('interactions:note-list')
        data = {
            'article_id': article.id,
            'content': 'Interesting article!'
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_list_notes(self, authenticated_client, user, article):
        """Test listing notes."""
        from interactions.models import Note
        Note.objects.create(
            user=user,
            article=article,
            content='Test note'
        )
        url = reverse('interactions:note-list')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
