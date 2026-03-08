# Run all tests for Tech Pulse V2

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running Backend Tests (pytest)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
python -m pytest -v
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend Test Coverage" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
python -m pytest --cov=. --cov-report=term-missing
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running Frontend Tests (Vitest)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Set-Location frontend
npm test -- --run
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend Test Coverage" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
npm run test:coverage
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "All Tests Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
