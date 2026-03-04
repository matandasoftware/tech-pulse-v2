"""
URL configuration for users app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserProfileView,
    UserLogoutView
)

app_name = 'users'

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('token/', UserLoginView.as_view(), name='token_obtain_pair'),  # Changed from 'login/' to 'token/'
    path('me/', UserProfileView.as_view(), name='current_user'),        # Changed from 'profile/' to 'me/'
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]