/**
 * DashboardPage Component
 * 
 * Displays user's activity dashboard with statistics and insights.
 * 
 * Features:
 * - Key metrics (articles, notes, bookmarks, follow-ups)
 * - Top sources and categories
 * - Notes timeline chart
 * - Upcoming follow-ups widget
 * - Quick navigation to related pages
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch dashboard stats on mount
     */
    useEffect(() => {
        fetchStats();
    }, []);

    /**
     * Fetch dashboard statistics from API
     */
    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/dashboard/stats/');
            setStats(response.data);
            console.log('Dashboard stats:', response.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    📊 My Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Your reading and note-taking insights
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div
                            key={n}
                            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">
                        ⚠️ Error loading dashboard: {error}
                    </p>
                    <button
                        onClick={fetchStats}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Dashboard Content */}
            {!loading && !error && stats && (
                <div className="space-y-8">

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Total Articles */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Articles
                                </h3>
                                <span className="text-2xl">📰</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats.counts.total_articles}
                            </p>
                        </div>

                        {/* Total Notes */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Notes
                                </h3>
                                <span className="text-2xl">📝</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats.counts.total_notes}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stats.counts.reviewed_notes} reviewed
                            </p>
                        </div>

                        {/* Total Bookmarks */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Bookmarks
                                </h3>
                                <span className="text-2xl">🔖</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats.counts.total_bookmarks}
                            </p>
                        </div>

                        {/* Pending Follow-ups */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Follow-ups
                                </h3>
                                <span className="text-2xl">⏰</span>
                            </div>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {stats.counts.pending_followups}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stats.counts.overdue_followups} overdue
                            </p>
                        </div>

                    </div>

                    {/* Top Sources & Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Top Sources */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                🏆 Top Sources
                            </h3>
                            {stats.top_sources.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.top_sources.map((source, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                                                    {index + 1}.
                                                </span>
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {source.name}
                                                </span>
                                            </div>
                                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                                {source.count} {source.count === 1 ? 'note' : 'notes'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No notes yet
                                </p>
                            )}
                        </div>

                        {/* Top Categories */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                🏷️ Top Categories
                            </h3>
                            {stats.top_categories.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.top_categories.map((category, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                                                    {index + 1}.
                                                </span>
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {category.name}
                                                </span>
                                            </div>
                                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                                {category.count} {category.count === 1 ? 'note' : 'notes'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No notes yet
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Upcoming Follow-ups */}
                    {stats.upcoming_followups.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                ⏰ Upcoming Follow-ups
                            </h3>
                            <div className="space-y-3">
                                {stats.upcoming_followups.map((followup) => (
                                    <div
                                        key={followup.id}
                                        className="flex items-start justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                {followup.content}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                📰 {followup.article_title}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 whitespace-nowrap ml-4">
                                            {formatDate(followup.follow_up_date)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
}

export default DashboardPage;