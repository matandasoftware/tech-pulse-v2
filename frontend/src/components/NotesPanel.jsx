/**
 * NotesPanel Component
 * 
 * Slide-in panel from the right side showing notes for an article.
 * Opens when user clicks "Notes" button on ArticleCard.
 * 
 * Features:
 * - View all notes for the current article
 * - Add new notes
 * - Edit existing notes
 * - Delete notes
 * - Mark follow-ups as done
 */

import { useState, useEffect } from 'react';
import { useNotesPanel } from '../context/NotesPanelContext';
import NoteForm from './NoteForm';
import NoteItem from './NoteItem';
import api from '../services/api';

function NotesPanel() {
    const { isOpen, currentArticle, closePanel } = useNotesPanel();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    /**
     * Fetch notes when article changes
     */
    useEffect(() => {
        if (currentArticle) {
            fetchNotes();
            setShowForm(false);
            setEditingNote(null);
        }
    }, [currentArticle]);

    /**
     * Fetch notes for current article
     */
    const fetchNotes = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/notes/', {
                params: { article_id: currentArticle.id }
            });
            setNotes(response.data.results || response.data);
        } catch (err) {
            setError('Failed to load notes');
            console.error('Notes fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle note created
     */
    const handleNoteCreated = (newNote) => {
        setNotes([newNote, ...notes]);
        setShowForm(false);

        // Dispatch event to update notes count on ArticleCard
        window.dispatchEvent(new CustomEvent('noteAdded', {
            detail: { articleId: currentArticle.id, count: notes.length + 1 }
        }));
    };

    /**
     * Handle note updated
     */
    const handleNoteUpdated = (updatedNote) => {
        setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
        setEditingNote(null);
    };

    /**
     * Handle note deleted
     */
    const handleNoteDeleted = (noteId) => {
        setNotes(notes.filter(note => note.id !== noteId));

        // Dispatch event to update notes count on ArticleCard
        window.dispatchEvent(new CustomEvent('noteAdded', {
            detail: { articleId: currentArticle.id, count: notes.length - 1 }
        }));
    };

    /**
     * Handle edit note
     */
    const handleEditNote = (note) => {
        setEditingNote(note);
        setShowForm(true);
    };

    /**
     * Handle cancel form
     */
    const handleCancelForm = () => {
        setShowForm(false);
        setEditingNote(null);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Transparent Backdrop - Click to close */}
            <div
                className="fixed inset-0 z-40"
                onClick={closePanel}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto transform transition-transform">

                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Notes
                            </h2>
                            {currentArticle && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {currentArticle.title}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={closePanel}
                            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Add Note Button */}
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            ✏️ Add New Note
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">

                    {/* Note Form */}
                    {showForm && (
                        <div className="mb-6">
                            <NoteForm
                                article={currentArticle}
                                note={editingNote}
                                onNoteCreated={handleNoteCreated}
                                onNoteUpdated={handleNoteUpdated}
                                onCancel={handleCancelForm}
                            />
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-8">
                            <div className="text-gray-600 dark:text-gray-400">Loading notes...</div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                            <p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
                        </div>
                    )}

                    {/* Notes List */}
                    {!loading && !error && (
                        <>
                            {notes.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📝</div>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                        No notes yet
                                    </p>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                                        Add your first note to remember key points from this article
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notes.map(note => (
                                        <NoteItem
                                            key={note.id}
                                            note={note}
                                            onEdit={handleEditNote}
                                            onDelete={handleNoteDeleted}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default NotesPanel;