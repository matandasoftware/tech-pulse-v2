"""
Admin configuration for users app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Admin interface for CustomUser model.
    
    Extends Django's UserAdmin with custom fields.
    """
    
    list_display = [
        'username',
        'email',
        'first_name',
        'last_name',
        'dark_mode',
        'is_staff',
        'is_active',
        'date_joined'
    ]
    
    list_filter = [
        'is_staff',
        'is_active',
        'dark_mode',
        'email_notifications',
        'date_joined'
    ]
    
    search_fields = [
        'username',
        'email',
        'first_name',
        'last_name'
    ]
    
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': (
                'bio',
                'dark_mode',
                'email_notifications',
                'preferred_categories'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'date_joined']
    
    filter_horizontal = ['preferred_categories', 'groups', 'user_permissions']