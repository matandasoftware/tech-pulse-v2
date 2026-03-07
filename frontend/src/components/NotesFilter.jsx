/**
 * NotesFilter Component
 * 
 * Filter sidebar for NotesPage.
 * Allows users to filter notes by multiple criteria.
 * 
 * Filters Available:
 * - Search: Search in note content and article titles
 * - Source: Filter by article source (TechCrunch, Verge, etc.)
 * - Category: Filter by article category (AI, Web Dev, etc.)
 * - Pending Follow-ups: Show only notes with pending follow-ups
 * - Has Links: Show only notes with external links
 * - Date Range: Filter by creation date (from/to)
 * 
 * Props:
 * - filters: Current filter state object
 * - onFilterChange: Callback when filters change
 * - onReset: Callback to reset all filters
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

function NotesFilter({ filters, onFilterChange, onReset }) {
    const [sources, setSources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch sources and categories on mount
     */
    useEffect(() => {
        fetchSourcesAndCategories();
    }, []);

    /**
     * Fetch available sources and categories from API
     */
    const fetchSourcesAndCategories = async () => {
        setLoading(true);
        try {
            const [sourcesRes, categoriesRes] = await Promise.all([
                api.get('/sources/'),
                api.get('/categories/')
            ]);

            setSources(sourcesRes.data.results || sourcesRes.data);
            setCategories(categoriesRes.data.results || categoriesRes.data);
        } catch (err) {
            console.error('Error fetching filters:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle filter value change
     * @param {string} filterName - Name of the filter
     * @param {any} value - New value
     */
    const handleChange = (filterName, value) => {
        onFilterChange({
            ...filters,
            [filterName]: value
        });
    };

    /**
     * Check if any filters are active
     * @returns {boolean} True if any filter is set
     */
    const hasActiveFilters = () => {
        return Object.values(filters).some(value => {
            if (typeof value === 'boolean') return value;
            return value !== null && value !== '';
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Filters
                </h3>
                {hasActiveFilters() && (
                    <button
                        onClick={onReset}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        Reset All
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
            ) : (
                <div className="space-y-4">

                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            🔍 Search
                        </label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            placeholder="Search notes or articles..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Source Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            📡 Source
                        </label>
                        <select
                            value={filters.source || ''}
                            onChange={(e) => handleChange('source', e.target.value || null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        >
                            <option value="">All Sources</option>
                            {sources.map(source => (
                                <option key={source.id} value={source.id}>
                                    {source.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            📂 Category
                        </label>
                        <select
                            value={filters.category || ''}
                            onChange={(e) => handleChange('category', e.target.value || null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Checkbox Filters */}
                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">

                        {/* Pending Follow-ups Only */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.pendingOnly}
                                onChange={(e) => handleChange('pendingOnly', e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                ⏰ Pending Follow-ups Only
                            </span>
                        </label>

                        {/* Has Links Only */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.hasLinks}
                                onChange={(e) => handleChange('hasLinks', e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                🔗 Has Links Only
                            </span>
                        </label>
                    </div>

                    {/* Date Range Filters */}
                    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">

                        {/* From Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                📅 From Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={(e) => handleChange('dateFrom', e.target.value || null)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                📅 To Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo || ''}
                                onChange={(e) => handleChange('dateTo', e.target.value || null)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {/* Active Filters Count */}
                    {hasActiveFilters() && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                {Object.values(filters).filter(v => {
                                    if (typeof v === 'boolean') return v;
                                    return v !== null && v !== '';
                                }).length} filter(s) active
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotesFilter;