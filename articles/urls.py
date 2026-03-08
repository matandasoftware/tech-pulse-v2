"""
URL configuration for articles app.

Maps URL patterns to view classes for all article-related endpoints.
"""

from django.urls import path

from .views import (ArticleDetailView, ArticleListView, BookmarkDeleteView,
                    BookmarkListView, BookmarkToggleView, CategoryDetailView,
                    CategoryListView, SourceDetailView, SourceListView)

app_name = "articles"

urlpatterns = [
    # Category endpoints
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    # Source endpoints
    path("sources/", SourceListView.as_view(), name="source-list"),
    path("sources/<int:pk>/", SourceDetailView.as_view(), name="source-detail"),
    # Article endpoints
    path("articles/", ArticleListView.as_view(), name="article-list"),
    path("articles/<int:pk>/", ArticleDetailView.as_view(), name="article-detail"),
    # Bookmark endpoints
    # Toggle bookmark for article (smart endpoint - creates or deletes)
    path(
        "articles/<int:article_id>/bookmark/",
        BookmarkToggleView.as_view(),
        name="bookmark-toggle",
    ),
    # List all bookmarks for authenticated user
    path("bookmarks/", BookmarkListView.as_view(), name="bookmark-list"),
    # Delete specific bookmark by ID
    path("bookmarks/<int:pk>/", BookmarkDeleteView.as_view(), name="bookmark-delete"),
]
