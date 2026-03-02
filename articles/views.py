"""
Views for articles app.
"""

from rest_framework import generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Source, Article
from .serializers import (
    CategorySerializer,
    SourceSerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateSerializer
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
    - ?search=keyword
    - ?ordering=-published_at
    """
    
    queryset = Article.objects.select_related('source', 'category').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['category', 'source']
    search_fields = ['title', 'content', 'summary', 'author']
    ordering_fields = ['published_at', 'view_count', 'bookmark_count']
    ordering = ['-published_at']
    
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
    
    queryset = Article.objects.select_related('source', 'category').all()
    serializer_class = ArticleDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when article is retrieved."""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
