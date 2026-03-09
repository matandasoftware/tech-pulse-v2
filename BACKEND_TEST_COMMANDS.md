# Backend Test Commands

## Navigate to Project Root
```powershell
cd ..
# Or
Set-Location C:\Users\pfare\Projects\tech-pulse-v2
```

## Activate Virtual Environment
```powershell
# Should already be active, but if not:
.\venv\Scripts\Activate.ps1
# You should see (venv) in your prompt
```

## Run All Backend Tests

### 1. Basic Test Run (Quick)
```bash
python -m pytest
```
Expected output: `35 passed`

### 2. Verbose Output (Detailed)
```bash
python -m pytest -v
```
Shows each test name and result

### 3. With Coverage Report (Recommended)
```bash
python -m pytest --cov=. --cov-report=term-missing
```
Expected: 76% coverage with detailed line numbers

### 4. Generate HTML Coverage Report
```bash
python -m pytest --cov=. --cov-report=html
```
Then open: `htmlcov/index.html` in your browser

### 5. Run Specific App Tests
```bash
# Users app only
python -m pytest users/tests/ -v

# Articles app only
python -m pytest articles/tests/ -v

# Interactions app only
python -m pytest interactions/tests/ -v
```

### 6. Run Specific Test File
```bash
# Example: Test models
python -m pytest users/tests/test_models.py -v

# Example: Test analytics
python -m pytest interactions/tests/test_analytics.py -v
```

### 7. Run Specific Test Function
```bash
python -m pytest users/tests/test_models.py::UserModelTest::test_create_user -v
```

### 8. Show Test Duration (Performance)
```bash
python -m pytest --durations=10
```
Shows slowest 10 tests

### 9. Stop on First Failure
```bash
python -m pytest -x
```
Useful for debugging

### 10. Parallel Execution (Faster)
```bash
# If you have pytest-xdist installed
python -m pytest -n auto
```

## Expected Results

### All Tests Pass
```
================================ test session starts =================================
platform win32 -- Python 3.x.x, pytest-9.0.2, pluggy-1.x.x
django: version: 5.x.x, settings: tech_pulse.settings
rootdir: C:\Users\pfare\Projects\tech-pulse-v2
plugins: django-4.12.0, cov-7.0.0
collected 35 items

users\tests\test_models.py ...                                              [  8%]
users\tests\test_views.py ....                                              [ 20%]
articles\tests\test_models.py ....                                          [ 31%]
articles\tests\test_views.py ....                                           [ 42%]
articles\tests\test_tasks.py ..                                             [ 48%]
interactions\tests\test_models.py ...                                       [ 57%]
interactions\tests\test_views.py ....                                       [ 68%]
interactions\tests\test_analytics.py ....                                   [100%]

================================= 35 passed in 2.50s =================================
```

### Coverage Report
```
Name                                    Stmts   Miss  Cover   Missing
---------------------------------------------------------------------
users/models.py                            25      2    92%   15-16
users/views.py                             45      8    82%   ...
articles/models.py                         40      3    92%   ...
articles/views.py                          65     15    77%   ...
interactions/models.py                     50      5    90%   ...
interactions/views.py                      80     20    75%   ...
---------------------------------------------------------------------
TOTAL                                     450    108    76%
```

## Troubleshooting

### If Tests Fail
1. Check database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. Ensure dependencies installed:
   ```bash
   pip install -r requirements.txt
   ```

3. Check Django settings:
   ```bash
   python manage.py check
   ```

### If Coverage is Low
- This is normal for first run
- 76% is good coverage for core functionality
- Can improve by adding edge case tests later

### If Import Errors
```bash
# Reinstall test dependencies
pip install pytest pytest-django pytest-cov factory-boy freezegun
```

## Quick Test Checklist

Run these 3 commands to confirm everything works:

```bash
# 1. Basic test run
python -m pytest

# 2. Verbose with coverage
python -m pytest -v --cov=. --cov-report=term-missing

# 3. Generate HTML report
python -m pytest --cov=. --cov-report=html
```

If all tests pass (35 passed), the test suite is working correctly.
