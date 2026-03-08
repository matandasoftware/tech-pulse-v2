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
import { Link } from 'react-router-dom';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { handleApiError } from '../utils/toast';
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
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            const errorMessage = handleApiError(err, 'Failed to load dashboard');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Format reading time
     */
    const formatReadingTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    📊 My Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Your reading and note-taking insights
                </p>
            </div>

            {/* Loading State */}
            {loading && <DashboardSkeleton />}

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
                        onClick={fetchStats}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Dashboard Content */}
            {!loading && !error && stats && (
                <div className="space-y-8">

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Total Articles (All in System) */}
                        <Link
                            to="/"
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        {stats?.counts?.total_articles || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                        📰 Total Articles
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                        Available in feed
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">📰</span>
                                </div>
                            </div>
                        </Link>

                        {/* Personal Articles (User Interactions) */}
                        <Link
                            to="/"
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-indigo-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {stats?.counts?.user_articles || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                        👤 My Articles
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                        You've interacted with
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">👤</span>
                                </div>
                            </div>
                        </Link>

                        {/* Bookmarks */}
                        <Link
                            to="/bookmarks"
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {stats?.counts?.total_bookmarks || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                        📚 Bookmarks
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">📚</span>
                                </div>
                            </div>
                        </Link>

                        {/* Notes */}
                        <Link
                            to="/notes"
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {stats?.counts?.total_notes || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                        📝 Notes
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">📝</span>
                                </div>
                            </div>
                        </Link>

                        {/* Reading Time */}
                        <Link
                            to="/profile"
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-yellow-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {formatReadingTime(stats?.total_reading_time || 0)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                        ⏱️ Reading Time
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">⏱️</span>
                                </div>
                            </div>
                        </Link>

                        {/* PENDING FOLLOW-UPS WITH BREAKDOWN INSIDE */}
                        <Link
                            to="/notes?filter=pending-followups"
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-orange-500"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                        {stats?.counts?.pending_followups || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                        ⏳ Pending Follow-ups
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">⏳</span>
                                </div>
                            </div>

                            {/* Breakdown Inside Card */}
                            {stats && stats.counts.pending_followups > 0 && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-red-600 dark:text-red-400 font-medium">
                                            🔥 Overdue
                                        </span>
                                        <span className="text-red-700 dark:text-red-300 font-bold">
                                            {stats?.counts?.overdue_followups || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                            ⏰ Due Today
                                        </span>
                                        <span className="text-yellow-700 dark:text-yellow-300 font-bold">
                                            {stats?.counts?.due_today_followups || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                                            📅 Upcoming
                                        </span>
                                        <span className="text-blue-700 dark:text-blue-300 font-bold">
                                            {stats?.counts?.upcoming_followups || 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </Link>

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

                </div>
            )}

        </div>
    );
}

export default DashboardPage;