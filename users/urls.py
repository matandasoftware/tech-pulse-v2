"""
URL configuration for users app.
"""

from django.urls import path

from .views import (ChangePasswordView, UserLoginView, UserProfileView,
                    UserRegistrationView)

app_name = "users"

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("token/", UserLoginView.as_view(), name="token"),  # Alias for login
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
