import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await api.get('/users/me/');
                setUser(response.data);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        const response = await api.post('/users/token/', { username, password });

        // Django returns nested structure: { user: {...}, tokens: {...} }
        const { access, refresh } = response.data.tokens;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        const userResponse = await api.get('/users/me/');
        setUser(userResponse.data);
    };

    const register = async (username, email, password, confirmPassword) => {
        const response = await api.post('/users/register/', {
            username,
            email,
            password,
            password_confirm: confirmPassword,  // Django expects this field name
        });

        // Django returns nested structure: { user: {...}, tokens: {...} }
        const { access, refresh } = response.data.tokens;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // User data is already in response
        setUser(response.data.user);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};