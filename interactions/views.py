"""
Views for interactions app.
"""

from rest_framework import generics, filters, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import UserArticle, Note, ArticleReference, ReadingHistory
from .serializers import (
    UserArticleSerializer,
    NoteSerializer,
    ArticleReferenceSerializer,
    ReadingHistorySerializer
)


class UserArticleListView(generics.ListCreateAPIView):
    """
    List user's article interactions or create new interaction.
    
    GET /api/user-articles/
    POST /api/user-articles/
    """
    
    serializer_class = UserArticleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = [
        'is_read',
        'is_bookmarked',
        'is_saved_for_later',
        'keep_decision'
    ]
    ordering_fields = ['updated_at', 'created_at']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        """Return only current user's interactions."""
        return UserArticle.objects.filter(
            user=self.request.user
        ).select_related('article__source', 'article__category')
    
    def perform_create(self, serializer):
        """Set user to current authenticated user."""
        serializer.save(user=self.request.user)


class UserArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete user article interaction.
    
    GET /api/user-articles/{id}/
    PATCH /api/user-articles/{id}/
    DELETE /api/user-articles/{id}/
    """
    
    serializer_class = UserArticleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only current user's interactions."""
        return UserArticle.objects.filter(
            user=self.request.user
        ).select_related('article__source', 'article__category')


class BookmarkedArticlesView(generics.ListAPIView):
    """
    List user's bookmarked articles.

    GET /api/bookmarks/
    """

    serializer_class = UserArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only bookmarked articles."""
        import sys
        queryset = UserArticle.objects.filter(
            user=self.request.user,
            is_bookmarked=True
        ).select_related('article__source', 'article__category').order_by('-bookmarked_at')

        # DEBUG LOG with flush
        print(f"\n🔍 BookmarkedArticlesView queryset:", file=sys.stderr, flush=True)
        print(f"   User: {self.request.user.username}", file=sys.stderr, flush=True)
        print(f"   Count: {queryset.count()}", file=sys.stderr, flush=True)
        for ua in queryset:
            print(f"   - Article {ua.article.id}: {ua.article.title[:40]}", file=sys.stderr, flush=True)
            print(f"     is_bookmarked: {ua.is_bookmarked}, bookmarked_at: {ua.bookmarked_at}", file=sys.stderr, flush=True)

        return queryset

    def list(self, request, *args, **kwargs):
        """Override list to disable caching."""
        response = super().list(request, *args, **kwargs)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class ReadArticlesView(generics.ListAPIView):
    """
    List user's read articles.
    
    GET /api/read-articles/
    """
    
    serializer_class = UserArticleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only read articles."""
        return UserArticle.objects.filter(
            user=self.request.user,
            is_read=True
        ).select_related('article__source', 'article__category').order_by('-read_at')


class SavedForLaterView(generics.ListAPIView):
    """
    List user's saved for later articles.
    
    GET /api/saved-for-later/
    """
    
    serializer_class = UserArticleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only saved for later articles."""
        return UserArticle.objects.filter(
            user=self.request.user,
            is_saved_for_later=True
        ).select_related('article__source', 'article__category').order_by('-saved_at')


class NoteListView(generics.ListCreateAPIView):
    """
    List user's notes or create new note.
    
    GET /api/notes/
    POST /api/notes/
    """
    
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['has_follow_up', 'follow_up_done', 'article']
    search_fields = ['content']
    ordering_fields = ['created_at', 'updated_at', 'follow_up_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return only current user's notes."""
        return Note.objects.filter(
            user=self.request.user
        ).select_related('article__source', 'article__category')
    
    def perform_create(self, serializer):
        """Set user to current authenticated user."""
        serializer.save(user=self.request.user)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a note.
    
    GET /api/notes/{id}/
    PATCH /api/notes/{id}/
    DELETE /api/notes/{id}/
    """
    
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only current user's notes."""
        return Note.objects.filter(
            user=self.request.user
        ).select_related('article__source', 'article__category')


class PendingFollowUpsView(generics.ListAPIView):
    """
    List user's pending follow-ups.
    
    GET /api/pending-followups/
    """
    
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only notes with pending follow-ups."""
        return Note.objects.filter(
            user=self.request.user,
            has_follow_up=True,
            follow_up_done=False
        ).select_related('article__source', 'article__category').order_by('follow_up_date')


class ArticleReferenceListView(generics.ListCreateAPIView):
    """
    List article references or create new reference.
    
    GET /api/article-references/
    POST /api/article-references/
    """
    
    serializer_class = ArticleReferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['source_note']
    
    def get_queryset(self):
        """Return only current user's references."""
        return ArticleReference.objects.filter(
            source_note__user=self.request.user
        ).select_related('referenced_article__source', 'referenced_article__category')


class ArticleReferenceDetailView(generics.RetrieveDestroyAPIView):
    """
    Retrieve or delete an article reference.
    
    GET /api/article-references/{id}/
    DELETE /api/article-references/{id}/
    """
    
    serializer_class = ArticleReferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only current user's references."""
        return ArticleReference.objects.filter(
            source_note__user=self.request.user
        ).select_related('referenced_article__source', 'referenced_article__category')


class ReadingHistoryListView(generics.ListCreateAPIView):
    """
    List user's reading history or create new entry.
    
    GET /api/reading-history/
    POST /api/reading-history/
    """
    
    serializer_class = ReadingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['article']
    ordering_fields = ['read_at', 'time_spent']
    ordering = ['-read_at']
    
    def get_queryset(self):
        """Return only current user's reading history."""
        return ReadingHistory.objects.filter(
            user=self.request.user
        ).select_related('article__source', 'article__category')
    
    def perform_create(self, serializer):
        """Set user to current authenticated user."""
        serializer.save(user=self.request.user)


class ReadingHistoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete reading history entry.
    
    GET /api/reading-history/{id}/
    PATCH /api/reading-history/{id}/
    DELETE /api/reading-history/{id}/
    """
    
    serializer_class = ReadingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only current user's reading history."""
        return ReadingHistory.objects.filter(
            user=self.request.user
        ).select_related('article__source', 'article__category')

from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics for the authenticated user.
    
    Returns:
        - Total articles (viewed/interacted with)
        - Total notes created
        - Total bookmarks
        - Pending follow-ups count
        - Reviewed notes count
        - Unreviewed notes count
        - Top 5 sources by note count
        - Top 5 categories by note count
        - Notes created in last 30 days (by date)
        - Upcoming follow-ups (next 7 days)
    """
    user = request.user
    
    # Basic counts
    total_notes = Note.objects.filter(user=user).count()
    total_bookmarks = UserArticle.objects.filter(
        user=user,
        is_bookmarked=True
    ).count()
    
    # Notes statistics
    reviewed_notes = Note.objects.filter(user=user, is_reviewed=True).count()
    unreviewed_notes = Note.objects.filter(user=user, is_reviewed=False).count()
    
    # Follow-up statistics
    pending_followups = Note.objects.filter(
        user=user,
        has_follow_up=True,
        follow_up_done=False
    ).count()
    
    completed_followups = Note.objects.filter(
        user=user,
        has_follow_up=True,
        follow_up_done=True
    ).count()
    
    # Articles with notes or bookmarks
    total_articles = UserArticle.objects.filter(
        user=user
    ).values('article').distinct().count()
    
    # Top sources (by note count)
    top_sources = Note.objects.filter(
        user=user
    ).values(
        'article__source__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # Top categories (by note count)
    top_categories = Note.objects.filter(
        user=user
    ).values(
        'article__category__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # Notes timeline (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    notes_timeline = Note.objects.filter(
        user=user,
        created_at__gte=thirty_days_ago
    ).extra(
        select={'date': 'date(created_at)'}
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    # Upcoming follow-ups (next 7 days)
    today = timezone.now().date()
    seven_days_later = today + timedelta(days=7)
    
    upcoming_followups = Note.objects.filter(
        user=user,
        has_follow_up=True,
        follow_up_done=False,
        follow_up_date__gte=today,
        follow_up_date__lte=seven_days_later
    ).select_related('article').order_by('follow_up_date')[:10]
    
    # Overdue follow-ups
    overdue_followups = Note.objects.filter(
        user=user,
        has_follow_up=True,
        follow_up_done=False,
        follow_up_date__lt=today
    ).count()
    
    # Serialize upcoming follow-ups
    upcoming_followups_data = [
        {
            'id': note.id,
            'content': note.content[:100],  # Truncate to 100 chars
            'follow_up_date': note.follow_up_date,
            'article_title': note.article.title,
            'article_id': note.article.id,
        }
        for note in upcoming_followups
    ]
    
    return Response({
        'counts': {
            'total_articles': total_articles,
            'total_notes': total_notes,
            'total_bookmarks': total_bookmarks,
            'pending_followups': pending_followups,
            'completed_followups': completed_followups,
            'overdue_followups': overdue_followups,
            'reviewed_notes': reviewed_notes,
            'unreviewed_notes': unreviewed_notes,
        },
        'top_sources': [
            {
                'name': item['article__source__name'],
                'count': item['count']
            }
            for item in top_sources if item['article__source__name']
        ],
        'top_categories': [
            {
                'name': item['article__category__name'],
                'count': item['count']
            }
            for item in top_categories if item['article__category__name']
        ],
        'notes_timeline': [
            {
                'date': item['date'],
                'count': item['count']
            }
            for item in notes_timeline
        ],
        'upcoming_followups': upcoming_followups_data,
    })

