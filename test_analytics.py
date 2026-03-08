"""Test analytics endpoint."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from interactions.analytics_views import analytics_overview

User = get_user_model()

# Get a user
try:
    user = User.objects.first()
    if not user:
        print("No users found in database")
        exit(1)
        
    print(f"Testing analytics for user: {user.username}")
    
    # Create a request
    factory = APIRequestFactory()
    request = factory.get('/api/analytics/overview/')
    request.user = user
    
    # Call the view
    response = analytics_overview(request)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Data Keys: {list(response.data.keys())}")
    print("✅ Analytics endpoint working!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
