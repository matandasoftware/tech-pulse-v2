"""
URL configuration for articles app.
"""

from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    SourceListView,
    SourceDetailView,
    ArticleListView,
    ArticleDetailView
)

app_name = 'articles'

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    
    path('sources/', SourceListView.as_view(), name='source-list'),
    path('sources/<int:pk>/', SourceDetailView.as_view(), name='source-detail'),
    
    path('articles/', ArticleListView.as_view(), name='article-list'),
    path('articles/<int:pk>/', ArticleDetailView.as_view(), name='article-detail'),
]