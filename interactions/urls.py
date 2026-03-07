"""
URL configuration for interactions app.
"""

from django.urls import path
from .views import (
    UserArticleListView,
    UserArticleDetailView,
    BookmarkedArticlesView,
    ReadArticlesView,
    SavedForLaterView,
    NoteListView,
    NoteDetailView,
    PendingFollowUpsView,
    ArticleReferenceListView,
    ArticleReferenceDetailView,
    ReadingHistoryListView,
    ReadingHistoryDetailView,
    dashboard_stats,  # ← ADD THIS IMPORT
)

app_name = 'interactions'

urlpatterns = [
    # User article interactions
    path('user-articles/', UserArticleListView.as_view(), name='user-article-list'),
    path('user-articles/<int:pk>/', UserArticleDetailView.as_view(), name='user-article-detail'),
    
    # Bookmarks and saved articles
    path('bookmarks/', BookmarkedArticlesView.as_view(), name='bookmarks'),
    path('read-articles/', ReadArticlesView.as_view(), name='read-articles'),
    path('saved-for-later/', SavedForLaterView.as_view(), name='saved-for-later'),
    
    # Notes
    path('notes/', NoteListView.as_view(), name='note-list'),
    path('notes/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('pending-followups/', PendingFollowUpsView.as_view(), name='pending-followups'),
    
    # Article references
    path('article-references/', ArticleReferenceListView.as_view(), name='article-reference-list'),
    path('article-references/<int:pk>/', ArticleReferenceDetailView.as_view(), name='article-reference-detail'),
    
    # Reading history
    path('reading-history/', ReadingHistoryListView.as_view(), name='reading-history-list'),
    path('reading-history/<int:pk>/', ReadingHistoryDetailView.as_view(), name='reading-history-detail'),
    
    # Dashboard stats
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
]