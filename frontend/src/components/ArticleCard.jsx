/**
 * ArticleCard Component
 * 
 * Displays article with image, metadata, and bookmark functionality.
 * Syncs bookmark state with backend API.
 * 
 * @param {Object} article - Article data from API
 * @param {Function} onBookmarkChange - Callback(articleId, isBookmarked) when bookmark toggles
 */

import { useState } from 'react';
import { BookmarkIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { toggleBookmark } from '../services/api';

function ArticleCard({ article, onBookmarkChange }) {
    const [isBookmarked, setIsBookmarked] = useState(article.is_bookmarked || false);
    const [isLoading, setIsLoading] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await toggleBookmark(article.id);
            setIsBookmarked(response.is_bookmarked);

            if (onBookmarkChange) {
                onBookmarkChange(article.id, response.is_bookmarked);
            }
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);

            if (error.response?.status === 401) {
                alert('Please log in to bookmark articles.');
            } else {
                alert('Failed to bookmark article. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            {article.image_url && (
                <div className="h-48 overflow-hidden">
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            <div className="p-6">
                {article.category && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-3">
                        {article.category.name}
                    </span>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors">
                    {article.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {article.summary || article.content.substring(0, 150) + '...'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatDate(article.published_at)}
                        </span>
                        <span className="flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            {article.view_count}
                        </span>
                    </div>
                    {article.source && (
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {article.source.name}
                        </span>
                    )}
                </div>

                {article.author && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        By <span className="font-medium">{article.author}</span>
                    </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (article.url.includes('example.com')) {
                                e.preventDefault();
                                alert('⚠️ This is a demo article. Real URL not available.');
                            }
                        }}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm"
                    >
                        Read Full Article →
                    </a>

                    <button
                        onClick={handleBookmark}
                        disabled={isLoading}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative group ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
                        title={isBookmarked ? "Bookmarked ✓" : "Bookmark"}
                    >
                        {isBookmarked ? (
                            <BookmarkSolidIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        ) : (
                            <BookmarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        )}

                        {isLoading && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></span>
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ArticleCard;