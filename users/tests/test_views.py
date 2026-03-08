"""
Tests for user authentication and profile views.

Tests registration, login, and profile management endpoints.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestUserRegistration:
    """Test user registration endpoint."""

    def test_register_user_success(self, api_client):
        """Test successful user registration."""
        url = reverse('users:register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strongpass123',
            'password_confirm': 'strongpass123'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'token' in response.data

    def test_register_password_mismatch(self, api_client):
        """Test registration with mismatched passwords."""
        url = reverse('users:register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'pass123',
            'password_confirm': 'different'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Test user login endpoint."""

    def test_login_success(self, api_client, user):
        """Test successful login."""
        url = reverse('users:login')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data

    def test_login_invalid_credentials(self, api_client, user):
        """Test login with invalid credentials."""
        url = reverse('users:login')
        data = {
            'username': 'testuser',
            'password': 'wrongpass'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserProfile:
    """Test user profile endpoints."""

    def test_get_profile(self, authenticated_client, user):
        """Test retrieving user profile."""
        url = reverse('users:profile')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == user.username

    def test_update_profile(self, authenticated_client, user):
        """Test updating user profile."""
        url = reverse('users:profile')
        data = {'bio': 'Updated bio'}
        response = authenticated_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.bio == 'Updated bio'
