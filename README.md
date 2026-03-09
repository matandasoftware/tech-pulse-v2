# Tech Pulse v2.0

> A modern, full-stack news aggregation platform for tech enthusiasts, powered by Django REST Framework and React.

Tech Pulse is an intelligent news aggregation platform that automatically fetches, categorizes, and delivers the latest tech news from multiple sources. Built with a Django backend and React frontend, it features user personalization, bookmarking, note-taking, analytics, and automated content management.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running with Docker](#running-with-docker)
  - [Running Locally](#running-locally)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 User Management
- **User Authentication**: Token-based authentication with Django REST Framework
- **Custom User Profiles**: Extended user model with bio, theme preferences, and notifications
- **Category Preferences**: Save favorite categories for personalized content
- **Dark/Light Mode**: Theme switching support

### 📰 Content Aggregation
- **Automated RSS Fetching**: Hourly background tasks fetch articles from configured sources
- **Multi-Source Support**: Aggregate content from TechCrunch, The Verge, Wired, and more
- **Smart Categorization**: AI, Technology, Science, Cybersecurity, and custom categories
- **Article Management**: Full CRUD operations for articles and sources

### 🎯 User Interactions
- **Bookmarking**: Save articles for later reading
- **Read Tracking**: Mark articles as read with timestamps
- **Note-Taking**: Add personal notes and highlights to articles
- **Save for Later**: Queue articles for future reading
- **Keep/Delete Decisions**: User-driven content curation

### 📊 Analytics Dashboard
- **Reading Statistics**: Track total articles read, bookmarks, and notes
- **Category Insights**: Visualize reading patterns by category
- **Time-Based Analytics**: See reading trends over time
- **Engagement Metrics**: Monitor your interaction with content

### ⚡ Advanced Features
- **Real-time Updates**: Live feed updates as new articles arrive
- **Search & Filtering**: Advanced filtering by category, source, date, and keywords
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Performance Optimized**: Lazy loading, pagination, and caching
- **Background Tasks**: Celery-powered async job processing
- **Automated Archiving**: Clean up old, unread articles automatically

---

## 🛠 Tech Stack

### Backend
- **Framework**: Django 5.0
- **API**: Django REST Framework 3.15
- **Database**: PostgreSQL 15 (Production), SQLite (Development)
- **Authentication**: Token Authentication (Django REST Framework)
- **Task Queue**: Celery 5.6 with Redis
- **Scheduler**: Celery Beat for periodic tasks
- **API Utilities**: django-filter, django-cors-headers

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Charts**: Recharts
- **UI Components**: Heroicons
- **Notifications**: React Hot Toast
- **Testing**: Vitest, React Testing Library

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Gunicorn (Production)
- **Reverse Proxy**: Nginx (Optional)
- **Message Broker**: Redis 7
- **Version Control**: Git

### Testing & Quality
- **Backend Testing**: pytest, pytest-django, pytest-cov, factory_boy, faker
- **Frontend Testing**: Vitest, React Testing Library
- **Code Quality**: Black, Flake8, isort, ESLint
- **Documentation**: Sphinx, sphinx-rtd-theme

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Tech Pulse v2.0                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────────────────────┐
│              │         │                                  │
│   React      │ ◄─────► │   Django REST API                │
│   Frontend   │  HTTP   │                                  │
│   (Vite)     │         │   • Articles API                 │
│              │         │   • Users API                    │
└──────────────┘         │   • Interactions API             │
                         │   • Analytics API                │
                         │                                  │
                         └──────────────────────────────────┘
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                    ┌────▼────┐  ┌───▼───┐  ┌────▼────┐
                    │         │  │       │  │         │
                    │  Redis  │  │ Celery│  │  Postgres│
                    │ (Broker)│  │Workers│  │ Database │
                    │         │  │       │  │         │
                    └─────────┘  └───┬───┘  └─────────┘
                                     │
                                ┌────▼────┐
                                │         │
                                │ Celery  │
                                │  Beat   │
                                │ (Cron)  │
                                └─────────┘
```

### Key Components

1. **Frontend (React + Vite)**
   - Single-page application with React Router
   - Component-based architecture
   - Context API for state management (Auth, NotesPanel)
   - Axios for API communication

2. **Backend (Django REST Framework)**
   - RESTful API design
   - Token-based authentication
   - Three main apps: `articles`, `users`, `interactions`
   - Custom serializers and viewsets

3. **Background Workers (Celery)**
   - **Celery Worker**: Processes async tasks
   - **Celery Beat**: Schedules periodic tasks (hourly fetch, daily archiving)
   - **Redis**: Message broker and result backend

4. **Database (PostgreSQL)**
   - Primary data store for users, articles, interactions
   - Optimized with indexes for performance
   - Supports full-text search

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (Recommended) OR
- **Python 3.12+** and **Node.js 18+**
- **PostgreSQL 15+** (for local development without Docker)
- **Redis 7+** (for Celery)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/matandasoftware/tech-pulse-v2.git
cd tech-pulse-v2
```

#### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
POSTGRES_DB=techpulse
POSTGRES_USER=techpulseuser
POSTGRES_PASSWORD=your-password-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

### Running with Docker

**The easiest way to run Tech Pulse is with Docker Compose:**

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services will be available at:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Admin Panel: `http://localhost:8000/admin`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

**Create superuser:**

```bash
docker-compose exec web python manage.py createsuperuser
```

**Run migrations:**

```bash
docker-compose exec web python manage.py migrate
```

**Fetch initial articles:**

```bash
docker-compose exec web python manage.py fetch_articles
```

---

### Running Locally

#### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Run development server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

#### Start Celery Workers (Separate Terminals)

```bash
# Terminal 1: Celery Worker
celery -A config worker -l info --pool=solo

# Terminal 2: Celery Beat
celery -A config beat -l info

# Terminal 3: Redis (if not using Docker)
redis-server
```

---

## 📡 API Documentation

### Authentication

All authenticated endpoints require a token in the header:

```
Authorization: Token <your-token-here>
```

### Endpoints

#### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/token/` - Login and get token
- `POST /api/auth/logout/` - Logout (invalidate token)
- `GET /api/auth/profile/` - Get current user profile
- `PATCH /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password

#### Articles
- `GET /api/articles/` - List all articles (paginated, filterable)
- `GET /api/articles/{id}/` - Get article details
- `POST /api/articles/` - Create article (admin only)
- `PATCH /api/articles/{id}/` - Update article (admin only)
- `DELETE /api/articles/{id}/` - Delete article (admin only)

#### Categories
- `GET /api/categories/` - List all categories
- `GET /api/categories/{id}/` - Get category details
- `POST /api/categories/` - Create category (admin only)

#### Sources
- `GET /api/sources/` - List all sources
- `GET /api/sources/{id}/` - Get source details
- `POST /api/sources/` - Create source (admin only)

#### Interactions
- `GET /api/user-articles/` - Get user's article interactions
- `POST /api/user-articles/bookmark/` - Bookmark/unbookmark article
- `POST /api/user-articles/read/` - Mark article as read
- `POST /api/user-articles/save-later/` - Save article for later

#### Notes
- `GET /api/notes/` - Get user's notes
- `POST /api/notes/` - Create note
- `PATCH /api/notes/{id}/` - Update note
- `DELETE /api/notes/{id}/` - Delete note

#### Analytics
- `GET /api/analytics/` - Get user analytics and statistics

**Query Parameters for Articles:**
- `category` - Filter by category slug
- `source` - Filter by source ID
- `is_bookmarked` - Filter bookmarked articles
- `is_read` - Filter read articles
- `search` - Full-text search
- `ordering` - Sort by field (e.g., `-published_at`)
- `page` - Page number
- `page_size` - Results per page

---

## 📂 Project Structure

```
tech-pulse-v2/
├── config/                      # Django project settings
│   ├── settings.py              # Main settings file
│   ├── urls.py                  # Root URL configuration
│   ├── celery.py                # Celery configuration
│   ├── wsgi.py                  # WSGI entry point
│   └── asgi.py                  # ASGI entry point
│
├── articles/                    # Articles app
│   ├── models.py                # Article, Category, Source models
│   ├── views.py                 # API views
│   ├── serializers.py           # DRF serializers
│   ├── urls.py                  # Article URL routes
│   ├── tasks.py                 # Celery background tasks
│   ├── management/
│   │   └── commands/
│   │       ├── fetch_articles.py     # RSS fetch command
│   │       └── archive_old_articles.py
│   └── tests/                   # Article tests
│
├── users/                       # Users app
│   ├── models.py                # CustomUser model
│   ├── views.py                 # Auth views
│   ├── serializers.py           # User serializers
│   ├── urls.py                  # User URL routes
│   └── tests/                   # User tests
│
├── interactions/                # User interactions app
│   ├── models.py                # UserArticle, Note models
│   ├── views.py                 # Interaction views
│   ├── serializers.py           # Interaction serializers
│   ├── urls.py                  # Interaction URL routes
│   └── tests/                   # Interaction tests
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ArticleCard.jsx
│   │   │   ├── ArticlesFeed.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoteForm.jsx
│   │   │   ├── NotesPanel.jsx
│   │   │   └── __tests__/       # Component tests
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BookmarksPage.jsx
│   │   │   ├── NotesPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── context/             # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotesPanelContext.jsx
│   │   ├── api/                 # API client
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main App component
│   │   └── main.jsx             # Entry point
│   ├── package.json             # NPM dependencies
│   └── vite.config.js           # Vite configuration
│
├── staticfiles/                 # Collected static files
├── media/                       # User-uploaded files
├── docs/                        # Sphinx documentation
├── nginx/                       # Nginx configuration
│
├── docker-compose.yml           # Docker Compose config
├── Dockerfile                   # Docker image definition
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
├── manage.py                    # Django management script
├── pytest.ini                   # Pytest configuration
├── conftest.py                  # Pytest fixtures
└── README.md                    # This file
```

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific app tests
pytest articles/tests/
pytest users/tests/
pytest interactions/tests/

# Generate HTML coverage report
pytest --cov --cov-report=html
```

**Test coverage includes:**
- Model tests (factories with Faker)
- API endpoint tests
- Serializer validation tests
- Authentication tests
- Celery task tests

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test coverage includes:**
- Component rendering tests
- User interaction tests
- Context provider tests
- API integration tests

---

## 🚢 Deployment

### Docker Production Deployment

1. **Update environment variables** for production in `.env`
2. **Build production images:**

```bash
docker-compose -f docker-compose.prod.yml build
```

3. **Run migrations:**

```bash
docker-compose -f docker-compose.prod.yml run web python manage.py migrate
```

4. **Collect static files:**

```bash
docker-compose -f docker-compose.prod.yml run web python manage.py collectstatic --noinput
```

5. **Start services:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

**Backend (Django):**

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DEBUG=False
export SECRET_KEY='your-production-secret'
export DATABASE_URL='postgresql://user:pass@localhost/db'

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

**Frontend (React):**

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx or any static file server
```

**Background Workers:**

```bash
# Start Celery worker
celery -A config worker -l info

# Start Celery beat
celery -A config beat -l info
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Code Style

- **Backend**: Follow PEP 8, use Black for formatting, isort for imports
- **Frontend**: Follow ESLint rules, use Prettier for formatting
- **Commit messages**: Use conventional commits format

### Running Quality Checks

```bash
# Backend
black .
isort .
flake8

# Frontend
cd frontend
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- RSS feeds provided by TechCrunch, The Verge, Wired, Ars Technica
- Icons by [Heroicons](https://heroicons.com/)
- UI components inspired by [Tailwind UI](https://tailwindui.com/)

---

## 📞 Support

For issues, questions, or suggestions:
- **Issues**: [GitHub Issues](https://github.com/matandasoftware/tech-pulse-v2/issues)
- **Email**: pfarelochannel@gmail.com
- **Developer**: Pfarelo Channel Mudau
- **GitHub**: [@matandasoftware](https://github.com/matandasoftware)
- **Portfolio**: [MyCv](https://github.com/matandasoftware/MyCv)

---

**Built with ❤️ by Pfarelo Channel Mudau**
