/**
 * NoteForm Component
 * 
 * Form for creating or editing a note with full features.
 * 
 * Features:
 * - Create/edit note content
 * - Toggle follow-up tracking with date
 * - Add multiple external links
 * - Mark as reviewed
 * - Beautiful color-coded UI
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

function NoteForm({ article, note, onNoteCreated, onNoteUpdated, onCancel }) {
    const [formData, setFormData] = useState({
        content: '',
        has_follow_up: false,
        follow_up_date: '',
        is_reviewed: false,
        external_links: [],
    });
    const [newLink, setNewLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Initialize form with existing note data
     */
    useEffect(() => {
        if (note) {
            setFormData({
                content: note.content || '',
                has_follow_up: note.has_follow_up || false,
                follow_up_date: note.follow_up_date ? note.follow_up_date.split('T')[0] : '',
                is_reviewed: note.is_reviewed || false,
                external_links: note.external_links || [],
            });
        }
    }, [note]);

    /**
     * Add external link to list
     */
    const handleAddLink = () => {
        if (!newLink.trim()) return;

        // Basic URL validation
        try {
            new URL(newLink);
            setFormData({
                ...formData,
                external_links: [...formData.external_links, newLink]
            });
            setNewLink('');
        } catch (err) {
            alert('Please enter a valid URL (e.g., https://example.com)');
        }
    };

    /**
     * Remove external link
     */
    const handleRemoveLink = (index) => {
        setFormData({
            ...formData,
            external_links: formData.external_links.filter((_, i) => i !== index)
        });
    };

    /**
     * Handle form submit
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                article_id: article.id,
                content: formData.content,
                has_follow_up: formData.has_follow_up,
                follow_up_date: formData.has_follow_up && formData.follow_up_date
                    ? formData.follow_up_date
                    : null,
                is_reviewed: formData.is_reviewed,
                external_links: formData.external_links.length > 0 ? formData.external_links : [],
            };

            if (note) {
                // Update existing note
                const response = await api.patch(`/notes/${note.id}/`, payload);
                onNoteUpdated(response.data);
            } else {
                // Create new note
                const response = await api.post('/notes/', payload);
                onNoteCreated(response.data);

                // Reset form
                setFormData({
                    content: '',
                    has_follow_up: false,
                    follow_up_date: '',
                    is_reviewed: false,
                    external_links: [],
                });
                setNewLink('');
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.content?.[0] || 'Failed to save note');
            console.error('Note save error:', err.response?.data);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-blue-200 dark:border-gray-700 shadow-lg">

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {note ? '✏️ Edit Note' : '📝 New Note'}
            </h3>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">⚠️ {error}</p>
                </div>
            )}

            {/* Note Content */}
            <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Note Content *
                </label>
                <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={6}
                    placeholder="Write your thoughts, key takeaways, questions, or action items..."
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
            </div>

            {/* External Links Section */}
            <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🔗 External Links
                </label>

                {/* Link Input */}
                <div className="flex gap-2 mb-3">
                    <input
                        type="url"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddLink();
                            }
                        }}
                        placeholder="https://example.com"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        + Add
                    </button>
                </div>

                {/* Links List */}
                {formData.external_links.length > 0 && (
                    <div className="space-y-2">
                        {formData.external_links.map((link, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group"
                            >
                                <span className="flex-1 text-sm text-blue-700 dark:text-blue-300 truncate">
                                    {link}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveLink(index)}
                                    className="flex-shrink-0 text-red-500 hover:text-red-700 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Follow-up Section */}
            <div className="mb-5 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <label className="flex items-center cursor-pointer mb-3">
                    <input
                        type="checkbox"
                        checked={formData.has_follow_up}
                        onChange={(e) => setFormData({
                            ...formData,
                            has_follow_up: e.target.checked,
                            follow_up_date: e.target.checked ? formData.follow_up_date : ''
                        })}
                        className="w-5 h-5 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
                    />
                    <span className="ml-3 text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                        ⏳ This note requires follow-up
                    </span>
                </label>

                {/* Follow-up Date (conditional) */}
                {formData.has_follow_up && (
                    <div>
                        <label className="block text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                            Follow-up Date
                        </label>
                        <input
                            type="date"
                            value={formData.follow_up_date}
                            onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                    </div>
                )}
            </div>

            {/* Reviewed Checkbox */}
            <div className="mb-5">
                <label className="flex items-center cursor-pointer p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <input
                        type="checkbox"
                        checked={formData.is_reviewed}
                        onChange={(e) => setFormData({ ...formData, is_reviewed: e.target.checked })}
                        className="w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-3 text-sm font-semibold text-green-900 dark:text-green-200">
                        ✅ Mark as reviewed
                    </span>
                </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? '💾 Saving...' : (note ? '💾 Update Note' : '💾 Save Note')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-semibold"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default NoteForm;