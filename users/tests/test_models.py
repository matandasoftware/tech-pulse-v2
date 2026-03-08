"""
Tests for CustomUser model.

Tests user creation, superuser creation, and string representation.
"""

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestCustomUser:
    """Test CustomUser model."""

    def test_create_user(self):
        """Test user creation."""
        user = User.objects.create_user(
            username='john',
            email='john@example.com',
            password='pass123'
        )
        assert user.username == 'john'
        assert user.email == 'john@example.com'
        assert user.check_password('pass123')
        assert not user.is_staff
        assert not user.is_superuser

    def test_create_superuser(self):
        """Test superuser creation."""
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        assert admin.is_staff
        assert admin.is_superuser

    def test_user_str(self):
        """Test user string representation."""
        user = User.objects.create_user(
            username='jane',
            email='jane@example.com',
            password='pass123'
        )
        assert str(user) == 'jane'
