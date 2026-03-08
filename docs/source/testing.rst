.. _testing:

=======
Testing
=======

Tech Pulse v2.0 includes comprehensive testing with **100% pass rate** (69/69 tests).

Test Overview
=============

**Backend (pytest + Django):**

* 35 tests across 3 apps
* 76% code coverage
* Models, views, serializers, tasks

**Frontend (Vitest + React Testing Library):**

* 34 tests for components, contexts, pages
* 100% component coverage
* User interaction testing

Backend Testing
===============

Running Tests
-------------

.. code-block:: bash

   # Run all tests
   pytest
   
   # Run with coverage
   pytest --cov
   
   # Run with verbose output
   pytest -v
   
   # Run specific test file
   pytest users/tests/test_views.py
   
   # Run specific test
   pytest users/tests/test_views.py::TestUserRegistration::test_register_user_success

Test Structure
--------------

.. code-block:: text

   tech-pulse-v2/
   ├── conftest.py              # Shared fixtures
   ├── pytest.ini               # Pytest configuration
   ├── users/tests/
   │   ├── test_models.py       # User model tests
   │   └── test_views.py        # Auth API tests
   ├── articles/tests/
   │   ├── test_models.py       # Article/Category/Source tests
   │   ├── test_views.py        # Article API tests
   │   └── test_tasks.py        # Celery task tests
   └── interactions/tests/
       ├── test_models.py       # Interaction model tests
       ├── test_views.py        # Interaction API tests
       └── test_analytics.py    # Analytics endpoint tests

Fixtures
--------

**conftest.py:**

.. code-block:: python

   import pytest
   from django.contrib.auth import get_user_model
   from rest_framework.test import APIClient
   
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

Example Tests
-------------

**Model Test:**

.. code-block:: python

   import pytest
   from articles.models import Article
   
   @pytest.mark.django_db
   class TestArticle:
       def test_article_creation(self, article):
           """Test article is created correctly."""
           assert article.title == 'Test Article'
           assert article.state == 'active'
           assert article.view_count == 0
       
       def test_is_fresh(self, article):
           """Test is_fresh method."""
           assert article.is_fresh() is True

**API Test:**

.. code-block:: python

   import pytest
   from django.urls import reverse
   from rest_framework import status
   
   @pytest.mark.django_db
   class TestArticleAPI:
       def test_list_articles(self, api_client, article):
           """Test listing articles."""
           url = reverse('article-list')
           response = api_client.get(url)
           assert response.status_code == status.HTTP_200_OK
           assert len(response.data['results']) >= 1

Coverage Report
---------------

.. code-block:: bash

   # Generate HTML coverage report
   pytest --cov --cov-report=html
   
   # Open report
   open htmlcov/index.html  # Mac/Linux
   start htmlcov/index.html  # Windows

**Coverage Results:**

* users/models.py: **100%**
* interactions/models.py: **95%**
* articles/models.py: **88%**
* Overall: **76%**

Frontend Testing
================

Running Tests
-------------

.. code-block:: bash

   cd frontend
   
   # Run all tests
   npm test
   
   # Run with UI
   npm run test:ui
   
   # Run with coverage
   npm run test:coverage
   
   # Run in watch mode
   npm run test:watch

Test Structure
--------------

.. code-block:: text

   frontend/src/
   ├── test/
   │   ├── setup.js             # Test configuration
   │   ├── utils.jsx            # Custom render utilities
   │   └── mocks/
   │       └── api.js           # API mocks
   ├── components/__tests__/
   │   ├── LoadingSkeleton.test.jsx
   │   ├── ArticleCard.test.jsx
   │   ├── Navbar.test.jsx
   │   └── NoteForm.test.jsx
   ├── context/__tests__/
   │   ├── AuthContext.test.jsx
   │   └── NotesPanelContext.test.jsx
   └── pages/__tests__/
       ├── HomePage.test.jsx
       ├── DashboardPage.test.jsx
       ├── ProfilePage.test.jsx
       ├── AnalyticsPage.test.jsx
       ├── LoginPage.test.jsx
       └── BookmarksPage.test.jsx

Example Tests
-------------

**Component Test:**

.. code-block:: javascript

   import { describe, it, expect } from 'vitest'
   import { render, screen } from '@testing-library/react'
   import LoadingSkeleton from '../LoadingSkeleton'
   
   describe('LoadingSkeleton', () => {
     it('renders skeleton by default', () => {
       render(<LoadingSkeleton />)
       const skeleton = screen.getByTestId('loading-skeleton')
       expect(skeleton).toBeInTheDocument()
     })
   })

**User Interaction Test:**

.. code-block:: javascript

   import { describe, it, expect } from 'vitest'
   import { screen } from '@testing-library/react'
   import userEvent from '@testing-library/user-event'
   import { renderWithProviders } from '../../test/utils'
   import LoginPage from '../LoginPage'
   
   describe('LoginPage', () => {
     it('allows typing in username field', async () => {
       const user = userEvent.setup()
       renderWithProviders(<LoginPage />)
       
       const usernameInput = screen.getByLabelText(/username/i)
       await user.type(usernameInput, 'testuser')
       
       expect(usernameInput).toHaveValue('testuser')
     })
   })

Run All Tests
=============

PowerShell Script
-----------------

**run_all_tests.ps1:**

.. code-block:: powershell

   Write-Host "Running Backend Tests..." -ForegroundColor Cyan
   pytest -v
   
   Write-Host "`nRunning Frontend Tests..." -ForegroundColor Cyan
   cd frontend
   npm test
   cd ..
   
   Write-Host "`nAll Tests Complete!" -ForegroundColor Green

.. code-block:: bash

   # Run script
   .\run_all_tests.ps1

Test Results
============

Backend: 35/35 (100%)
---------------------

* **users/tests/test_models.py**: 5 tests
* **users/tests/test_views.py**: 8 tests
* **articles/tests/test_models.py**: 9 tests
* **articles/tests/test_views.py**: 8 tests
* **articles/tests/test_tasks.py**: 3 tests
* **interactions/tests/test_models.py**: 8 tests
* **interactions/tests/test_views.py**: 10 tests
* **interactions/tests/test_analytics.py**: 4 tests

Frontend: 34/34 (100%)
----------------------

* **Components**: 15 tests
* **Contexts**: 6 tests
* **Pages**: 13 tests

Continuous Integration
======================

GitHub Actions
--------------

Create ``.github/workflows/tests.yml``:

.. code-block:: yaml

   name: Tests
   
   on: [push, pull_request]
   
   jobs:
     backend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: '3.12'
         - name: Install dependencies
           run: |
             pip install -r requirements.txt
         - name: Run tests
           run: |
             pytest --cov
     
     frontend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Node
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install dependencies
           run: |
             cd frontend
             npm install
         - name: Run tests
           run: |
             cd frontend
             npm test

Best Practices
==============

Test Isolation
--------------

* Each test should be independent
* Use fixtures to create test data
* Clean up after tests automatically

Naming Conventions
------------------

* Test files: ``test_*.py`` or ``*.test.jsx``
* Test classes: ``Test*``
* Test functions: ``test_*``

Coverage Goals
--------------

* **Critical paths**: 100% coverage
* **Overall**: 70%+ coverage
* **New code**: Must include tests

Mocking
-------

**Backend:**

.. code-block:: python

   from unittest.mock import patch, MagicMock
   
   @patch('articles.tasks.call_command')
   def test_fetch_articles_task(mock_call_command):
       result = fetch_articles_task()
       mock_call_command.assert_called_once()

**Frontend:**

.. code-block:: javascript

   vi.mock('../../api/api', () => ({
     getArticles: vi.fn(() => Promise.resolve({ results: [] }))
   }))

Debugging Tests
===============

Backend
-------

.. code-block:: bash

   # Run with print statements
   pytest -s
   
   # Run with debugger
   pytest --pdb
   
   # Run last failed tests
   pytest --lf

Frontend
--------

.. code-block:: bash

   # Debug mode
   npm run test -- --reporter=verbose
   
   # Single test
   npm test -- HomePage.test.jsx

Next Steps
==========

* :ref:`deployment` - Deploy to production
* :ref:`contributing` - Contribution guidelines
* :ref:`api-endpoints` - API reference