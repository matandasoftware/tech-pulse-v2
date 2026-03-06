"""
URL configuration for Tech Pulse v2.0 project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/auth/', include('users.urls')),  # Changed from 'api/users/' to 'api/auth/'
    path('api/', include('articles.urls')),
    path('api/', include('interactions.urls')),
]