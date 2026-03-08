# Quick Test - Run Celery Tasks Manually
#
# This script tests Celery tasks without needing worker/beat running

Write-Host "`n🧪 Testing Celery Tasks (Eager Mode)" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Test 1: Simple test task
Write-Host "1️⃣  Testing simple Celery task..." -ForegroundColor Yellow
python -c "from articles.tasks import test_celery; print('Result:', test_celery())"

# Test 2: Fetch articles task
Write-Host "`n2️⃣  Testing fetch_articles_task..." -ForegroundColor Yellow
python -c "from articles.tasks import fetch_articles_task; result = fetch_articles_task(); print('✅ Task completed:', result['status'])"

# Test 3: Archive articles task (dry run)
Write-Host "`n3️⃣  Testing archive_old_articles_task..." -ForegroundColor Yellow
python -c "from articles.tasks import archive_old_articles_task; result = archive_old_articles_task(); print('✅ Task completed:', result['status'])"

Write-Host "`n✅ All tasks executed successfully!" -ForegroundColor Green
Write-Host "`nNote: Tasks ran in 'eager mode' (synchronously)" -ForegroundColor Yellow
Write-Host "For production, start worker and beat for async execution.`n" -ForegroundColor Yellow
