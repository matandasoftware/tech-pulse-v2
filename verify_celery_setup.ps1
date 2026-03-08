# Celery Setup Verification Script
#
# This script checks if all components needed for Celery are properly installed
# and configured.

Write-Host "`n🔍 Tech Pulse - Celery Setup Verification" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$allGood = $true

# Check 1: Python packages
Write-Host "📦 Checking Python packages..." -ForegroundColor Yellow
$packages = @("celery", "redis", "django-celery-beat")
foreach ($package in $packages) {
    $installed = pip show $package 2>$null
    if ($installed) {
        Write-Host "  ✅ $package is installed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $package is NOT installed" -ForegroundColor Red
        $allGood = $false
    }
}

# Check 2: Redis server
Write-Host "`n🔴 Checking Redis server..." -ForegroundColor Yellow
try {
    $redisTest = redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "  ✅ Redis is running" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Redis is not responding" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "  ❌ Redis is not installed or not in PATH" -ForegroundColor Red
    Write-Host "     Download from: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
    $allGood = $false
}

# Check 3: Django migrations
Write-Host "`n🗄️  Checking Django migrations..." -ForegroundColor Yellow
$migrationCheck = python manage.py showmigrations django_celery_beat --plan 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ django-celery-beat migrations are up to date" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Run: python manage.py migrate django_celery_beat" -ForegroundColor Yellow
}

# Check 4: Config files exist
Write-Host "`n📄 Checking configuration files..." -ForegroundColor Yellow
$files = @(
    "config/celery.py",
    "config/__init__.py",
    "articles/tasks.py"
)
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file is missing" -ForegroundColor Red
        $allGood = $false
    }
}

# Check 5: Settings configuration
Write-Host "`n⚙️  Checking Django settings..." -ForegroundColor Yellow
$settingsContent = Get-Content config/settings.py -Raw
if ($settingsContent -match "CELERY_BROKER_URL") {
    Write-Host "  ✅ Celery broker URL is configured" -ForegroundColor Green
} else {
    Write-Host "  ❌ Celery configuration missing in settings.py" -ForegroundColor Red
    $allGood = $false
}

if ($settingsContent -match "django_celery_beat") {
    Write-Host "  ✅ django-celery-beat is in INSTALLED_APPS" -ForegroundColor Green
} else {
    Write-Host "  ❌ django-celery-beat not in INSTALLED_APPS" -ForegroundColor Red
    $allGood = $false
}

# Final verdict
Write-Host "`n" -NoNewline
if ($allGood) {
    Write-Host "🎉 SUCCESS! All components are ready!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Start Redis:  redis-server" -ForegroundColor White
    Write-Host "  2. Start Worker: .\start_worker.ps1" -ForegroundColor White
    Write-Host "  3. Start Beat:   .\start_beat.ps1" -ForegroundColor White
    Write-Host "  4. Start Django: python manage.py runserver" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues found. Please fix them before continuing." -ForegroundColor Yellow
    Write-Host "`nSee CELERY_SETUP.md for detailed instructions." -ForegroundColor Cyan
}
Write-Host ""
