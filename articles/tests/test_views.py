"""
Tests for article API endpoints.

Tests CRUD operations, filtering, and search functionality.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestArticleAPI:
    """Test Article API endpoints."""

    def test_list_articles(self, api_client, article):
        """Test listing articles."""
        url = reverse('articles:article-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_retrieve_article(self, api_client, article):
        """Test retrieving single article."""
        url = reverse('articles:article-detail', args=[article.id])
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == article.title

    def test_filter_by_category(self, api_client, article, category):
        """Test filtering articles by category."""
        url = reverse('articles:article-list')
        response = api_client.get(url, {'category': category.id})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_search_articles(self, api_client, article):
        """Test searching articles."""
        url = reverse('articles:article-list')
        response = api_client.get(url, {'search': 'Test'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
