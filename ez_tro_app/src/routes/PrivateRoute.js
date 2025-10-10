import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '~/routes/AuthContext';

const PrivateRoute = ({ element, role, title }) => {
    const { user } = useAuth();
    const location = useLocation();

    const elementWithTitle = React.cloneElement(element, { pageTitle: title });

    if (!user || !user.token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const currentTime = Date.now() / 1000;
    if (user.tokenExpiration && user.tokenExpiration < currentTime) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role === 'admin') {
        const hasAdminAccess =
            user.roles?.includes('ADMIN') ||
            user.roles?.includes('MANAGER') ||  // Thêm dựa trên response API
            user.permissions?.includes('ADMIN:MANAGE');

        if (!hasAdminAccess) {
            return <Navigate to="/" replace />;
        }
    }

    return elementWithTitle;
};

export default PrivateRoute;