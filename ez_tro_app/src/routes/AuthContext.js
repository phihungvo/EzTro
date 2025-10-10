import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const checkTokenExpiration = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp - 60 < currentTime) { // Buffer 60s
        logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking token:', error);
      logout();
      return false;
    }
  };

  const initializeAuth = () => {
    const token = localStorage.getItem('token');
    if (token && checkTokenExpiration(token)) {
      try {
        const decodedToken = jwtDecode(token);
        const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');

        setUser({
          token,
          role: roles.includes('ADMIN') || roles.includes('MANAGER') ? 'ADMIN' : 'USER',
          userId: decodedToken.userId,
          roles,
          permissions,
          username: decodedToken.username || decodedToken.sub,
          email: decodedToken.email || decodedToken.sub,
          tokenExpiration: decodedToken.exp
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      }
    } else {
      logout();
    }
  };

  useEffect(() => {
    initializeAuth();
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        checkTokenExpiration(token);
      }
    }, 60000); // Kiểm tra mỗi phút

    return () => clearInterval(interval);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('permissions', JSON.stringify(userData.permissions || []));
    localStorage.setItem('roles', JSON.stringify(userData.roles || []));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('permissions');
    sessionStorage.clear();
    setUser(null);
    message.info('Đã đăng xuất.');
    navigate('/login');
  };

  return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};