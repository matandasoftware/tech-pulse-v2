/**
 * App Component
 * 
 * Root component - sets up routing and global context providers.
 * Context order: DarkMode → Auth → NotesPanel → Router
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { NotesPanelProvider } from './context/NotesPanelContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookmarksPage from './pages/BookmarksPage';
import NotesPage from './pages/NotesPage';

function App() {
    return (
        // Context providers (outside-in): Theme → Auth → Notes
        <DarkModeProvider>
            <AuthProvider>
                <NotesPanelProvider>
                    <Router>
                        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                            <Routes>

                                {/* Public Routes */}
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />

                                {/* Protected Routes - require authentication */}
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <>
                                                <Navbar />
                                                <HomePage />
                                            </>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/bookmarks"
                                    element={
                                        <ProtectedRoute>
                                            <>
                                                <Navbar />
                                                <BookmarksPage />
                                            </>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/notes"
                                    element={
                                        <ProtectedRoute>
                                            <>
                                                <Navbar />
                                                <NotesPage />
                                            </>
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Dashboard */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <>
                                                <Navbar />
                                                <DashboardPage />
                                            </>
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Catch-all - redirect to home */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </Router>
                </NotesPanelProvider>
            </AuthProvider>
        </DarkModeProvider>
    );
}

export default App;