# Test Quick Reference

## Running Tests

### Backend Tests
```bash
python -m pytest -v                              # All tests
python -m pytest --cov=. --cov-report=html      # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test                                         # Watch mode
npm test -- --run                                # Run once
npm run test:coverage                            # Coverage report
npm run test:ui                                  # UI dashboard
```

### Both
```powershell
.\run_all_tests.ps1                              # Run all tests
```

## Test Organization

### Backend (35 tests, 76% coverage)
- users: 7 tests
- articles: 14 tests  
- interactions: 14 tests

### Frontend (34 tests)
- Context: 6 tests
- Components: 15 tests
- Pages: 13 tests

## Common Issues

### Backend Test Failures
```bash
# Clear cache and rerun
python -m pytest --cache-clear

# Check migrations
python manage.py makemigrations --check
```

### Frontend Test Failures
```bash
# Clear node modules
cd frontend
rm -rf node_modules
npm install
npm test
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt
cd frontend && npm install
```
