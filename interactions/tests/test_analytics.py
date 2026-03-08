"""
Tests for analytics API endpoints.

Tests reading overview, category analytics, and source analytics.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestAnalyticsAPI:
    """Test analytics endpoints."""

    def test_reading_overview(self, authenticated_client):
        """Test reading overview endpoint."""
        url = reverse('interactions:analytics-overview')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'overview' in response.data
        assert 'total_articles_read' in response.data['overview']

    def test_category_analytics(self, authenticated_client):
        """Test category analytics endpoint."""
        url = reverse('interactions:category-analytics')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_source_analytics(self, authenticated_client):
        """Test source analytics endpoint."""
        url = reverse('interactions:source-analytics')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
