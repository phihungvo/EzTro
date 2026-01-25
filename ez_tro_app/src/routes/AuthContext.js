// src/routes/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const roles = decoded.roles || [];
                const role = roles[0] || 'USER';
                setUser({
                    token,
                    roles,
                    role,
                    permissions: decoded.authorities || [],
                    username: decoded.sub,
                    userId: decoded.userId,
                    isOwner: roles.includes('OWNER'), // flag tiện lợi
                    isAdmin: roles.includes('ADMIN'),
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
        const roles = decoded.roles || [];
        const role = roles[0] || 'USER';
        const userData = {
            token,
            roles,
            role,
            permissions: decoded.authorities || [],
            username: decoded.sub,
            userId: decoded.userId,
            isOwner: roles.includes('OWNER'),
            isAdmin: roles.includes('ADMIN'),
        };
        setUser(userData);

        // Navigate theo role
        if (userData.isAdmin) {
            navigate('/admin/dashboard');
        } else if (userData.isOwner) {
            navigate('/owner/dashboard');
        } else {
            navigate('/user/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    if (initializing) {
        return <div>Đang tải...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);