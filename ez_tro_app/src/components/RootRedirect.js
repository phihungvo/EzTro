import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '~/routes/AuthContext';

const RootRedirect = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('ADMIN') || 
                   user?.permissions?.includes('ADMIN:MANAGE');
    
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/'} replace />;
};

export default RootRedirect;
