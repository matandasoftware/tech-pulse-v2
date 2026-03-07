"""
Management command to clean up inconsistent UserArticle records.

Ensures that:
- If is_bookmarked=False, then bookmarked_at=None
- If is_read=False, then read_at=None  
- If is_saved_for_later=False, then saved_at=None

Usage:
    python manage.py cleanup_bookmarks
"""

from django.core.management.base import BaseCommand
from interactions.models import UserArticle


class Command(BaseCommand):
    help = 'Clean up inconsistent UserArticle timestamps'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting cleanup...'))
        
        # Fix bookmarks
        unbookmarked_with_timestamp = UserArticle.objects.filter(
            is_bookmarked=False
        ).exclude(bookmarked_at__isnull=True)
        
        count = unbookmarked_with_timestamp.count()
        if count > 0:
            self.stdout.write(f'Found {count} unbookmarked articles with bookmarked_at timestamp')
            unbookmarked_with_timestamp.update(bookmarked_at=None)
            self.stdout.write(self.style.SUCCESS(f'✓ Cleared {count} bookmarked_at timestamps'))
        
        # Fix read status
        unread_with_timestamp = UserArticle.objects.filter(
            is_read=False
        ).exclude(read_at__isnull=True)
        
        count = unread_with_timestamp.count()
        if count > 0:
            self.stdout.write(f'Found {count} unread articles with read_at timestamp')
            unread_with_timestamp.update(read_at=None)
            self.stdout.write(self.style.SUCCESS(f'✓ Cleared {count} read_at timestamps'))
        
        # Fix saved for later
        unsaved_with_timestamp = UserArticle.objects.filter(
            is_saved_for_later=False
        ).exclude(saved_at__isnull=True)
        
        count = unsaved_with_timestamp.count()
        if count > 0:
            self.stdout.write(f'Found {count} unsaved articles with saved_at timestamp')
            unsaved_with_timestamp.update(saved_at=None)
            self.stdout.write(self.style.SUCCESS(f'✓ Cleared {count} saved_at timestamps'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Cleanup complete!'))
