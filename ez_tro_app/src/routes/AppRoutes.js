import { Routes, Route, Navigate } from "react-router-dom";
import SharedLayout from "~/components/Layout/SharedLayout";
import PrivateRoute from "./PrivateRoute";
import { useAuth } from "./AuthContext";

import Login from "~/pages/General/Login";
import Register from "~/pages/General/Register";
import Landing from "~/pages/General/Landing";
import About from "~/pages/General/About";
import Careers from "~/pages/General/Careers";

import Building from "~/pages/Admin/Building";
import Room from "~/pages/Admin/Room";
import Tenant from "~/pages/Admin/Tenant";
import TenantDetail from "~/pages/Admin/Tenant/detail";
import Contract from "~/pages/Admin/Contract";
import Bill from "~/pages/Admin/Bill";
import UserLayout from "~/components/Layout/UserLayout";
import UserDashboard from "~/pages/User/HomeDashboard";
import Revenue from "~/pages/Admin/Revenue";
import Appointment from "~/pages/Admin/Appointment";
import Asset from "~/pages/Admin/Asset";
import OperatingCostTracker from "~/pages/Admin/OperatingCostTracker";
import AdminPaymentManagement from "~/pages/Admin/AdminPaymentManagement";
import OwnerSubscriptionPage from "~/pages/Admin/OwnerSubscriptionPage";
import AdminLayout from "~/components/Layout/AdminLayout";

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
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
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
                                <Route path="notifications" element={<NotificationCenter />} />
                                <Route path="notifications/announcements" element={<AnnouncementCenter />} />
                                <Route path="boarding-houses" element={<BoardingHouses />} />
                                <Route path="boarding-houses/create" element={<BoardingHouseCreatorPage />} />
                                <Route path="boarding-houses/:id/edit" element={<BoardingHouseCreatorPage />} />
                                <Route path="buildings" element={<Building />} />
                                <Route path="rooms" element={<Room />} />
                                <Route path="rooms/create-room" element={<RoomCreatorPage />} />
                                <Route path="rooms/:id/edit" element={<RoomCreatorPage />} />
                                <Route path="tenants" element={<Tenant />} />
                                <Route path="tenants/create-tenant" element={<TenantCreatorPage />} />
                                <Route path="tenants/:id/edit" element={<TenantCreatorPage />} />
                                <Route path="tenants/:id" element={<TenantDetail />} />
                                <Route path="contracts" element={<Contract />} />
                                <Route path="contracts/create-contract" element={<ContractCreatorPage />} />
                                <Route path="contracts/:id" element={<ContractDetailPage />} />
                                <Route path="contracts/:id/edit" element={<ContractCreatorPage />} />
                                <Route path="bills" element={<Bill />} />
                                <Route path="bills/create-bill" element={<BillCreator />} />
                                <Route path="utilities" element={<UtilityManagement />} />
                                <Route path="revenues" element={<Revenue />} />
                                <Route path="appointments" element={<Appointment />} />
                                <Route path="assets" element={<Asset />} />
                                <Route path="assets/create" element={<PropertyAssetCreatorPage />} />
                                <Route path="expenses" element={<OperatingCostTracker />} />
                                <Route path="incidents" element={<IncidentReport />} />
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
                        <UserLayout />
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
