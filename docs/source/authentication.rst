.. _authentication:

==============
Authentication
==============

Tech Pulse v2.0 uses **Django Token Authentication** for API security.

Overview
========

All API endpoints (except registration and login) require authentication using a token-based system.

Authentication Flow
===================

1. **Register** a new account or **Login** with existing credentials
2. Receive an **authentication token**
3. Include the token in the **Authorization header** for all subsequent requests

Registration
============

Create a New Account
--------------------

.. http:post:: /api/users/register/

   Register a new user account.

   **Request:**

   .. sourcecode:: http

      POST /api/users/register/ HTTP/1.1
      Host: localhost:8000
      Content-Type: application/json

      {
        "username": "johndoe",
        "email": "john@example.com",
        "password": "SecurePass123!",
        "password2": "SecurePass123!"
      }

   **Response:**

   .. sourcecode:: http

      HTTP/1.1 201 Created
      Content-Type: application/json

      {
        "user": {
          "id": 1,
          "username": "johndoe",
          "email": "john@example.com"
        },
        "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
      }

   :reqjson string username: Unique username (required)
   :reqjson string email: Valid email address (required)
   :reqjson string password: Password (min 8 characters, required)
   :reqjson string password2: Password confirmation (must match password)

   :resjson object user: User object
   :resjson string token: Authentication token

   :status 201: User created successfully
   :status 400: Validation error (duplicate username, password mismatch, etc.)

Login
=====

Authenticate with Credentials
------------------------------

.. http:post:: /api/users/login/

   Authenticate and receive access token.

   **Request:**

   .. sourcecode:: http

      POST /api/users/login/ HTTP/1.1
      Host: localhost:8000
      Content-Type: application/json

      {
        "username": "johndoe",
        "password": "SecurePass123!"
      }

   **Response:**

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "user": {
          "id": 1,
          "username": "johndoe",
          "email": "john@example.com",
          "bio": "",
          "prefers_dark_mode": false
        },
        "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
      }

   :reqjson string username: Username or email
   :reqjson string password: User password

   :resjson object user: User profile data
   :resjson string token: Authentication token

   :status 200: Login successful
   :status 400: Invalid credentials

Using the Token
===============

Include in Authorization Header
--------------------------------

For all authenticated requests, include the token in the ``Authorization`` header:

.. sourcecode:: http

   GET /api/articles/ HTTP/1.1
   Host: localhost:8000
   Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

Example with curl:

.. code-block:: bash

   curl -H "Authorization: Token YOUR_TOKEN_HERE" \
        http://localhost:8000/api/articles/

Example with JavaScript:

.. code-block:: javascript

   fetch('http://localhost:8000/api/articles/', {
     headers: {
       'Authorization': 'Token YOUR_TOKEN_HERE'
     }
   })

Example with Python requests:

.. code-block:: python

   import requests

   headers = {
       'Authorization': 'Token YOUR_TOKEN_HERE'
   }
   
   response = requests.get(
       'http://localhost:8000/api/articles/',
       headers=headers
   )

User Profile
============

Get Current User Profile
-------------------------

.. http:get:: /api/users/profile/

   Retrieve authenticated user's profile with statistics.

   **Request:**

   .. sourcecode:: http

      GET /api/users/profile/ HTTP/1.1
      Host: localhost:8000
      Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

   **Response:**

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "bio": "Tech enthusiast and early adopter",
        "prefers_dark_mode": true,
        "total_bookmarks": 15,
        "total_notes": 8,
        "total_read": 42,
        "pending_followups": 3,
        "followup_breakdown": {
          "overdue": 1,
          "due_today": 1,
          "upcoming": 1
        }
      }

   :status 200: Profile retrieved
   :status 401: Unauthorized (missing or invalid token)

Update User Profile
-------------------

.. http:patch:: /api/users/profile/

   Update user profile information.

   **Request:**

   .. sourcecode:: http

      PATCH /api/users/profile/ HTTP/1.1
      Host: localhost:8000
      Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
      Content-Type: application/json

      {
        "bio": "Updated bio text",
        "prefers_dark_mode": false
      }

   **Response:**

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "id": 1,
        "username": "johndoe",
        "bio": "Updated bio text",
        "prefers_dark_mode": false
      }

   :status 200: Profile updated
   :status 400: Validation error

Change Password
===============

.. http:post:: /api/users/change-password/

   Change user password.

   **Request:**

   .. sourcecode:: http

      POST /api/users/change-password/ HTTP/1.1
      Host: localhost:8000
      Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
      Content-Type: application/json

      {
        "old_password": "SecurePass123!",
        "new_password": "NewSecurePass456!",
        "new_password2": "NewSecurePass456!"
      }

   **Response:**

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "detail": "Password updated successfully"
      }

   :status 200: Password changed
   :status 400: Validation error (wrong old password, mismatch, etc.)

Logout
======

.. http:post:: /api/users/logout/

   Logout and invalidate token.

   **Request:**

   .. sourcecode:: http

      POST /api/users/logout/ HTTP/1.1
      Host: localhost:8000
      Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

   **Response:**

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
        "detail": "Successfully logged out"
      }

   :status 200: Logout successful

Error Handling
==============

401 Unauthorized
----------------

Returned when:

* No ``Authorization`` header provided
* Invalid or expired token
* Token format incorrect

**Response:**

.. sourcecode:: http

   HTTP/1.1 401 Unauthorized
   Content-Type: application/json

   {
     "detail": "Authentication credentials were not provided."
   }

**Solution:** Include valid token in Authorization header

403 Forbidden
-------------

Returned when authenticated user lacks permission.

**Response:**

.. sourcecode:: http

   HTTP/1.1 403 Forbidden
   Content-Type: application/json

   {
     "detail": "You do not have permission to perform this action."
   }

Security Best Practices
=======================

1. **Store Tokens Securely**
   
   * Use HttpOnly cookies or secure localStorage
   * Never expose tokens in URLs
   * Clear tokens on logout

2. **HTTPS Only in Production**
   
   * Always use HTTPS to prevent token interception
   * Never send tokens over HTTP

3. **Token Rotation**
   
   * Generate new token on password change
   * Implement token expiration (optional)

4. **Rate Limiting**
   
   * Limit login attempts
   * Implement throttling for API endpoints

Frontend Integration
====================

React Example
-------------

.. code-block:: javascript

   // Store token after login
   const login = async (username, password) => {
     const response = await fetch('/api/users/login/', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password })
     });
     
     const data = await response.json();
     localStorage.setItem('token', data.token);
     return data.user;
   };

   // Use token for authenticated requests
   const getArticles = async () => {
     const token = localStorage.getItem('token');
     const response = await fetch('/api/articles/', {
       headers: {
         'Authorization': `Token ${token}`
       }
     });
     
     return response.json();
   };

   // Logout
   const logout = async () => {
     const token = localStorage.getItem('token');
     await fetch('/api/users/logout/', {
       method: 'POST',
       headers: {
         'Authorization': `Token ${token}`
       }
     });
     
     localStorage.removeItem('token');
   };

Next Steps
==========

* :ref:`api-endpoints` - Explore available API endpoints
* :ref:`models-reference` - Understanding data models
* :ref:`getting-started` - Initial setup guide