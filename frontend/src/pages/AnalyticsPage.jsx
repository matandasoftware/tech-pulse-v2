/**
 * AnalyticsPage Component
 * 
 * Comprehensive analytics dashboard showing reading insights and statistics.
 * 
 * Features:
 * - Reading time trends chart
 * - Category breakdown pie chart
 * - Source breakdown bar chart
 * - Reading streak display
 * - Activity heatmap
 * - Reading hours distribution
 */

import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ProfileSkeleton } from '../components/LoadingSkeleton';
import { handleApiError } from '../utils/toast';
import api from '../services/api';

function AnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/analytics/overview/');
            setAnalytics(response.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            const errorMessage = handleApiError(err, 'Failed to load analytics');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Colors for charts
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    // Format time in seconds to readable format
    const formatTime = (seconds) => {
        if (!seconds) return '0m';
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    if (loading) return <ProfileSkeleton />;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        onClick={fetchAnalytics}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    📊 Reading Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Insights into your reading habits and preferences
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* Total Reading Time */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Total Reading Time</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{formatTime(analytics.overview.total_reading_time)}</p>
                    <p className="text-sm opacity-80 mt-1">All time</p>
                </div>

                {/* Reading Streak */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Current Streak</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{analytics.streak.current_streak}</p>
                    <p className="text-sm opacity-80 mt-1">
                        {analytics.streak.current_streak === 1 ? 'day' : 'days'} 🔥
                    </p>
                </div>

                {/* Total Bookmarks */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Bookmarks</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{analytics.overview.total_bookmarks}</p>
                    <p className="text-sm opacity-80 mt-1">Saved articles</p>
                </div>

                {/* Total Notes */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Notes</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{analytics.overview.total_notes}</p>
                    <p className="text-sm opacity-80 mt-1">Created</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
                            activeTab === 'trends'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Trends
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
                            activeTab === 'preferences'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Preferences
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    
                    {/* Reading Streak Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            🔥 Reading Streak
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                                    {analytics.streak.current_streak}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {analytics.streak.current_streak === 1 ? 'day' : 'days'}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Streak</p>
                                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    {analytics.streak.longest_streak}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {analytics.streak.longest_streak === 1 ? 'day' : 'days'}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Active</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {analytics.streak.last_read_date
                                        ? format(parseISO(analytics.streak.last_read_date), 'MMM d')
                                        : 'Never'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {analytics.streak.last_read_date
                                        ? format(parseISO(analytics.streak.last_read_date), 'yyyy')
                                        : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            📅 This Week
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Reading Time</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatTime(analytics.overview.weekly_reading_time)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Articles Read</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {analytics.overview.weekly_articles}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'trends' && (
                <div className="space-y-6">
                    
                    {/* Reading Time Trend */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            📈 Reading Time (Last 30 Days)
                        </h2>
                        {analytics.reading_trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics.reading_trends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                                        stroke="#9CA3AF"
                                    />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#F3F4F6'
                                        }}
                                        labelFormatter={(date) => format(parseISO(date), 'MMM d, yyyy')}
                                        formatter={(value, name) => {
                                            if (name === 'time_spent') return [formatTime(value), 'Reading Time'];
                                            return [value, 'Articles'];
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="time_spent"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        name="Reading Time (s)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="articles_read"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        name="Articles"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p>No reading data available for the last 30 days</p>
                                <p className="text-sm mt-2">Start reading articles to see your trends!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'preferences' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Category Breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            🎯 Top Categories
                        </h2>
                        {analytics.categories.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={analytics.categories}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {analytics.categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2">
                                    {analytics.categories.map((cat, index) => (
                                        <div key={cat.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                                            </div>
                                            <span className="text-gray-500 dark:text-gray-400">{cat.count} articles</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p>No category data available</p>
                                <p className="text-sm mt-2">Bookmark articles to see your preferences!</p>
                            </div>
                        )}
                    </div>

                    {/* Source Breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            📰 Top Sources
                        </h2>
                        {analytics.sources.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={analytics.sources}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#F3F4F6'
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#3B82F6" />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2">
                                    {analytics.sources.map((source) => (
                                        <div key={source.id} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 dark:text-gray-300">{source.name}</span>
                                            <span className="text-gray-500 dark:text-gray-400">{source.count} articles</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p>No source data available</p>
                                <p className="text-sm mt-2">Bookmark articles to see your preferences!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

export default AnalyticsPage;
