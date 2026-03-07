/**
 * ArticleCard Component
 * 
 * Displays a single article card with image, title, description, and interaction buttons.
 * 
 * Features:
 * - Bookmark toggle
 * - Notes button (opens NotesPanel)
 * - Article metadata (source, category, published date)
 * - Click to open article in new tab
 * - Responsive design
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNotesPanel } from '../context/NotesPanelContext';
import api from '../services/api';

function ArticleCard({ article, onBookmarkChange }) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarking, setBookmarking] = useState(false);
    const [notesCount, setNotesCount] = useState(0);
    const { openPanel } = useNotesPanel();

    /**
     * ✅ FIXED: Fetch REAL bookmark status from backend
     */
    useEffect(() => {
        const fetchBookmarkStatus = async () => {
            try {
                const response = await api.get('/user-articles/', {
                    params: { article_id: article.id }
                });

                // Find this article's UserArticle record
                const results = response.data.results || response.data;
                const userArticle = Array.isArray(results)
                    ? results.find(ua => ua.article?.id === article.id)
                    : null;

                if (userArticle) {
                    setIsBookmarked(userArticle.is_bookmarked || false);
                    setNotesCount(userArticle.article?.notes_count || 0);
                } else {
                    // No UserArticle record = not bookmarked
                    setIsBookmarked(false);
                }
            } catch (err) {
                console.error('Error fetching bookmark status:', err);
                // Fallback to article data if available
                setIsBookmarked(article.is_bookmarked || false);
            }
        };

        fetchBookmarkStatus();

        // Also set notes count from article if available
        if (article.notes_count !== undefined) {
            setNotesCount(article.notes_count);
        }
    }, [article.id, article.is_bookmarked, article.notes_count]);

    /**
     * Handle bookmark toggle
     * Creates or updates UserArticle record
     */
    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (bookmarking) return;

        setBookmarking(true);
        const newBookmarkState = !isBookmarked;

        // Optimistic update
        setIsBookmarked(newBookmarkState);

        try {
            console.log('📌 Bookmarking article:', article.id, 'New state:', newBookmarkState);

            // Create or update UserArticle record
            const response = await api.post('/user-articles/', {
                article_id: article.id,
                is_bookmarked: newBookmarkState,
            });

            console.log('✅ Bookmark response:', response.data);

            // Dispatch global event to update bookmark pages
            window.dispatchEvent(new CustomEvent('bookmarkUpdated', {
                detail: { articleId: article.id, isBookmarked: newBookmarkState }
            }));

            // Notify parent component
            if (onBookmarkChange) {
                onBookmarkChange(article.id, newBookmarkState);
            }
        } catch (err) {
            console.error('❌ Error toggling bookmark:', err);
            console.error('❌ Error response:', err.response?.data);
            console.error('❌ Error status:', err.response?.status);

            // Revert on error
            setIsBookmarked(!newBookmarkState);

            const errorMsg = err.response?.data?.detail
                || err.response?.data?.article_id
                || err.response?.data?.error
                || err.message
                || 'Failed to update bookmark';
            alert('Bookmark error: ' + errorMsg);
        } finally {
            setBookmarking(false);
        }
    };

    /**
     * Handle notes button click
     * Opens NotesPanel with this article
     */
    const handleNotesClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPanel(article);
    };

    /**
     * Format date to readable string
     */
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return dateString;
        }
    };

    /**
     * Handle notes count update from NotesPanel
     */
    const handleNotesUpdate = (newCount) => {
        setNotesCount(newCount);
    };

    // Listen for notes updates
    useEffect(() => {
        const handleNoteAdded = (event) => {
            if (event.detail.articleId === article.id) {
                setNotesCount(event.detail.count);
            }
        };

        window.addEventListener('noteAdded', handleNoteAdded);
        return () => window.removeEventListener('noteAdded', handleNoteAdded);
    }, [article.id]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">

            {/* Article Image */}
            {article.image_url && (
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                    />
                </a>
            )}

            {/* Card Content */}
            <div className="p-5">

                {/* Metadata Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {/* Source Badge */}
                    {article.source && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            {article.source.name}
                        </span>
                    )}

                    {/* Category Badge */}
                    {article.category && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                            {article.category.name}
                        </span>
                    )}
                </div>

                {/* Article Title */}
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-3"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {article.title}
                    </h3>
                </a>

                {/* Article Description */}
                {article.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {article.description}
                    </p>
                )}

                {/* Published Date */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    📅 {formatDate(article.published_at)}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">

                    {/* Bookmark Button */}
                    <button
                        onClick={handleBookmark}
                        disabled={bookmarking}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${isBookmarked
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        {bookmarking ? '...' : (isBookmarked ? '🔖 Bookmarked' : 'Bookmark')}
                    </button>

                    {/* Notes Button */}
                    <button
                        onClick={handleNotesClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium relative"
                    >
                        📝 Notes
                        {notesCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {notesCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ArticleCard;