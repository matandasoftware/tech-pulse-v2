/**
 * Navbar Component
 * 
 * Main navigation bar displayed at the top of all protected pages.
 * 
 * IMPORTANT: Uses useLocation() to track current route for highlighting active links.
 * The component re-renders whenever location.pathname changes.
 */

import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    // Get current user and logout function from Auth context
    const { user, logout } = useAuth();

    // Get dark mode state and toggle function from DarkMode context
    const { darkMode, toggleDarkMode } = useDarkMode();

    // Get current URL location - this updates when route changes
    const location = useLocation();

    /**
     * Check if a route is currently active
     * 
     * @param {string} path - Route path to check
     * @returns {boolean} True if current route matches
     */
    const isActive = (path) => {
        // Direct comparison - pathname already clean from React Router
        return location.pathname === path;
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* LEFT SIDE: Logo and Navigation Links */}
                    <div className="flex items-center space-x-8">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                Tech Pulse
                            </h1>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex space-x-4">

                            {/* HOME LINK */}
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Home
                            </Link>

                            {/* BOOKMARKS LINK */}
                            <Link
                                to="/bookmarks"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive('/bookmarks')
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                Bookmarks
                            </Link>

                            {/* NOTES LINK */}
                            <Link
                                to="/notes"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive('/notes')
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Notes
                            </Link>

                            {/* DASHBOARD LINK */}
                            <Link
                                to="/dashboard"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Dashboard
                            </Link>

                            {/* PROFILE LINK */}
                            <Link
                                to="/profile"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile')
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Profile
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Dark mode, User, Logout */}
                    <div className="flex items-center space-x-4">

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? (
                                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* User info and logout */}
                        {user && (
                            <div className="flex items-center space-x-3">
                                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                                    👤 {user.username}
                                </span>

                                <button
                                    onClick={logout}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;