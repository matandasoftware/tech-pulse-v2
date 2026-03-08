"""
URL configuration for Tech Pulse v2.0 project.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),  # ✅ Make sure this exists
    path("api/", include("articles.urls")),
    path("api/", include("interactions.urls")),
]
