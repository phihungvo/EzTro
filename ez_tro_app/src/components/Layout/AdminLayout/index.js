import React, {useState} from "react";
import classNames from "classnames/bind";
import {Routes, Route, useLocation} from 'react-router-dom';
import styles from "./AdminLayout.module.scss";
import Header from "../Header";
import AdminSidebar from "~/components/Layout/AdminLayout/components/Sidebar/AdminSidebar";

import Dashboard from "~/pages/Admin/HomeDashboard";
import UserManagement from "~/pages/Admin/User/UserManagement";
import Room from "~/pages/Admin/Room";
import {
    DashboardOutlined,
    AppstoreOutlined,
    BankOutlined,
    HomeOutlined,
    UserSwitchOutlined,
    TeamOutlined,
    ToolOutlined,
    DollarOutlined,
    CalendarOutlined,
    AlertOutlined,
    BarChartOutlined,
    GoldOutlined,
    FileTextOutlined,
    SettingOutlined, CreditCardOutlined,
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

import Building from "~/pages/Admin/Building";
import Tenant from "~/pages/Admin/Tenant";
// import TenantDetail from "~/pages/Admin/Tenant/TenantDetail";  // Import TenantDetail
import BoardingHouses from "~/pages/Admin/BoardingHouse";
import {message} from "antd";
import Contract from "~/pages/Admin/Contract";
import Amenity from "src/pages/Admin/Utility";
import Bill from "~/pages/Admin/Bill";
import TenantDetail from "~/pages/Admin/Tenant/detail";
import UtilityManagement from "~/pages/Admin/Utility/UtilityManagement";
import IncidentReport from "~/pages/Admin/IncidentReport";
import RequestManagement from "~/pages/Admin/RequestManagement";
import Appointment from "~/pages/Admin/Appointment";
import Revenue from "~/pages/Admin/Revenue";
import AdminPaymentManagement from "~/pages/Admin/AdminPaymentManagement";
import OwnerSubscriptionPage from "~/pages/Admin/OwnerSubscriptionPage";
// import Request from "~/pages/Admin/RequestManagement";

const cx = classNames.bind(styles);

const adminMenuConfig = [
    {
        group: "Tổng quan hệ thống",
        items: [
            {
                key: "dashboard",
                label: "Bảng điều khiển",
                title: "Tổng quan hệ thống",
                icon: <DashboardOutlined/>,
                color: "#3b82f6",
                path: "/admin/dashboard",  // Add path for routing
            },
        ],
    },

    {
        group: "Quản lý khu trọ",
        items: [
            {
                key: "boarding-houses",
                label: "Khu nhà trọ",
                title: "Quản lý khu nhà trọ",
                icon: <AppstoreOutlined/>,
                color: "#10b981",
                path: "/admin/boarding-houses",
            },
            {
                key: "buildings",
                label: "Tòa nhà",
                title: "Quản lý tòa nhà",
                icon: <BankOutlined/>,
                color: "#14b8a6",
                path: "/admin/buildings",
            },
            {
                key: "rooms",
                label: "Phòng trọ",
                title: "Quản lý phòng trọ",
                icon: <HomeOutlined/>,
                color: "#ec4899",
                path: "/admin/rooms",
            },
            {
                key: "tenants",
                label: "Người thuê",
                title: "Quản lý người thuê",
                icon: <UserSwitchOutlined/>,
                color: "#f59e0b",
                path: "/admin/tenants",
            },
            {
                key: "admin-payment-management",
                label: "Quản lý thanh toán gói",
                title: "Quản lý Thanh toán gói dịch vụ chủ trọ",
                icon: <CreditCardOutlined/>,
                path: "/admin/admin-payment-management",
            },
        ],
    },

    {
        group: "Hợp đồng & dịch vụ",
        items: [
            {
                key: "contracts",
                label: "Hợp đồng thuê trọ",
                title: "Quản lý thông tin hợp đồng thuê trọ",
                icon: <FileTextOutlined/>,
                color: "#8b5cf6",
                path: "/admin/contracts",
            },
            {
                key: "bills",
                label: "Hoá đơn thanh toán",
                title: "Quản lý hoá đơn tiền phòng và dịch vụ của người thuê",
                icon: <FileTextOutlined/>,
                color: "#f59e0b",
                path: "/admin/bills",
            },
            {
                key: "services",
                label: "Dịch vụ phòng trọ",
                title: "Quản lý các dịch vụ đi kèm (điện, nước, internet, vệ sinh...)",
                icon: <ToolOutlined/>,
                color: "#6366f1",
                path: "/admin/utilities",
            },
        ],
    },

    {
        group: "Tài chính & tài sản",
        items: [
            {
                key: "revenues",
                label: "Doanh thu",
                title: "Thống kê doanh thu và lợi nhuận",
                icon: <DollarOutlined/>,
                color: "#16a34a",
                path: "/admin/revenues",
            },
            {
                key: "assets",
                label: "Tài sản",
                title: "Quản lý tài sản, thiết bị trong khu trọ",
                icon: <GoldOutlined/>,
                color: "#ca8a04",
                path: "/admin/assets",
            },
            {
                key: "expenses",
                label: "Chi phí",
                title: "Theo dõi chi phí vận hành",
                icon: <BankOutlined/>,
                color: "#22d3ee",
                path: "/admin/expenses",
            },
        ],
    },

    {
        group: "Vận hành & hỗ trợ",
        items: [
            {
                key: "room-requests",
                label: "Yêu cầu dọn phòng / trả phòng",
                title: "Xử lý yêu cầu dọn phòng, trả phòng từ người thuê",
                icon: <AlertOutlined/>,
                color: "#ef4444",
                path: "/admin/room-requests",
            },
            {
                key: "appointments",
                label: "Lịch hẹn xem phòng",
                title: "Quản lý lịch hẹn và khách xem phòng",
                icon: <CalendarOutlined/>,
                color: "#3b82f6",
                path: "/admin/appointments",
            },
            {
                key: "incidents",
                label: "Báo cáo sự cố",
                title: "Quản lý và xử lý sự cố phòng trọ",
                icon: <AlertOutlined/>,
                color: "#f97316",
                path: "/admin/incidents",
            },
        ],
    },

    {
        group: "Báo cáo & người dùng",
        items: [
            {
                key: "reports",
                label: "Báo cáo",
                title: "Tổng hợp và xuất báo cáo thống kê",
                icon: <BarChartOutlined/>,
                color: "#a855f7",
                path: "/admin/reports",
            },
            {
                key: "users",
                label: "Người dùng",
                title: "Quản lý tài khoản người dùng",
                icon: <TeamOutlined/>,
                color: "#0ea5e9",
                path: "/admin/users",
            },
            {
                key: "settings",
                label: "Cấu hình hệ thống",
                title: "Thiết lập và tùy chỉnh hệ thống",
                icon: <SettingOutlined/>,
                color: "#475569",
                path: "/admin/settings",
            },
        ],
    },
];

const AdminLayout = ({onLogout}) => {
    const navigate = useNavigate();
    const location = useLocation();  // Use location to determine active menu dynamically
    const [collapsed, setCollapsed] = useState(false);

    // Function to find active menu key based on current path
    const getActiveKey = (pathname) => {
        const activeItem = adminMenuConfig
            .flatMap((group) => group.items)
            .find((item) => pathname.startsWith(item.path) || pathname === item.path);
        return activeItem?.key || 'dashboard';
    };

    const selected = getActiveKey(location.pathname);

    const activeMenu = adminMenuConfig
        .flatMap((group) => group.items)
        .find((item) => item.key === selected);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
        message.success("Đăng xuất thành công");
    };

    return (
        <div className={cx("wrapper")}>
            <AdminSidebar
                menu={adminMenuConfig}
                selected={selected}
                onSelect={(key) => {
                    const item = adminMenuConfig.flatMap(g => g.items).find(i => i.key === key);
                    if (item) navigate(item.path);
                }}
                collapsed={collapsed}
                onCollapse={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
            />

            <div className={cx("rightContainer", {collapsed})}>
                <Header title={activeMenu?.title || "Trang quản trị"}/>
                <div className={cx("content")}>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/tenants" element={<Tenant/>}/>
                        <Route path="/tenants/:id" element={<TenantDetail/>}/>
                        <Route path="/boarding-houses" element={<Revenue/>}/>
                        <Route path="/buildings" element={<Building/>}/>
                        <Route path="/rooms" element={<Room/>}/>
                        <Route path="/contracts" element={<Contract/>}/>
                        <Route path="/bills" element={<Bill/>}/>
                        <Route path="/services" element={<Amenity/>}/>
                        <Route path="/revenues" element={<Revenue/>}/>
                        <Route path="/users" element={<UserManagement/>}/>
                        <Route path="/utilities" element={<UtilityManagement/>}/>
                        <Route path="/incidents" element={<IncidentReport/>}/>
                        <Route path="/room-requests" element={<RequestManagement/>}/>
                        <Route path="/appointments" element={<Appointment/>}/>
                        <Route path="/admin-payment-management" element={<AdminPaymentManagement/>}/>
                        <Route path="/owner-subscription" element={<OwnerSubscriptionPage/>}/>

                        {/* Add other routes as needed */}
                        <Route path="/" element={<Dashboard/>}/> // Default route
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;