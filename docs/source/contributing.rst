.. _contributing:

============
Contributing
============

Thank you for your interest in contributing to Tech Pulse v2.0!

Getting Started
===============

Fork and Clone
--------------

.. code-block:: bash

   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/tech-pulse-v2.git
   cd tech-pulse-v2
   
   # Add upstream remote
   git remote add upstream https://github.com/matandasoftware/tech-pulse-v2.git

Development Setup
-----------------

.. code-block:: bash

   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Install dev dependencies
   pip install pytest pytest-cov black flake8 isort
   
   # Run migrations
   python manage.py migrate
   
   # Create superuser
   python manage.py createsuperuser
   
   # Frontend setup
   cd frontend
   npm install
   cd ..

Development Workflow
====================

Create a Branch
---------------

.. code-block:: bash

   # Update main branch
   git checkout main
   git pull upstream main
   
   # Create feature branch
   git checkout -b feature/your-feature-name
   
   # Or bug fix branch
   git checkout -b fix/bug-description

Make Changes
------------

1. **Write Code**: Follow code style guidelines
2. **Add Tests**: All new features must include tests
3. **Update Docs**: Update documentation for API changes
4. **Test**: Run all tests before committing

Code Style
==========

Backend (Python)
----------------

**PEP 8 Compliance:**

.. code-block:: bash

   # Format code with black
   black .
   
   # Sort imports
   isort .
   
   # Check style
   flake8
   
   # Run all quality checks
   black . && isort . && flake8

**Style Guidelines:**

* Line length: 88 characters (black default)
* Docstrings: Google style
* Imports: stdlib → third-party → local
* Type hints: Use when helpful

**Example:**

.. code-block:: python

   """Module docstring describing purpose."""
   
   from datetime import datetime
   
   from django.db import models
   from rest_framework import serializers
   
   from articles.models import Article
   
   
   class ArticleSerializer(serializers.ModelSerializer):
       """
       Serializer for Article model.
       
       Provides read/write operations for articles with
       nested source and category information.
       """
       
       class Meta:
           model = Article
           fields = ['id', 'title', 'content', 'source']

Frontend (JavaScript/React)
---------------------------

**ESLint Configuration:**

.. code-block:: bash

   # Lint code
   npm run lint
   
   # Fix auto-fixable issues
   npm run lint -- --fix

**Style Guidelines:**

* Use functional components with hooks
* PropTypes or TypeScript for type checking
* Descriptive variable names
* Extract reusable components
* Follow React best practices

**Example:**

.. code-block:: javascript

   import { useState, useEffect } from 'react'
   import PropTypes from 'prop-types'
   
   /**
    * ArticleCard component displays article preview.
    * 
    * @param {Object} article - Article data
    * @param {Function} onBookmark - Bookmark handler
    */
   function ArticleCard({ article, onBookmark }) {
     const [isBookmarked, setIsBookmarked] = useState(false)
     
     // Component logic
     
     return (
       <div className="article-card">
         <h3>{article.title}</h3>
       </div>
     )
   }
   
   ArticleCard.propTypes = {
     article: PropTypes.object.isRequired,
     onBookmark: PropTypes.func
   }

Testing Requirements
====================

Backend Tests
-------------

**All new code must include tests:**

.. code-block:: python

   import pytest
   from django.urls import reverse
   from rest_framework import status
   
   @pytest.mark.django_db
   class TestNewFeature:
       """Test new feature implementation."""
       
       def test_feature_works(self, authenticated_client):
           """Test that feature works correctly."""
           url = reverse('feature-endpoint')
           response = authenticated_client.get(url)
           
           assert response.status_code == status.HTTP_200_OK
           assert 'expected_field' in response.data

**Run tests:**

.. code-block:: bash

   # Run all tests
   pytest
   
   # Run with coverage
   pytest --cov
   
   # Coverage must be ≥ 70%

Frontend Tests
--------------

.. code-block:: javascript

   import { describe, it, expect } from 'vitest'
   import { render, screen } from '@testing-library/react'
   import userEvent from '@testing-library/user-event'
   import NewComponent from '../NewComponent'
   
   describe('NewComponent', () => {
     it('renders correctly', () => {
       render(<NewComponent />)
       expect(screen.getByText('Expected Text')).toBeInTheDocument()
     })
     
     it('handles user interaction', async () => {
       const user = userEvent.setup()
       render(<NewComponent />)
       
       const button = screen.getByRole('button')
       await user.click(button)
       
       expect(screen.getByText('Result')).toBeInTheDocument()
     })
   })

**Run tests:**

.. code-block:: bash

   cd frontend
   npm test

Commit Guidelines
=================

Commit Messages
---------------

Follow conventional commits format:

.. code-block:: text

   <type>(<scope>): <subject>
   
   <body>
   
   <footer>

**Types:**

* ``feat``: New feature
* ``fix``: Bug fix
* ``docs``: Documentation changes
* ``style``: Code style changes (formatting)
* ``refactor``: Code refactoring
* ``test``: Adding/updating tests
* ``chore``: Maintenance tasks

**Examples:**

.. code-block:: bash

   git commit -m "feat(articles): add article search functionality"
   git commit -m "fix(auth): resolve token expiration issue"
   git commit -m "docs(api): update authentication guide"
   git commit -m "test(articles): add tests for article lifecycle"

Pull Request Process
====================

1. Update Your Branch
---------------------

.. code-block:: bash

   # Sync with upstream
   git fetch upstream
   git rebase upstream/main

2. Push Changes
---------------

.. code-block:: bash

   git push origin feature/your-feature-name

3. Create Pull Request
----------------------

On GitHub:

* Click "New Pull Request"
* Select your branch
* Fill out PR template
* Request review

PR Template
-----------

.. code-block:: markdown

   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] All tests pass
   - [ ] Added new tests
   - [ ] Coverage ≥ 70%
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Commented complex code
   - [ ] Updated documentation
   - [ ] No breaking changes

4. Code Review
--------------

* Address reviewer feedback
* Make requested changes
* Push updates to same branch
* PR updates automatically

5. Merge
--------

After approval:

* Squash and merge (preferred)
* Delete feature branch

Issue Reporting
===============

Bug Reports
-----------

Include:

* **Description**: Clear description of the bug
* **Steps to Reproduce**: Numbered steps
* **Expected Behavior**: What should happen
* **Actual Behavior**: What actually happens
* **Environment**: OS, Python version, browser
* **Screenshots**: If applicable

Feature Requests
----------------

Include:

* **Problem**: What problem does this solve?
* **Proposed Solution**: How should it work?
* **Alternatives**: Other approaches considered
* **Additional Context**: Mockups, examples

Documentation
=============

Updating Docs
-------------

.. code-block:: bash

   # Edit .rst files in docs/source/
   vim docs/source/api/index.rst
   
   # Rebuild docs
   cd docs
   python -m sphinx -M html source build
   
   # View changes
   open build/html/index.html

Docstring Format
----------------

Use Google style:

.. code-block:: python

   def fetch_articles(source_id=None, force=False):
       """
       Fetch articles from RSS feeds.
       
       Parses RSS feeds from active sources and creates
       Article objects in the database.
       
       Args:
           source_id (int, optional): Specific source to fetch.
               If None, fetches from all active sources.
           force (bool): Ignore fetch_frequency limits.
       
       Returns:
           dict: Contains 'success' count and 'errors' list.
       
       Raises:
           ValueError: If source_id doesn't exist.
       
       Example:
           >>> fetch_articles(source_id=1, force=True)
           {'success': 10, 'errors': []}
       """
       pass

Community Guidelines
====================

Code of Conduct
---------------

* Be respectful and inclusive
* Welcome newcomers
* Provide constructive feedback
* Focus on what's best for the project

Communication
-------------

* **Issues**: Bug reports and feature requests
* **Discussions**: Questions and ideas
* **Pull Requests**: Code contributions

Recognition
===========

Contributors are recognized in:

* README.md contributors section
* Release notes
* Documentation credits

Thank You!
==========

Your contributions make Tech Pulse better for everyone.

Questions? Open an issue or discussion on GitHub.

Next Steps
==========

* :ref:`getting-started` - Set up development environment
* :ref:`testing` - Learn about testing
* :ref:`api-endpoints` - Understand the API