"""
Tests for Celery background tasks.

Tests article fetching and archiving tasks with mocked commands.
"""

import pytest
from unittest.mock import patch, MagicMock
from articles.tasks import fetch_articles_task, archive_old_articles_task


@pytest.mark.django_db
class TestCeleryTasks:
    """Test Celery tasks."""

    @patch('articles.tasks.call_command')
    def test_fetch_articles_task(self, mock_call_command):
        """Test fetch_articles task."""
        result = fetch_articles_task()
        mock_call_command.assert_called_once_with('fetch_articles')
        assert result['status'] == 'success'
        assert 'Articles fetched successfully' in result['message']

    @patch('articles.tasks.call_command')
    def test_archive_old_articles_task(self, mock_call_command):
        """Test archive_old_articles task."""
        result = archive_old_articles_task()
        mock_call_command.assert_called_once()
        assert result['status'] == 'success'
        assert 'Old articles archived successfully' in result['message']
