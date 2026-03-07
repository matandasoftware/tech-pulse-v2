/**
 * NotesPage Component
 * 
 * Displays ALL notes from ALL articles in chronological order (latest first).
 * Each note is separated by a horizontal line.
 * 
 * Features:
 * - Timeline view of all notes
 * - Filter by source, category, pending follow-ups, has links, date range
 * - Search notes and article titles
 * - Edit/delete notes inline
 * - Quick mark follow-up as done
 * - Click article title to open in new tab
 * - Inline note editing with NoteForm
 * 
 * Layout:
 * - Left: Filter sidebar (collapsible on mobile)
 * - Right: Notes timeline with horizontal separators
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import NoteItem from '../components/NoteItem';
import NoteForm from '../components/NoteForm';
import NotesFilter from '../components/NotesFilter';

function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle
    const [editingNote, setEditingNote] = useState(null); // Note being edited

    // Filter state
    const [filters, setFilters] = useState({
        source: null,
        category: null,
        pendingOnly: false,
        hasLinks: false,
        dateFrom: null,
        dateTo: null,
        search: '',
    });

    /**
     * Fetch notes on mount and when filters change
     */
    useEffect(() => {
        fetchNotes();
    }, [filters]);

    /**
     * Fetch all notes from API with current filters applied
     */
    const fetchNotes = async () => {
        setLoading(true);
        setError(null);

        try {
            // Build query params from filters
            const params = {};

            if (filters.source) params.article__source = filters.source;
            if (filters.category) params.article__category = filters.category;
            if (filters.pendingOnly) {
                params.has_follow_up = true;
                params.follow_up_done = false;
            }
            if (filters.search) params.search = filters.search;
            if (filters.dateFrom) params.created_after = filters.dateFrom;
            if (filters.dateTo) params.created_before = filters.dateTo;

            const response = await api.get('/notes/', { params });
            let fetchedNotes = response.data.results || response.data;
            // ===== ADD THIS DEBUG CODE =====
            console.log('=== FETCHED NOTES DEBUG ===');
            console.log('Total notes:', fetchedNotes.length);
            console.log('First note:', fetchedNotes[0]);
            console.log('First note ID:', fetchedNotes[0]?.id);
            console.log('First note has_follow_up:', fetchedNotes[0]?.has_follow_up);
            console.log('First note follow_up_date:', fetchedNotes[0]?.follow_up_date);
            console.log('First note external_links:', fetchedNotes[0]?.external_links);
            console.log('First note article:', fetchedNotes[0]?.article?.title);
            // ===== END DEBUG CODE =====

            // Client-side filter for notes with links
            if (filters.hasLinks) {
                fetchedNotes = fetchedNotes.filter(note =>
                    note.external_links && note.external_links.length > 0
                );
            }

            setNotes(fetchedNotes);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle filter changes from NotesFilter component
     * @param {object} newFilters - Updated filter values
     */
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    /**
     * Handle note update (from inline actions like mark done)
     * @param {number} noteId - ID of updated note
     * @param {object} updatedNote - Complete updated note object
     */
    const handleNoteUpdate = (noteId, updatedNote) => {
        // Update local state with new note data
        setNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === noteId ? updatedNote : note
            )
        );
    };

    /**
     * Handle note deletion
     * @param {number} noteId - ID of note to delete
     */
    const handleNoteDelete = (noteId) => {
        // Remove from local state (already deleted from API by NoteItem)
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    };

    /**
     * Handle edit button click
     * Opens inline edit form for the note
     * @param {object} note - Note to edit
     */
    const handleEditNote = (note) => {
        setEditingNote(note);
    };

    /**
     * Handle note save from edit form
     * Updates note in list and closes edit form
     * @param {object} savedNote - Updated note from API
     */
    const handleNoteSave = (savedNote) => {
        // Update note in list
        setNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === savedNote.id ? savedNote : note
            )
        );

        // Close edit form
        setEditingNote(null);
    };

    /**
     * Handle edit form cancel
     */
    const handleEditCancel = () => {
        setEditingNote(null);
    };

    /**
     * Reset all filters to default
     */
    const handleResetFilters = () => {
        setFilters({
            source: null,
            category: null,
            pendingOnly: false,
            hasLinks: false,
            dateFrom: null,
            dateTo: null,
            search: '',
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        My Notes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'} found
                    </p>
                </div>

                {/* Mobile filter toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">

                {/* Filter Sidebar */}
                <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
                    <NotesFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onReset={handleResetFilters}
                    />
                </div>

                {/* Notes Timeline */}
                <div className="flex-1">

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(n => (
                                <div
                                    key={n}
                                    className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 animate-pulse"
                                />
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                            <p className="text-red-600 dark:text-red-400 font-medium">
                                ⚠️ Error loading notes: {error}
                            </p>
                            <button
                                onClick={fetchNotes}
                                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Notes List */}
                    {!loading && !error && notes.length > 0 && (
                        <div className="space-y-0">
                            {notes.map((note, index) => (
                                <div key={note.id}>
                                    {editingNote?.id === note.id ? (
                                        /* EDIT MODE: Show inline edit form */
                                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                ✏️ Edit Note
                                            </h3>
                                            <NoteForm
                                                article={note.article}
                                                existingNote={note}
                                                onSave={handleNoteSave}
                                                onCancel={handleEditCancel}
                                            />
                                        </div>
                                    ) : (
                                        /* VIEW MODE: Show note card */
                                        <NoteItem
                                            note={note}
                                            onUpdate={handleNoteUpdate}
                                            onDelete={handleNoteDelete}
                                            onEdit={handleEditNote}
                                        />
                                    )}

                                    {/* Horizontal separator (except for last item) */}
                                    {index < notes.length - 1 && !editingNote && (
                                        <hr className="border-gray-300 dark:border-gray-600 my-4" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && notes.length === 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                No notes found
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 mb-4">
                                {Object.values(filters).some(v => v)
                                    ? 'Try adjusting your filters'
                                    : 'Start taking notes on articles to see them here'
                                }
                            </p>
                            {Object.values(filters).some(v => v) && (
                                <button
                                    onClick={handleResetFilters}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotesPage;