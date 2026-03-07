/**
 * NoteItem Component
 * 
 * Displays a single note with beautiful styling and full features.
 * 
 * Features:
 * - Color-coded status badges
 * - Multiple external links display
 * - Reviewed status
 * - Follow-up tracking
 * - Edit/Delete actions
 */

import { useState } from 'react';
import api from '../services/api';

function NoteItem({ note, onEdit, onDelete }) {
    const [markingDone, setMarkingDone] = useState(false);
    const [togglingReview, setTogglingReview] = useState(false);

    /**
     * Format date to readable string
     */
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Format date (short version)
     */
    const formatDateShort = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    /**
     * Handle mark follow-up as done
     */
    const handleMarkDone = async () => {
        setMarkingDone(true);

        try {
            await api.patch(`/notes/${note.id}/`, {
                follow_up_done: true
            });
            window.location.reload(); // Reload to refresh notes
        } catch (err) {
            console.error('Mark done error:', err);
            alert('Failed to mark follow-up as done');
        } finally {
            setMarkingDone(false);
        }
    };

    /**
     * Handle toggle reviewed status
     */
    const handleToggleReview = async () => {
        setTogglingReview(true);

        try {
            await api.patch(`/notes/${note.id}/`, {
                is_reviewed: !note.is_reviewed
            });
            window.location.reload(); // Reload to refresh notes
        } catch (err) {
            console.error('Toggle review error:', err);
            alert('Failed to update review status');
        } finally {
            setTogglingReview(false);
        }
    };

    /**
     * Handle delete note
     */
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await api.delete(`/notes/${note.id}/`);
            onDelete(note.id);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete note');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all">

            {/* Status Badges Row */}
            <div className="flex flex-wrap gap-2 mb-4">
                {/* Reviewed Badge */}
                {note.is_reviewed && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                        ✅ Reviewed
                    </span>
                )}

                {/* Follow-up Badge */}
                {note.has_follow_up && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${note.follow_up_done
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
                        }`}>
                        {note.follow_up_done ? '✅ Follow-up Done' : '⏳ Pending Follow-up'}
                    </span>
                )}

                {/* Follow-up Date */}
                {note.has_follow_up && note.follow_up_date && !note.follow_up_done && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
                        📅 Due: {formatDateShort(note.follow_up_date)}
                    </span>
                )}
            </div>

            {/* Note Content */}
            <p className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap leading-relaxed">
                {note.content}
            </p>

            {/* External Links */}
            {note.external_links && note.external_links.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        🔗 External References:
                    </p>
                    <div className="space-y-1">
                        {note.external_links.map((link, index) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline truncate"
                            >
                                • {link}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span>📅 Created: {formatDate(note.created_at)}</span>
                {note.updated_at !== note.created_at && (
                    <span>✏️ Updated: {formatDate(note.updated_at)}</span>
                )}
            </div>

            {/* Quick Actions */}
            {note.has_follow_up && !note.follow_up_done && (
                <div className="mb-3">
                    <button
                        onClick={handleMarkDone}
                        disabled={markingDone}
                        className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {markingDone ? '⏳ Marking...' : '✅ Mark Follow-up as Done'}
                    </button>
                </div>
            )}

            {/* Actions Row */}
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(note)}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    ✏️ Edit
                </button>
                <button
                    onClick={handleToggleReview}
                    disabled={togglingReview}
                    className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors font-medium ${note.is_reviewed
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                >
                    {togglingReview ? '...' : (note.is_reviewed ? '↩️ Unreviewed' : '✅ Reviewed')}
                </button>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}

export default NoteItem;