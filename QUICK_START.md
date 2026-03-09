# Tech Pulse v2.0 - Quick Start Guide

## Prerequisites
- Python 3.12+
- Node.js 18+
- Django 6.0
- React 18

## Get Started in 5 Minutes

### 1. Backend Setup (Django)

```bash
# Navigate to project root
cd tech-pulse-v2

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Add RSS sources
python manage.py add_sources

# Fetch initial articles
python manage.py fetch_articles

# Start Django server
python manage.py runserver
```

Backend running at: **http://localhost:8000**

### 2. Frontend Setup (React)

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend running at: **http://localhost:5173**

### 3. Automated Tasks (Optional - Celery)

**Option A: Manual Mode** (No background tasks)
- Just use the backend and frontend as-is
- Manually run `python manage.py fetch_articles` when needed

**Option B: Automated Mode** (Background tasks)

```bash
# Terminal 3 - Celery Worker
.\start_worker.ps1

# Terminal 4 - Celery Beat
.\start_beat.ps1
```

Now articles fetch automatically every hour! ⏰

---

## Quick Feature Tour

### 1. Home Page (/)
- Browse latest tech articles
- Search and filter by source/category
- Bookmark articles
- Add notes

### 2. Dashboard (/dashboard)
- View statistics
- See follow-ups
- Quick navigation cards
- Reading time summary

### 3. Analytics (/analytics)
- Reading streak tracking
- Time trends chart
- Category preferences
- Source breakdown
- Weekly summary

### 4. Bookmarks (/bookmarks)
- All saved articles
- Filter and search
- Quick access to notes

### 5. Notes (/notes)
- All your notes
- Follow-up tracking
- Filter by status
- External links

### 6. Profile (/profile)
- User statistics
- Change password
- Reading insights

---

## Key Features

### Automatic Content Management
```bash
# Hourly article fetching (automated)
Every hour at minute 0

# Daily article archiving (automated)
Every day at 2:00 AM UTC

# Manual commands (anytime)
python manage.py fetch_articles
python manage.py archive_old_articles --dry-run
```

### User Experience
- Toast notifications for all actions
- Loading skeletons (no blank screens)
- User-friendly error messages
- Fully responsive (mobile/tablet/desktop)
- Dark mode support

### Analytics
- Reading streak gamification
- Interactive charts (Recharts)
- Category & source insights
- Weekly progress tracking
- Trend analysis

---

## Configuration

### Django Settings

**Location**: `config/settings.py`

```python
# Debug mode (set False in production)
DEBUG = True

# Celery settings
CELERY_BROKER_URL = 'memory://'  # Development
# CELERY_BROKER_URL = 'redis://localhost:6379/0'  # Production

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

### Fetch Frequency

**Location**: `articles/models.py` → Source model

```python
fetch_frequency = models.IntegerField(
    default=3600,  # Seconds between fetches (1 hour)
    help_text="Seconds between automatic fetches"
)
```

### Celery Schedules

**Location**: `config/celery.py`

```python
app.conf.beat_schedule = {
    'fetch-articles-every-hour': {
        'task': 'articles.tasks.fetch_articles_task',
        'schedule': crontab(minute=0),  # Every hour
    },
    'archive-old-articles-daily': {
        'task': 'articles.tasks.archive_old_articles_task',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}
```

**Change to every 30 minutes**:
```python
'schedule': crontab(minute='*/30')
```

**Change to every 6 hours**:
```python
'schedule': crontab(minute=0, hour='*/6')
```

---

## 📋 API Endpoints

### Authentication
```
POST   /auth/login/             # Login
POST   /auth/register/          # Register
POST   /auth/logout/            # Logout
GET    /auth/profile/           # User profile
POST   /auth/change-password/   # Change password
```

### Articles
```
GET    /articles/               # List articles
GET    /articles/{id}/          # Article detail
GET    /categories/             # List categories
GET    /sources/                # List sources
```

### Interactions
```
GET    /user-articles/          # User interactions
POST   /user-articles/          # Create/update interaction
GET    /bookmarks/              # Bookmarked articles
GET    /notes/                  # User notes
POST   /notes/                  # Create note
```

### Analytics 🆕
```
GET    /analytics/overview/     # Complete analytics
GET    /analytics/categories/   # Category breakdown
GET    /analytics/sources/      # Source breakdown
```

### Dashboard
```
GET    /dashboard/stats/        # Dashboard statistics
```

---

## 🐛 Troubleshooting

### "No articles showing"
```bash
# Fetch articles manually
python manage.py fetch_articles

# Check if sources exist
python manage.py add_sources
```

### "Toast notifications not working"
- Check browser console for errors
- Verify `react-hot-toast` is installed: `npm list react-hot-toast`

### "Analytics page blank"
- Need some bookmarks first!
- Bookmark a few articles to see data

### "Celery not working"
```bash
# Check if worker is running
# Should see logs in terminal

# Test manually
python -c "from articles.tasks import test_celery; test_celery()"
```

### "Build errors"
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules
npm install

# Clear build cache
npm run build -- --force
```

---

## 📦 Tech Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API
- **Celery 5.6** - Background tasks
- **PostgreSQL/SQLite** - Database
- **Feedparser** - RSS parsing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **React Router 6** - Navigation
- **Axios** - HTTP client

---

## 📚 Documentation Files

- `CELERY_SETUP.md` - Celery configuration guide
- `UX_IMPROVEMENTS_COMPLETE.md` - UX features documentation
- `ANALYTICS_DASHBOARD_COMPLETE.md` - Analytics documentation
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Overall project summary
- `README.md` - This file

---

## 🎓 Next Steps

### 1. Customize Sources
```bash
# Edit articles/management/commands/add_sources.py
# Add your favorite tech news sources
# Run: python manage.py add_sources
```

### 2. Adjust Themes
```javascript
// frontend/tailwind.config.js
colors: {
  primary: colors.blue,  // Change to your brand color
}
```

### 3. Production Deployment
- Set `DEBUG = False`
- Use PostgreSQL
- Set up Redis for Celery
- Configure ALLOWED_HOSTS
- Set up HTTPS
- Use environment variables

### 4. Optional Enhancements
- [ ] Social sharing
- [ ] Email notifications
- [ ] Reading lists
- [ ] Article recommendations
- [ ] Export analytics as PDF

---

## 💡 Pro Tips

### Keyboard Shortcuts (Coming Soon)
- `Ctrl + K` - Quick search
- `B` - Bookmark current article
- `N` - Add note
- `D` - Toggle dark mode

### Performance
```bash
# Build for production
cd frontend
npm run build

# Preview production build
npm run preview
```

### Database Backup
```bash
# Backup SQLite database
cp db.sqlite3 db.sqlite3.backup

# Or use Django command
python manage.py dumpdata > backup.json
```

---

## 🆘 Support

### Getting Help
1. Check documentation files
2. Look at code comments
3. Check Django/React docs
4. Search error messages online

### Common Issues
- **Port already in use**: Change port or kill process
- **CORS errors**: Check CORS_ALLOWED_ORIGINS in settings
- **Token errors**: Clear localStorage and re-login
- **Missing data**: Run migrations and seed commands

---

## 🎉 You're All Set!

Visit **http://localhost:5173** and start exploring!

**Happy Reading! 📚**

---

*Tech Pulse v2.0 - Your Personal Tech News Hub*
