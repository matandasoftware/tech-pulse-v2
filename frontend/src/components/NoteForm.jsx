/**
 * NoteForm Component
 * 
 * Form for creating or editing a note on an article.
 * Includes follow-up tracking and external link management.
 * 
 * Features:
 * - Create new notes or edit existing ones
 * - Add/remove external reference links with validation
 * - Optional follow-up date tracking
 * - Visual feedback for link removal
 */

import { useState } from 'react';
import api from '../services/api';

function NoteForm({ article, existingNote = null, onSave, onCancel }) {
    // Determine if editing or creating
    const isEditing = existingNote !== null;

    // Form state
    const [content, setContent] = useState(existingNote?.content || '');
    const [hasFollowUp, setHasFollowUp] = useState(existingNote?.has_follow_up || false);
    const [followUpDate, setFollowUpDate] = useState(existingNote?.follow_up_date || '');
    const [links, setLinks] = useState(existingNote?.external_links || []);
    const [newLink, setNewLink] = useState('');

    // UI state
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Add a new link to the links array
     * Validates URL format and prevents duplicates
     */
    const handleAddLink = () => {
        const trimmedLink = newLink.trim();

        // Validation: Link must not be empty
        if (!trimmedLink) {
            alert('Please enter a URL');
            return;
        }

        // Validation: Link must start with http:// or https://
        if (!trimmedLink.startsWith('http://') && !trimmedLink.startsWith('https://')) {
            alert('URL must start with http:// or https://');
            return;
        }

        // Validation: Prevent duplicate links
        if (links.includes(trimmedLink)) {
            alert('This link is already added');
            return;
        }

        // Add link to array
        setLinks([...links, trimmedLink]);
        setNewLink('');
    };

    /**
     * Remove a link from the links array with visual feedback
     * 
     * @param {number} index - Index of link to remove
     */
    const handleRemoveLink = (index) => {
        const linkToRemove = links[index];

        // Remove link
        setLinks(links.filter((_, i) => i !== index));

        // Log for debugging (visual feedback)
        console.log(`✓ Removed link: ${linkToRemove}`);
    };

    /**
     * Handle form submission
     * Creates new note or updates existing note
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation: Content is required
        if (!content.trim()) {
            setError('Note content is required');
            return;
        }

        // Validation: If follow-up enabled, date is required
        if (hasFollowUp && !followUpDate) {
            setError('Follow-up date is required when follow-up is enabled');
            return;
        }

        setSaving(true);

        try {
            // Build note data object
            const noteData = {
                content: content.trim(),
                has_follow_up: hasFollowUp,
                follow_up_date: hasFollowUp ? followUpDate : null,
                follow_up_done: existingNote?.follow_up_done || false,
                external_links: links.length > 0 ? links : null,
            };

            // Add article ID only when creating (not editing)
            if (!isEditing) {
                noteData.article_id = article.id;
            }

            // DEBUG: Log what we're sending
            console.log('=== NOTE FORM DEBUG ===');
            console.log('Article:', article);
            console.log('Article ID:', article.id);
            console.log('Links:', links);
            console.log('Note data:', noteData);
            console.log('Is editing:', isEditing);

            let savedNote;

            if (isEditing) {
                // UPDATE existing note
                console.log('Updating note...');
                const response = await api.patch(`/notes/${existingNote.id}/`, noteData);
                savedNote = response.data;
            } else {
                // CREATE new note
                console.log('Creating new note...');
                const response = await api.post('/notes/', noteData);
                savedNote = response.data;
                console.log('Response:', savedNote);
            }

            // Call onSave callback
            onSave(savedNote);

        } catch (err) {
            console.error('=== ERROR DETAILS ===');
            console.error('Full error:', err);
            console.error('Response data:', err.response?.data);
            console.error('Response status:', err.response?.status);

            // Extract error message
            const errorMessage = err.response?.data?.detail
                || err.response?.data?.message
                || JSON.stringify(err.response?.data)
                || err.message
                || 'Failed to save note';

            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    /**
     * Handle follow-up toggle
     * Clears date when disabled
     */
    const handleFollowUpToggle = (checked) => {
        setHasFollowUp(checked);
        if (!checked) {
            setFollowUpDate('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                        ⚠️ {error}
                    </p>
                </div>
            )}

            {/* Note Content */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Note Content
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={5}
                    required
                />
            </div>

            {/* Follow-up Toggle */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="hasFollowUp"
                    checked={hasFollowUp}
                    onChange={(e) => handleFollowUpToggle(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label htmlFor="hasFollowUp" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Needs follow-up?
                </label>
            </div>

            {/* Follow-up Date */}
            {hasFollowUp && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Follow-up Date
                    </label>
                    <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required={hasFollowUp}
                    />
                </div>
            )}

            {/* External Links Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reference Links (optional)
                </label>

                {/* Add Link Input */}
                <div className="flex gap-2 mb-2">
                    <input
                        type="url"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddLink();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                        Add
                    </button>
                </div>

                {/* Links List */}
                {links.length > 0 && (
                    <div className="space-y-1">
                        {links.map((link, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg"
                            >
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline truncate flex-1"
                                >
                                    {link}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveLink(index)}
                                    className="ml-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-2 py-1 transition-colors"
                                    title="Remove this link"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {saving ? 'Saving...' : (isEditing ? 'Update Note' : 'Save Note')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default NoteForm;