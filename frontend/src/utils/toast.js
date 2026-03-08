/**
 * Toast Notification Utility
 * 
 * Centralized toast notifications with consistent styling
 */

import toast from 'react-hot-toast';

// Custom toast styling
const toastOptions = {
    // Default options
    duration: 4000,
    position: 'top-right',
    
    // Styling
    style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
        fontSize: '14px',
    },
    
    // Success style
    success: {
        duration: 3000,
        iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
        },
    },
    
    // Error style
    error: {
        duration: 5000,
        iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
        },
    },
    
    // Loading style
    loading: {
        iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
        },
    },
};

// Toast notification functions
export const showToast = {
    success: (message) => toast.success(message, toastOptions.success),
    
    error: (message) => toast.error(message, toastOptions.error),
    
    loading: (message) => toast.loading(message, toastOptions.loading),
    
    promise: (promise, messages) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading || 'Loading...',
                success: messages.success || 'Success!',
                error: messages.error || 'Something went wrong',
            },
            toastOptions
        );
    },
    
    info: (message) => toast(message, {
        ...toastOptions,
        icon: 'ℹ️',
    }),
    
    dismiss: (toastId) => toast.dismiss(toastId),
    
    dismissAll: () => toast.dismiss(),
};

// Error handler with user-friendly messages
export const handleApiError = (error, customMessage = null) => {
    console.error('API Error:', error);
    
    // Default error message
    let message = customMessage || 'An unexpected error occurred';
    
    // Handle different error types
    if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
            case 400:
                message = data.detail || data.message || 'Invalid request. Please check your input.';
                break;
            case 401:
                message = 'Authentication required. Please log in.';
                break;
            case 403:
                message = 'You don\'t have permission to perform this action.';
                break;
            case 404:
                message = 'The requested resource was not found.';
                break;
            case 409:
                message = data.detail || 'This action conflicts with existing data.';
                break;
            case 422:
                message = 'Validation error. Please check your input.';
                break;
            case 429:
                message = 'Too many requests. Please slow down.';
                break;
            case 500:
                message = 'Server error. Our team has been notified.';
                break;
            case 502:
            case 503:
            case 504:
                message = 'Service temporarily unavailable. Please try again.';
                break;
            default:
                message = data.detail || data.message || `Error ${status}: ${error.response.statusText}`;
        }
        
        // Extract field-specific errors for 400 responses
        if (status === 400 && typeof data === 'object' && !data.detail && !data.message) {
            const fieldErrors = Object.entries(data)
                .map(([field, errors]) => {
                    const errorList = Array.isArray(errors) ? errors : [errors];
                    return `${field}: ${errorList.join(', ')}`;
                })
                .join('\n');
            
            if (fieldErrors) {
                message = fieldErrors;
            }
        }
    } else if (error.request) {
        // Request made but no response received
        message = 'Unable to connect to server. Please check your internet connection.';
    } else {
        // Something else happened
        message = error.message || 'An unexpected error occurred';
    }
    
    showToast.error(message);
    return message;
};

// Success helper for common actions
export const showSuccess = {
    bookmark: () => showToast.success('Article bookmarked!'),
    unbookmark: () => showToast.success('Bookmark removed'),
    noteAdded: () => showToast.success('Note added successfully'),
    noteUpdated: () => showToast.success('Note updated'),
    noteDeleted: () => showToast.success('Note deleted'),
    profileUpdated: () => showToast.success('Profile updated successfully'),
    passwordChanged: () => showToast.success('Password changed successfully'),
    articleArchived: () => showToast.success('Article archived'),
    login: () => showToast.success('Welcome back!'),
    logout: () => showToast.success('Logged out successfully'),
    copied: () => showToast.success('Copied to clipboard'),
};

// Loading helper for async operations
export const withLoading = async (promise, message = 'Loading...') => {
    const toastId = showToast.loading(message);
    try {
        const result = await promise;
        showToast.dismiss(toastId);
        return result;
    } catch (error) {
        showToast.dismiss(toastId);
        throw error;
    }
};

export default showToast;
