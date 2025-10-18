import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import AdminLayout from '~/components/Layout/AdminLayout';
import OwnerLayout from '~/components/Layout/OwnerLayout';
import UserLayout from '~/components/Layout/UserLayout';
import Login from '~/pages/General/Login';
import Register from '~/pages/General/Register';
import {useAuth} from './AuthContext';
import AdminDashboard from '~/pages/Admin/HomeDashboard';
import OwnerDashboard from '~/pages/Owner/HomeDashboard';
import UserDashboard from '~/pages/User/HomeDashboard';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
    const {user} = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>

            {/* Admin */}
            <Route path="/admin/*" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                    <AdminLayout>
                        <Routes>
                            <Route path="dashboard" element={<AdminDashboard/>}/>
                        </Routes>
                    </AdminLayout>
                </PrivateRoute>
            }/>

            {/* Owner */}
            <Route path="/owner/*" element={
                <PrivateRoute allowedRoles={['OWNER']}>
                    <OwnerLayout>
                        <Routes>
                            <Route path="dashboard" element={<OwnerDashboard/>}/>
                        </Routes>
                    </OwnerLayout>
                </PrivateRoute>
            }/>

            {/* User */}
            <Route path="/user/*" element={
                <PrivateRoute allowedRoles={['USER']}>
                    <UserLayout>
                        <Routes>
                            <Route path="dashboard" element={<UserDashboard/>}/>
                        </Routes>
                    </UserLayout>
                </PrivateRoute>
            }/>

            {/* Default */}
            <Route path="*" element={<Navigate to={user ? `/${user.role.toLowerCase()}/dashboard` : '/login'}/>}/>
        </Routes>
    );
};

export default AppRoutes;
