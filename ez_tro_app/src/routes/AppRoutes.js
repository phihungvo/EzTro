// src/routes/AppRoutes.jsx
import {Routes, Route, Navigate} from "react-router-dom";
import SharedLayout from "~/components/Layout/SharedLayout";
import PrivateRoute from "./PrivateRoute";
import {useAuth} from "./AuthContext";

import Login from "~/pages/General/Login";
import Register from "~/pages/General/Register";

import AdminDashboard from "~/pages/Admin/HomeDashboard";
import OwnerDashboard from "~/pages/Owner/HomeDashboard";

import Building from "~/pages/Admin/Building";
import Room from "~/pages/Admin/Room";
import Tenant from "~/pages/Admin/Tenant";
import TenantDetail from "~/pages/Admin/Tenant/detail";
import Contract from "~/pages/Admin/Contract";
import Bill from "~/pages/Admin/Bill";
import UtilityManagement from "~/pages/Admin/Utility/UtilityManagement";
import IncidentReport from "~/pages/Admin/IncidentReport";
import UserManagement from "~/pages/Admin/User/UserManagement";
import BoardingHouses from "~/pages/Admin/BoardingHouse";
import UserLayout from "~/components/Layout/UserLayout";
import UserDashboard from "~/pages/User/HomeDashboard";

const AppRoutes = () => {
    const {user} = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>

            {/* ADMIN */}
            <Route path="/admin/*" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                    <SharedLayout>
                        <Routes>
                            <Route path="dashboard" element={<AdminDashboard/>}/>
                            <Route path="buildings" element={<Building/>}/>
                            <Route path="rooms" element={<Room/>}/>
                            <Route path="tenants" element={<Tenant/>}/>
                            <Route path="tenants/:id" element={<TenantDetail/>}/>
                            <Route path="contracts" element={<Contract/>}/>
                            <Route path="bills" element={<Bill/>}/>
                            <Route path="utilities" element={<UtilityManagement/>}/>
                            <Route path="incidents" element={<IncidentReport/>}/>
                            <Route index element={<AdminDashboard/>}/>
                            <Route path="users" element={<UserManagement />} />
                            <Route path="/boarding-houses" element={<BoardingHouses />} />
                        </Routes>
                    </SharedLayout>
                </PrivateRoute>
            }/>

            {/* OWNER */}
            <Route path="/owner/*" element={
                <PrivateRoute allowedRoles={['OWNER']}>
                    <SharedLayout>
                        <Routes>
                            <Route path="dashboard" element={<OwnerDashboard/>}/>
                            <Route path="buildings" element={<Building/>}/>
                            <Route path="rooms" element={<Room/>}/>
                            <Route path="tenants" element={<Tenant/>}/>
                            <Route path="tenants/:id" element={<TenantDetail/>}/>
                            <Route path="contracts" element={<Contract/>}/>
                            <Route path="bills" element={<Bill/>}/>
                            <Route index element={<OwnerDashboard/>}/>
                        </Routes>
                    </SharedLayout>
                </PrivateRoute>
            }/>

            {/* USER */}
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
            <Route path="*" element={
                <Navigate to={user ? `/${user.role.toLowerCase()}/dashboard` : '/login'} replace/>
            }/>
        </Routes>
    );
};

export default AppRoutes;