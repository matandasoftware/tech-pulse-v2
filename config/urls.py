"""
URL configuration for Tech Pulse v2.0 project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/users/', include('users.urls')),
    path('api/', include('articles.urls')),
    path('api/', include('interactions.urls')),
]