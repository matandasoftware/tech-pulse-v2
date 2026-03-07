/**
 * BookmarksPage Component
 * 
 * Displays all articles bookmarked by the current user.
 * Fetches from /api/user-articles/?is_bookmarked=true which returns UserArticle objects
 * where is_bookmarked=True.
 * 
 * Features:
 * - Grid layout matching home page
 * - Auto-removes articles when unbookmarked
 * - Loading skeletons
 * - Error handling
 * - Empty state with helpful message
 * - Notes panel for adding/viewing notes on bookmarked articles
 */

import { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import NotesPanel from '../components/NotesPanel';
import api from '../services/api';

function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch bookmarks on component mount
     */
    useEffect(() => {
        fetchBookmarks();

        // Listen for bookmark changes from other pages
        const handleBookmarkUpdate = () => {
            fetchBookmarks();
        };

        window.addEventListener('bookmarkUpdated', handleBookmarkUpdate);

        return () => {
            window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate);
        };
    }, []);

    /**
     * Fetch user's bookmarked articles from API
     * Calls /api/user-articles/?is_bookmarked=true which returns UserArticle objects with nested article data
     */
    const fetchBookmarks = async () => {
        setLoading(true);
        setError(null);

        try {
            // ✅ FIXED: Fetch from user-articles with is_bookmarked filter
            const response = await api.get('/user-articles/', {
                params: {
                    is_bookmarked: true,
                    _t: Date.now()
                }
            });
            console.log('📚 Bookmarks fetched:', response.data);
            // Response is paginated: { count: X, results: [...] }
            setBookmarks(response.data.results || response.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching bookmarks:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle bookmark status change from ArticleCard
     * Removes article from list when unbookmarked
     * 
     * @param {number} articleId - ID of the article
     * @param {boolean} isBookmarked - New bookmark status
     */
    const handleBookmarkChange = (articleId, isBookmarked) => {
        if (!isBookmarked) {
            // Remove from list immediately for snappy UX
            setBookmarks(prevBookmarks =>
                prevBookmarks.filter(bookmark => bookmark.article.id !== articleId)
            );
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    My Bookmarks
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    {bookmarks.length} saved {bookmarks.length === 1 ? 'article' : 'articles'}
                </p>
            </div>

            {/* Loading State - Skeleton Cards */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                            key={n}
                            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">
                        ⚠️ Error loading bookmarks: {error}
                    </p>
                    <button
                        onClick={fetchBookmarks}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Bookmarks Grid */}
            {!loading && !error && bookmarks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map((bookmark) => (
                        <ArticleCard
                            key={bookmark.article.id}
                            article={bookmark.article}
                            onBookmarkChange={handleBookmarkChange}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && bookmarks.length === 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                        No bookmarks yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500">
                        Start bookmarking articles to save them for later
                    </p>
                </div>
            )}

            {/* Notes Panel - Slides in from right when opened */}
            <NotesPanel />
        </div>
    );
}

export default BookmarksPage;