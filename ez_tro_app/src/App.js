import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './routes/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
    return (
        <Router>
            <LanguageProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </LanguageProvider>
        </Router>
    );
}

export default App;
