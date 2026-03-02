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
        return UserArticle.objects.filter(
            user=self.request.user,
            is_bookmarked=True
        ).select_related('article__source', 'article__category').order_by('-bookmarked_at')


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
