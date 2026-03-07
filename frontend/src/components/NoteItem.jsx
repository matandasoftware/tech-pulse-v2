/**
 * NoteItem Component
 * 
 * Displays a single note card with metadata, content, and action buttons.
 * 
 * Features:
 * - Shows note content with reviewed and follow-up status
 * - Displays article title and metadata (source, category, date)
 * - Action buttons: Edit, Mark as Reviewed, Mark Follow-up Done, Delete
 * - External reference links
 * - Article title is clickable (opens in new tab)
 * - Note content is NOT clickable (prevents accidental navigation)
 */

import { useState } from 'react';
import { format } from 'date-fns';
import api from '../services/api';

function NoteItem({ note, onUpdate, onDelete, onEdit, compact = false }) {
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);

    /**
     * Handle marking note as reviewed/unreviewed
     * Toggles the is_reviewed status
     */
    const handleToggleReviewed = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (updating) return;

        setUpdating(true);

        try {
            const response = await api.patch(`/notes/${note.id}/`, {
                is_reviewed: !note.is_reviewed
            });

            // Notify parent component of update
            if (onUpdate) {
                onUpdate(note.id, response.data);
            }
        } catch (err) {
            console.error('Error updating note:', err);
            alert('Failed to update note');
        } finally {
            setUpdating(false);
        }
    };

    /**
     * Handle marking follow-up as done/undone
     * Toggles the follow_up_done status
     */
    const handleToggleFollowUp = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (updating) return;

        setUpdating(true);

        try {
            const response = await api.patch(`/notes/${note.id}/`, {
                follow_up_done: !note.follow_up_done
            });

            // Notify parent component of update
            if (onUpdate) {
                onUpdate(note.id, response.data);
            }
        } catch (err) {
            console.error('Error updating note:', err);
            alert('Failed to update note');
        } finally {
            setUpdating(false);
        }
    };

    /**
     * Handle note deletion
     * Shows confirmation before deleting
     */
    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (deleting) return;

        if (!window.confirm('Are you sure you want to delete this note?')) {
            return;
        }

        setDeleting(true);

        try {
            await api.delete(`/notes/${note.id}/`);

            // Notify parent component of deletion
            if (onDelete) {
                onDelete(note.id);
            }
        } catch (err) {
            console.error('Error deleting note:', err);
            alert('Failed to delete note');
        } finally {
            setDeleting(false);
        }
    };

    /**
     * Handle edit button click
     */
    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onEdit) {
            onEdit(note);
        }
    };

    /**
     * Format date to readable string
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date (e.g., "Mar 6, 2026 7:35 PM")
     */
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy h:mm a');
        } catch {
            return dateString;
        }
    };

    /**
     * Format follow-up date
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date (e.g., "Mar 7, 2026")
     */
    const formatFollowUpDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">

            {/* Article Title and Metadata - CLICKABLE */}
            <div className="mb-3">
                <a
                    href={note.article?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 transition-colors"
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400">
                        📰 {note.article?.title || 'Article'}
                    </h3>

                    {/* Metadata Badges */}
                    {!compact && (
                        <div className="flex flex-wrap gap-2 text-xs">
                            {/* Source Badge */}
                            {note.article?.source && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                    {note.article.source.name}
                                </span>
                            )}

                            {/* Category Badge */}
                            {note.article?.category && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                    {note.article.category.name}
                                </span>
                            )}
                        </div>
                    )}
                </a>
            </div>

            {/* Note Content - NOT CLICKABLE */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    💬 {note.content}
                </p>
            </div>

            {/* Status Badges */}
            <div className="space-y-2 mb-3">
                {/* Reviewed Badge */}
                {note.is_reviewed && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <span className="text-sm">
                            ✓ Reviewed
                        </span>
                    </div>
                )}

                {/* Follow-up Badge */}
                {note.has_follow_up && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${note.follow_up_done
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                        }`}>
                        <span className="text-sm">
                            {note.follow_up_done ? '✅' : '⏰'} Follow-up: {formatFollowUpDate(note.follow_up_date)}
                        </span>
                        {note.follow_up_done && (
                            <span className="text-xs font-semibold">DONE</span>
                        )}
                    </div>
                )}
            </div>

            {/* External Reference Links */}
            {note.external_links && note.external_links.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        🔗 References:
                    </p>
                    <div className="space-y-1">
                        {note.external_links.map((link, index) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-primary-600 dark:text-primary-400 hover:underline truncate"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                🕒 {formatDate(note.created_at)}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">

                {/* Edit Button */}
                {onEdit && (
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Edit
                    </button>
                )}

                {/* Mark as Reviewed / Unreviewed Button */}
                <button
                    type="button"
                    onClick={handleToggleReviewed}
                    disabled={updating}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 ${note.is_reviewed
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                >
                    {updating ? 'Updating...' : (note.is_reviewed ? 'Mark Unreviewed' : 'Mark as Reviewed')}
                </button>

                {/* Mark Follow-up Done / Pending Button (only if has follow-up) */}
                {note.has_follow_up && (
                    <button
                        type="button"
                        onClick={handleToggleFollowUp}
                        disabled={updating}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 ${note.follow_up_done
                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {updating ? 'Updating...' : (note.follow_up_done ? 'Mark Pending' : 'Mark Follow-up Done')}
                    </button>
                )}

                {/* Delete Button */}
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
}

export default NoteItem;