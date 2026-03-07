/**
 * NotesPanelContext
 * 
 * Global state management for the Notes side panel.
 * Allows any component to open the panel for a specific article.
 * 
 * State Managed:
 * - isPanelOpen: Boolean - whether panel is visible
 * - selectedArticle: Object - the article whose notes are being viewed
 * - notes: Array - notes for the selected article
 * 
 * Functions Provided:
 * - openPanel(article): Opens panel for specific article
 * - closePanel(): Closes panel
 * - refreshNotes(): Re-fetches notes for current article
 * 
 * Usage:
 * Wrap your app/pages with <NotesPanelProvider>
 * Use useNotesPanel() hook in components to access state/functions
 */

import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

// Create the context
const NotesPanelContext = createContext();

/**
 * Custom hook to access NotesPanel context
 * Must be used within NotesPanelProvider
 * 
 * @returns {object} Context value with state and functions
 * @throws {Error} If used outside NotesPanelProvider
 */
export const useNotesPanel = () => {
    const context = useContext(NotesPanelContext);
    if (!context) {
        throw new Error('useNotesPanel must be used within NotesPanelProvider');
    }
    return context;
};

/**
 * NotesPanelProvider Component
 * 
 * Wraps children with notes panel context.
 * Manages panel state and provides functions to open/close panel.
 * 
 * @param {object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const NotesPanelProvider = ({ children }) => {
    // Panel visibility state
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Currently selected article (the one whose notes are shown)
    const [selectedArticle, setSelectedArticle] = useState(null);

    // Notes for the selected article
    const [notes, setNotes] = useState([]);

    // Loading state while fetching notes
    const [loading, setLoading] = useState(false);

    // Error state if fetch fails
    const [error, setError] = useState(null);

    /**
     * Fetch notes for a specific article
     * Called when panel opens or when notes need refreshing
     * 
     * @param {number} articleId - ID of the article
     */
    const fetchNotesForArticle = useCallback(async (articleId) => {
        setLoading(true);
        setError(null);

        try {
            // Fetch notes filtered by article ID
            const response = await api.get('/notes/', {
                params: { article: articleId }
            });

            // Extract notes array (handle pagination)
            const fetchedNotes = response.data.results || response.data;

            // Sort by created_at DESC (newest first)
            const sortedNotes = fetchedNotes.sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );

            setNotes(sortedNotes);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Open the notes panel for a specific article
     * Fetches notes for that article
     * 
     * @param {object} article - Article object with id, title, etc.
     */
    const openPanel = useCallback((article) => {
        setSelectedArticle(article);
        setIsPanelOpen(true);
        fetchNotesForArticle(article.id);
    }, [fetchNotesForArticle]);

    /**
     * Close the notes panel
     * Clears selected article and notes
     */
    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
        // Delay clearing data for smooth close animation
        setTimeout(() => {
            setSelectedArticle(null);
            setNotes([]);
            setError(null);
        }, 300); // Match panel slide-out animation duration
    }, []);

    /**
     * Refresh notes for the currently selected article
     * Used after adding/editing/deleting a note
     */
    const refreshNotes = useCallback(() => {
        if (selectedArticle) {
            fetchNotesForArticle(selectedArticle.id);
        }
    }, [selectedArticle, fetchNotesForArticle]);

    /**
     * Add a new note to the local state
     * Used for optimistic UI update
     * 
     * @param {object} note - New note object
     */
    const addNoteLocally = useCallback((note) => {
        setNotes(prevNotes => [note, ...prevNotes]);
    }, []);

    /**
     * Update a note in the local state
     * 
     * @param {number} noteId - ID of note to update
     * @param {object} updates - Fields to update
     */
    const updateNoteLocally = useCallback((noteId, updates) => {
        setNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === noteId ? { ...note, ...updates } : note
            )
        );
    }, []);

    /**
     * Delete a note from the local state
     * 
     * @param {number} noteId - ID of note to delete
     */
    const deleteNoteLocally = useCallback((noteId) => {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    }, []);

    // Context value object
    const value = {
        // State
        isPanelOpen,
        selectedArticle,
        notes,
        loading,
        error,

        // Functions
        openPanel,
        closePanel,
        refreshNotes,
        addNoteLocally,
        updateNoteLocally,
        deleteNoteLocally,
    };

    return (
        <NotesPanelContext.Provider value={value}>
            {children}
        </NotesPanelContext.Provider>
    );
};