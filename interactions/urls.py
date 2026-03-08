"""
URL configuration for interactions app.
"""

from django.urls import path

from .analytics_views import (analytics_overview, category_analytics,
                              source_analytics)
from .views import (ArticleReferenceDetailView, ArticleReferenceListView,
                    BookmarkedArticlesView, NoteDetailView, NoteListView,
                    PendingFollowUpsView, ReadArticlesView,
                    ReadingHistoryDetailView, ReadingHistoryListView,
                    SavedForLaterView, UserArticleDetailView,
                    UserArticleListView, dashboard_stats)

app_name = "interactions"

urlpatterns = [
    # User article interactions
    path("user-articles/", UserArticleListView.as_view(), name="user-article-list"),
    path(
        "user-articles/<int:pk>/",
        UserArticleDetailView.as_view(),
        name="user-article-detail",
    ),
    # Bookmarks and saved articles
    path("bookmarks/", BookmarkedArticlesView.as_view(), name="bookmarks"),
    path("read-articles/", ReadArticlesView.as_view(), name="read-articles"),
    path("saved-for-later/", SavedForLaterView.as_view(), name="saved-for-later"),
    # Notes
    path("notes/", NoteListView.as_view(), name="note-list"),
    path("notes/<int:pk>/", NoteDetailView.as_view(), name="note-detail"),
    path(
        "pending-followups/", PendingFollowUpsView.as_view(), name="pending-followups"
    ),
    # Article references
    path(
        "article-references/",
        ArticleReferenceListView.as_view(),
        name="article-reference-list",
    ),
    path(
        "article-references/<int:pk>/",
        ArticleReferenceDetailView.as_view(),
        name="article-reference-detail",
    ),
    # Reading history
    path(
        "reading-history/",
        ReadingHistoryListView.as_view(),
        name="reading-history-list",
    ),
    path(
        "reading-history/<int:pk>/",
        ReadingHistoryDetailView.as_view(),
        name="reading-history-detail",
    ),
    # Dashboard stats
    path("dashboard/stats/", dashboard_stats, name="dashboard-stats"),
    # Analytics endpoints
    path("analytics/overview/", analytics_overview, name="analytics-overview"),
    path("analytics/categories/", category_analytics, name="category-analytics"),
    path("analytics/sources/", source_analytics, name="source-analytics"),
]
