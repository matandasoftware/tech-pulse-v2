"""Quick test of analytics endpoint."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from interactions.analytics_views import analytics_overview

User = get_user_model()

try:
    user = User.objects.first()
    print(f"Testing analytics for user: {user.username}")
    
    factory = APIRequestFactory()
    request = factory.get('/api/analytics/overview/')
    request.user = user
    
    response = analytics_overview(request)
    
    print(f"✅ Status: {response.status_code}")
    if response.status_code == 200:
        print(f"✅ SUCCESS! Data keys: {list(response.data.keys())}")
    else:
        print(f"Response: {response.data}")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
