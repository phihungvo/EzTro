import { Routes, Route, Navigate } from "react-router-dom";
import SharedLayout from "~/components/Layout/SharedLayout";
import PrivateRoute from "./PrivateRoute";
import { useAuth } from "./AuthContext";

import Login from "~/pages/General/Login";
import Register from "~/pages/General/Register";
import Landing from "~/pages/General/Landing";

import AdminDashboard from "~/pages/Admin/HomeDashboard";
import Building from "~/pages/Admin/Building";
import Room from "~/pages/Admin/Room";
import Tenant from "~/pages/Admin/Tenant";
import TenantDetail from "~/pages/Admin/Tenant/detail";
import Contract from "~/pages/Admin/Contract";
import Bill from "src/pages/Admin/Bill";
import UtilityManagement from "~/pages/Admin/Utility/UtilityManagement";
import IncidentReport from "~/pages/Admin/IncidentReport";
import UserManagement from "~/pages/Admin/User/UserManagement";
import BoardingHouses from "~/pages/Admin/BoardingHouse";
import UserLayout from "~/components/Layout/UserLayout";
import UserDashboard from "~/pages/User/HomeDashboard";
import Owner from "~/pages/Admin/Owner";
import Revenue from "~/pages/Admin/Revenue";
import RequestManagement from "~/pages/Admin/RequestManagement";
import Appointment from "~/pages/Admin/Appointment";
import Asset from "~/pages/Admin/Asset";
import OperatingCostTracker from "~/pages/Admin/OperatingCostTracker";
import ElectricWaterRecord from "~/pages/Admin/ElectricWaterRecord";
import AdminPaymentManagement from "~/pages/Admin/AdminPaymentManagement";
import OwnerSubscriptionPage from "~/pages/Admin/OwnerSubscriptionPage";
import AdminLayout from "~/components/Layout/AdminLayout";
import React from "react";
import BillCreator from "~/pages/Admin/Bill/component/BillCreator";

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    user?.role === "ADMIN"
                        ? <Navigate to="/admin/dashboard" replace />
                        : user?.role === "OWNER"
                            ? <Navigate to="/owner/dashboard" replace />
                            : <Landing />
                }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ADMIN */}
            <Route path="/admin/*" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                    <AdminLayout onLogout={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }} />
                </PrivateRoute>
            }/>

            {/* OWNER */}
            <Route
                path="/owner/*"
                element={
                    <PrivateRoute allowedRoles={["OWNER"]}>
                        <SharedLayout>
                            <Routes>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="buildings" element={<Building />} />
                                <Route path="rooms" element={<Room />} />
                                <Route path="tenants" element={<Tenant />} />
                                <Route path="tenants/:id" element={<TenantDetail />} />
                                <Route path="contracts" element={<Contract />} />
                                <Route path="bills" element={<Bill />} />
                                <Route path="bills/create-bill" element={<BillCreator />} />
                                <Route path="revenues" element={<Revenue />} />
                                <Route path="appointments" element={<Appointment />} />
                                <Route path="assets" element={<Asset />} />
                                <Route path="expenses" element={<OperatingCostTracker />} />
                                <Route path="admin-payment-management" element={<AdminPaymentManagement/>}/>
                                <Route path="owner-subscription" element={<OwnerSubscriptionPage/>}/>
                            </Routes>
                        </SharedLayout>
                    </PrivateRoute>
                }
            />

            {/* USER */}
            <Route
                path="/user/*"
                element={
                    <PrivateRoute allowedRoles={["USER"]}>
                        <UserLayout>
                            <Routes>
                                <Route path="dashboard" element={<UserDashboard />} />
                            </Routes>
                        </UserLayout>
                    </PrivateRoute>
                }
            />

            {/* Default */}
            <Route
                path="*"
                element={
                    <Navigate
                        to={user ? `/${user.role.toLowerCase()}/dashboard` : "/"}
                        replace
                    />
                }
            />
        </Routes>
    );
};

export default AppRoutes;