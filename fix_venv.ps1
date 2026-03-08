# Fix Virtual Environment - Install Missing Packages
Write-Host "Installing packages in virtual environment..." -ForegroundColor Cyan

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Install packages
pip install celery redis django-celery-beat django-celery-results feedparser

Write-Host "`n✅ Packages installed! Now run: python manage.py runserver" -ForegroundColor Green
