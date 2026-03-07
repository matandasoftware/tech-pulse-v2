/**
 * NotesPanelContext
 * 
 * Global state for the notes panel (slide-in from right).
 * Manages which article's notes are being viewed/edited.
 */

import { createContext, useContext, useState } from 'react';

const NotesPanelContext = createContext();

export function NotesPanelProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);

    const openPanel = (article) => {
        setCurrentArticle(article);
        setIsOpen(true);
    };

    const closePanel = () => {
        setIsOpen(false);
        // Keep article data until panel finishes closing animation
        setTimeout(() => setCurrentArticle(null), 300);
    };

    return (
        <NotesPanelContext.Provider
            value={{
                isOpen,
                currentArticle,
                openPanel,
                closePanel
            }}
        >
            {children}
        </NotesPanelContext.Provider>
    );
}

export function useNotesPanel() {
    const context = useContext(NotesPanelContext);
    if (!context) {
        throw new Error('useNotesPanel must be used within NotesPanelProvider');
    }
    return context;
}