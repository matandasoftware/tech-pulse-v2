/**
 * ProfilePage Component
 * 
 * Displays user profile information and statistics.
 * Allows users to update their profile and change password.
 * 
 * Features:
 * - User info display (username, email, joined date)
 * - Reading statistics (bookmarks, notes, reading time)
 * - Profile editing (email, name)
 * - Password change
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: ''
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [successMessage, setSuccessMessage] = useState('');

    /**
     * Fetch user profile on mount
     */
    useEffect(() => {
        fetchProfile();
    }, []);

    /**
     * Fetch profile data from API
     */
    const fetchProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/auth/profile/');
            setProfile(response.data);
            setFormData({
                email: response.data.email || '',
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || ''
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load profile');
            console.error('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle profile update
     */
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        try {
            const response = await api.patch('/auth/profile/', formData);
            setProfile(response.data);
            setEditing(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile');
        }
    };

    /**
     * Handle password change
     */
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        try {
            await api.post('/auth/change-password/', passwordData);
            setChangingPassword(false);
            setPasswordData({
                old_password: '',
                new_password: '',
                confirm_password: ''
            });
            setSuccessMessage('Password changed successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.old_password || 'Failed to change password');
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

    /**
     * Format date
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-400">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        My Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Manage your account and view your reading statistics
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-green-600 dark:text-green-400">✅ {successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
                    </div>
                )}

                {/* Profile Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Profile Information
                        </h2>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        setFormData({
                                            email: profile.email || '',
                                            first_name: profile.first_name || '',
                                            last_name: profile.last_name || ''
                                        });
                                    }}
                                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {profile?.username}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {profile?.email || 'Not set'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">First Name</p>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {profile?.first_name || 'Not set'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Name</p>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {profile?.last_name || 'Not set'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {formatDate(profile?.date_joined)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistics Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Reading Statistics
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {profile?.total_bookmarks || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Bookmarks
                            </p>
                        </div>

                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {profile?.total_notes || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Notes
                            </p>
                        </div>

                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {profile?.total_articles_read || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Articles Read
                            </p>
                        </div>

                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {formatReadingTime(profile?.total_reading_time || 0)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Reading Time
                            </p>
                        </div>

                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {profile?.pending_followups || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Pending Follow-ups
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Change Password
                        </h2>
                        {!changingPassword && (
                            <button
                                onClick={() => setChangingPassword(true)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Change Password
                            </button>
                        )}
                    </div>

                    {changingPassword && (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.old_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    At least 8 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Update Password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setChangingPassword(false);
                                        setPasswordData({
                                            old_password: '',
                                            new_password: '',
                                            confirm_password: ''
                                        });
                                    }}
                                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ProfilePage;