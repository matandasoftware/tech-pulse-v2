"""
Views for articles app.

Handles CRUD operations for categories, sources, articles, and bookmarks.
"""

from django.db import models
from rest_framework import generics, filters, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Category, Source, Article, Bookmark
from .serializers import (
    CategorySerializer,
    SourceSerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateSerializer,
    BookmarkSerializer
)


class CategoryListView(generics.ListCreateAPIView):
    """
    List all categories or create new category.
    
    GET /api/categories/
    POST /api/categories/
    """
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a category.
    
    GET /api/categories/{id}/
    PATCH /api/categories/{id}/
    DELETE /api/categories/{id}/
    """
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class SourceListView(generics.ListCreateAPIView):
    """
    List all sources or create new source.
    
    GET /api/sources/
    POST /api/sources/
    """
    
    queryset = Source.objects.all()
    serializer_class = SourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class SourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a source.
    
    GET /api/sources/{id}/
    PATCH /api/sources/{id}/
    DELETE /api/sources/{id}/
    """
    
    queryset = Source.objects.all()
    serializer_class = SourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ArticleListView(generics.ListCreateAPIView):
    """
    List all articles or create new article.

    GET /api/articles/
    POST /api/articles/

    Filters:
    - ?category=1
    - ?source=1
    - ?state=fresh|active|archived
    - ?search=keyword
    - ?ordering=-published_at

    Smart Feed Prioritization:
    - Fresh articles (0-7 days) shown first
    - Then active articles (7-30 days)
    - Archived articles (30+ days) excluded by default
    """

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['category', 'source', 'state']
    search_fields = ['title', 'content', 'summary', 'author']
    ordering_fields = ['published_at', 'view_count', 'bookmark_count']

    def get_queryset(self):
        """
        Get articles with smart filtering.

        By default:
        - Excludes archived articles (30+ days old)
        - Orders by: fresh first, then active, then by date
        """
        queryset = Article.objects.select_related('source', 'category')

        # Get state filter from query params
        state_filter = self.request.query_params.get('state', None)

        if state_filter:
            # User explicitly filtering by state
            queryset = queryset.filter(state=state_filter)
        else:
            # Default: exclude archived articles for clean feed
            queryset = queryset.exclude(state='archived')

        # Smart prioritization: fresh first, then active, then by date
        queryset = queryset.order_by(
            models.Case(
                models.When(state='fresh', then=0),
                models.When(state='active', then=1),
                models.When(state='archived', then=2),
                default=3,
                output_field=models.IntegerField(),
            ),
            '-published_at'
        )

        return queryset

    def get_serializer_class(self):
        """Use different serializers for list vs create."""
        if self.request.method == 'POST':
            return ArticleCreateSerializer
        return ArticleListSerializer


class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an article.
    
    GET /api/articles/{id}/
    PATCH /api/articles/{id}/
    DELETE /api/articles/{id}/
    """
    
    # select_related prevents N+1 queries by joining source and category tables
    queryset = Article.objects.select_related('source', 'category').all()
    serializer_class = ArticleDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when article is retrieved."""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BookmarkToggleView(APIView):
    """
    Toggle bookmark for an article.
    
    POST /api/articles/{article_id}/bookmark/
    
    If bookmarked: removes bookmark and returns 204
    If not bookmarked: creates bookmark and returns 201
    
    Why APIView instead of generics:
    - Custom logic (toggle behavior)
    - Single endpoint for create + delete
    - Better UX (one button, one endpoint)
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, article_id):
        """Toggle bookmark for article."""
        # Verify article exists (raises 404 if not)
        article = get_object_or_404(Article, id=article_id)
        
        # Try to find existing bookmark
        bookmark = Bookmark.objects.filter(
            user=request.user,
            article=article
        ).first()
        
        if bookmark:
            # Bookmark exists - remove it
            bookmark.delete()
            return Response(
                {'detail': 'Bookmark removed', 'is_bookmarked': False},
                status=status.HTTP_200_OK
            )
        else:
            # Bookmark doesn't exist - create it
            # Serializer automatically adds user from request context
            serializer = BookmarkSerializer(
                data={'article_id': article_id},
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                {'detail': 'Bookmark added', 'is_bookmarked': True},
                status=status.HTTP_201_CREATED
            )


class BookmarkListView(generics.ListAPIView):
    """
    List all bookmarks for authenticated user.
    
    GET /api/bookmarks/
    
    Returns bookmarks ordered by newest first.
    """
    
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only return bookmarks belonging to authenticated user."""
        # select_related prevents N+1 queries for article, source, category
        return Bookmark.objects.filter(
            user=self.request.user
        ).select_related(
            'article',
            'article__source',
            'article__category'
        )


class BookmarkDeleteView(generics.DestroyAPIView):
    """
    Delete a specific bookmark.
    
    DELETE /api/bookmarks/{id}/
    
    Used when user wants to remove bookmark from bookmark list page.
    """
    
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow users to delete their own bookmarks."""
        return Bookmark.objects.filter(user=self.request.user)