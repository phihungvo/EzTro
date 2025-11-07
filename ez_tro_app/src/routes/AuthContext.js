import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    // Khi app load, check token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const role = decoded.roles ? decoded.roles[0] : 'USER';
                setUser({
                    token,
                    roles: decoded.roles || [],
                    role,
                    permissions: decoded.authorities || [],
                    username: decoded.sub,
                    userId: decoded.userId,
                });
            } catch (err) {
                console.error('Invalid token', err);
                localStorage.removeItem('token');
            }
        }
        setInitializing(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        const role = decoded.roles ? decoded.roles[0] : 'USER';
        const userData = {
            token,
            roles: decoded.roles || [],
            role,
            permissions: decoded.authorities || [],
            username: decoded.sub,
            userId: decoded.userId,
        };
        setUser(userData);

        // Navigate theo role sau login
        switch (role) {
            case 'ADMIN':
                navigate('/admin/dashboard');
                break;
            case 'OWNER':
                navigate('/owner/dashboard');
                break;
            default:
                navigate('/user/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    if (initializing) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
