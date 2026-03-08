/**
 * HomePage Component
 * 
 * Main page displaying articles with search, filters, and pagination.
 * Includes notes panel for adding notes to articles.
 */

import { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import NotesPanel from '../components/NotesPanel';
import { ArticleListSkeleton } from '../components/LoadingSkeleton';
import { handleApiError } from '../utils/toast';
import api from '../services/api';

function HomePage() {
    // State
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sources, setSources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetchArticles();
        fetchSources();
        fetchCategories();

        // Listen for bookmark changes to refresh article states
        const handleBookmarkUpdate = () => {
            fetchArticles();
        };

        window.addEventListener('bookmarkUpdated', handleBookmarkUpdate);

        return () => {
            window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate);
        };
    }, []);

    // Re-fetch when search/filters change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchArticles();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedSource, selectedCategory]);

    /**
     * Fetch articles with current filters
     */
    const fetchArticles = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {};

            if (searchQuery) params.search = searchQuery;
            if (selectedSource) params.source = selectedSource;
            if (selectedCategory) params.category = selectedCategory;

            const response = await api.get('/articles/', { params });

            setArticles(response.data.results || response.data);
            setNextPage(response.data.next || null);

        } catch (err) {
            console.error('Error fetching articles:', err);
            const errorMessage = handleApiError(err, 'Failed to load articles');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch available sources for filter
     */
    const fetchSources = async () => {
        try {
            const response = await api.get('/sources/');
            setSources(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching sources:', err);
        }
    };

    /**
     * Fetch available categories for filter
     */
    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    /**
     * Load more articles (pagination)
     */
    const loadMoreArticles = async () => {
        if (!nextPage || loadingMore) return;

        setLoadingMore(true);

        try {
            const response = await api.get(nextPage);
            setArticles(prev => [...prev, ...(response.data.results || response.data)]);
            setNextPage(response.data.next || null);
        } catch (err) {
            console.error('Error loading more articles:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    /**
     * Update local state when article is bookmarked/unbookmarked
     */
    const handleBookmarkChange = (articleId, isBookmarked) => {
        setArticles(prevArticles =>
            prevArticles.map(article =>
                article.id === articleId
                    ? { ...article, is_bookmarked: isBookmarked }
                    : article
            )
        );
    };

    /**
     * Clear all filters and search
     */
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSource('');
        setSelectedCategory('');
    };

    /**
     * Check if any filters are active
     */
    const hasActiveFilters = () => {
        return searchQuery || selectedSource || selectedCategory;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Latest Tech Articles
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Stay updated with the latest in technology
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center">

                    {/* Source Filter */}
                    <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">All Sources</option>
                        {sources.map(source => (
                            <option key={source.id} value={source.id}>
                                {source.name}
                            </option>
                        ))}
                    </select>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    {/* Clear Filters Button */}
                    {hasActiveFilters() && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && <ArticleListSkeleton count={6} />}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-red-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-red-600 dark:text-red-400 mb-4 text-lg font-medium">{error}</p>
                    <button
                        onClick={fetchArticles}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Articles Grid */}
            {!loading && !error && articles.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map(article => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onBookmarkChange={handleBookmarkChange}
                            />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {nextPage && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={loadMoreArticles}
                                disabled={loadingMore}
                                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loadingMore ? 'Loading...' : 'Load More Articles'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && !error && articles.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📰</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No articles found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {hasActiveFilters()
                            ? 'Try adjusting your filters or search query'
                            : 'Check back later for new articles'}
                    </p>
                    {hasActiveFilters() && (
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* Notes Panel */}
            <NotesPanel />
        </div>
    );
}

export default HomePage;