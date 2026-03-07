/**
 * NotesPanel Component
 * 
 * Sliding side panel that displays notes for a specific article.
 * Slides in from the right, occupying 50% width on desktop, full width on mobile.
 * 
 * Features:
 * - Slides in/out with smooth animation (300ms)
 * - Shows article title at top
 * - Lists all notes for the article (newest first)
 * - Notes separated by diagonal date dividers
 * - Add new note form (collapsible)
 * - Edit existing notes inline
 * - Close button and click-outside-to-close
 * - Auto-updates notes count in ArticleCard via custom events
 * 
 * State Management:
 * - Uses NotesPanelContext for global state
 * - Automatically fetches notes when opened
 * - Refreshes after add/edit/delete
 * - Dispatches 'notesChanged' event to update ArticleCard badge
 */

import { useState, useEffect, useRef } from 'react';
import { useNotesPanel } from '../context/NotesPanelContext';
import NoteItem from './NoteItem';
import NoteForm from './NoteForm';
import { format, isSameDay } from 'date-fns';

function NotesPanel() {
    // Get panel state and functions from context
    const {
        isPanelOpen,
        selectedArticle,
        notes,
        loading,
        error,
        closePanel,
        refreshNotes,
        addNoteLocally,
        updateNoteLocally,
        deleteNoteLocally,
    } = useNotesPanel();

    // Local state for showing add note form
    const [showAddForm, setShowAddForm] = useState(false);

    // Local state for editing note (stores note being edited)
    const [editingNote, setEditingNote] = useState(null);

    // Ref to panel element for click-outside detection
    const panelRef = useRef(null);

    /**
     * Handle click outside panel to close it
     * Only listens when panel is open
     */
    useEffect(() => {
        if (!isPanelOpen) return;

        const handleClickOutside = (event) => {
            // If click is outside panel element, close panel
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                closePanel();
            }
        };

        // Add event listener after a small delay (prevents immediate close on open)
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        // Cleanup: Remove event listener when panel closes
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPanelOpen, closePanel]);

    /**
     * Handle ESC key to close panel
     */
    useEffect(() => {
        if (!isPanelOpen) return;

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                closePanel();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isPanelOpen, closePanel]);

    /**
     * Handle note save (create or update)
     * Called from NoteForm component
     * 
     * @param {object} savedNote - Note object returned from API
     */
    const handleNoteSave = (savedNote) => {
        if (editingNote) {
            // UPDATE: Update note in local state
            updateNoteLocally(editingNote.id, savedNote);
            setEditingNote(null);
        } else {
            // CREATE: Add note to local state
            addNoteLocally(savedNote);
            setShowAddForm(false);
        }

        // Refresh notes from server to ensure sync
        refreshNotes();

        // Dispatch custom event to update notes count in ArticleCard
        window.dispatchEvent(new CustomEvent('notesChanged', {
            detail: { articleId: selectedArticle?.id }
        }));
    };

    /**
     * Handle note update (e.g., mark follow-up done)
     * 
     * @param {number} noteId - ID of note to update
     * @param {object} updates - Fields to update
     */
    const handleNoteUpdate = async (noteId, updates) => {
        // Optimistically update local state
        updateNoteLocally(noteId, updates);

        // Refresh from server to confirm
        refreshNotes();
    };

    /**
     * Handle note delete
     * 
     * @param {number} noteId - ID of note to delete
     */
    const handleNoteDelete = async (noteId) => {
        // Optimistically remove from local state
        deleteNoteLocally(noteId);

        // Refresh from server to confirm
        refreshNotes();

        // Dispatch custom event to update notes count in ArticleCard
        window.dispatchEvent(new CustomEvent('notesChanged', {
            detail: { articleId: selectedArticle?.id }
        }));
    };

    /**
     * Handle edit button click
     * Opens form with existing note data
     * 
     * @param {object} note - Note to edit
     */
    const handleEditNote = (note) => {
        setEditingNote(note);
        setShowAddForm(false); // Hide add form if open
    };

    /**
     * Group notes by date for diagonal separators
     * 
     * @returns {Array} Array of { date, notes } objects
     */
    const groupNotesByDate = () => {
        const groups = [];
        let currentDate = null;
        let currentGroup = [];

        notes.forEach(note => {
            const noteDate = new Date(note.created_at);

            if (!currentDate || !isSameDay(currentDate, noteDate)) {
                // New date group - save previous group if exists
                if (currentGroup.length > 0) {
                    groups.push({
                        date: currentDate,
                        notes: currentGroup
                    });
                }

                // Start new group
                currentDate = noteDate;
                currentGroup = [note];
            } else {
                // Same date - add to current group
                currentGroup.push(note);
            }
        });

        // Add last group
        if (currentGroup.length > 0) {
            groups.push({
                date: currentDate,
                notes: currentGroup
            });
        }

        return groups;
    };

    /**
     * Format date for diagonal separator
     * 
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    const formatDateSeparator = (date) => {
        try {
            return format(date, 'MMMM d, yyyy');
        } catch {
            return date.toLocaleDateString();
        }
    };

    // Don't render anything if panel is not open
    if (!isPanelOpen) return null;

    const noteGroups = groupNotesByDate();

    return (
        <>
            {/* Backdrop - darkens the rest of the screen */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${isPanelOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Side Panel */}
            <div
                ref={panelRef}
                className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                    } w-full md:w-1/2 lg:w-2/5`}
            >
                {/* HEADER */}
                <div className="bg-primary-600 dark:bg-primary-700 text-white p-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold truncate">
                            📝 Notes
                        </h2>
                        {selectedArticle && (
                            <p className="text-sm text-primary-100 dark:text-primary-200 truncate">
                                {selectedArticle.title}
                            </p>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={closePanel}
                        className="ml-4 p-2 hover:bg-primary-700 dark:hover:bg-primary-600 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Close panel"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* BODY - Scrollable Notes List */}
                <div className="flex-1 overflow-y-auto p-4">

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                            <p className="text-red-600 dark:text-red-400">
                                ⚠️ {error}
                            </p>
                            <button
                                onClick={refreshNotes}
                                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Edit Note Form */}
                    {editingNote && (
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                ✏️ Edit Note
                            </h3>
                            <NoteForm
                                article={selectedArticle}
                                existingNote={editingNote}
                                onSave={handleNoteSave}
                                onCancel={() => setEditingNote(null)}
                            />
                        </div>
                    )}

                    {/* Add Note Form */}
                    {showAddForm && !editingNote && (
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                ✍️ Add New Note
                            </h3>
                            <NoteForm
                                article={selectedArticle}
                                onSave={handleNoteSave}
                                onCancel={() => setShowAddForm(false)}
                            />
                        </div>
                    )}

                    {/* Notes List (Grouped by Date) */}
                    {!loading && !error && !editingNote && noteGroups.length > 0 && (
                        <div className="space-y-6">
                            {noteGroups.map((group, groupIndex) => (
                                <div key={groupIndex}>

                                    {/* Diagonal Date Separator */}
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t-2 border-gray-300 dark:border-gray-600"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white dark:bg-gray-800 px-4 py-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {formatDateSeparator(group.date)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notes for this Date */}
                                    <div className="space-y-3">
                                        {group.notes.map(note => (
                                            <NoteItem
                                                key={note.id}
                                                note={note}
                                                onUpdate={handleNoteUpdate}
                                                onDelete={handleNoteDelete}
                                                onEdit={() => handleEditNote(note)}
                                                compact={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && notes.length === 0 && !showAddForm && !editingNote && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No notes yet for this article
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Add First Note
                            </button>
                        </div>
                    )}
                </div>

                {/* FOOTER - Add Note Button */}
                {!showAddForm && !editingNote && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Note
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default NotesPanel;