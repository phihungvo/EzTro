import React, { useState } from "react";
import classNames from "classnames/bind";
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
    SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import Building from "~/pages/Admin/Building";
import Tenant from "~/pages/Admin/Tenant";
import BoardingHouses from "~/pages/Admin/BoardingHouse";
import {message} from "antd";
import Contract from "~/pages/Admin/Contract";
import Amenity from "~/pages/Admin/Amenity";

const cx = classNames.bind(styles);

const adminMenuConfig = [
    {
        group: "Tổng quan hệ thống",
        items: [
            {
                key: "dashboard",
                label: "Bảng điều khiển",
                title: "Tổng quan hệ thống",
                icon: <DashboardOutlined />,
                color: "#3b82f6",
                component: <Dashboard />,
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
                icon: <AppstoreOutlined />,
                color: "#10b981",
                component: <BoardingHouses />,
            },
            {
                key: "buildings",
                label: "Tòa nhà",
                title: "Quản lý tòa nhà",
                icon: <BankOutlined />,
                color: "#14b8a6",
                component: <Building />,
            },
            {
                key: "rooms",
                label: "Phòng trọ",
                title: "Quản lý phòng trọ",
                icon: <HomeOutlined />,
                color: "#ec4899",
                component: <Room />,
            },
            {
                key: "tenants",
                label: "Người thuê",
                title: "Quản lý người thuê",
                icon: <UserSwitchOutlined />,
                color: "#f59e0b",
                component: <Tenant />,
            },
        ],
    },

    {
        group: "Hợp đồng & dịch vụ",
        items: [
            {
                key: "contracts",
                label: "Hợp đồng thuê",
                title: "Quản lý hợp đồng thuê trọ",
                icon: <FileTextOutlined />,
                color: "#8b5cf6",
                component: <Contract />,
            },
            {
                key: "services",
                label: "Dịch vụ",
                title: "Quản lý dịch vụ (điện, nước, internet...)",
                icon: <ToolOutlined />,
                color: "#6366f1",
                component: <Amenity />,
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
                icon: <DollarOutlined />,
                color: "#16a34a",
                // component: <Revenue />,
            },
            {
                key: "assets",
                label: "Tài sản",
                title: "Quản lý tài sản, thiết bị trong khu trọ",
                icon: <GoldOutlined />,
                color: "#ca8a04",
                // component: <Asset />,
            },
            {
                key: "expenses",
                label: "Chi phí",
                title: "Theo dõi chi phí vận hành",
                icon: <BankOutlined />,
                color: "#22d3ee",
                // component: <Expense />,
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
                icon: <AlertOutlined />,
                color: "#ef4444",
                // component: <RoomRequest />,
            },
            {
                key: "appointments",
                label: "Lịch hẹn xem phòng",
                title: "Quản lý lịch hẹn và khách xem phòng",
                icon: <CalendarOutlined />,
                color: "#3b82f6",
                // component: <Appointment />,
            },
            {
                key: "incidents",
                label: "Báo cáo sự cố",
                title: "Quản lý và xử lý sự cố phòng trọ",
                icon: <AlertOutlined />,
                color: "#f97316",
                // component: <Incident />,
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
                icon: <BarChartOutlined />,
                color: "#a855f7",
                // component: <Report />,
            },
            {
                key: "users",
                label: "Người dùng",
                title: "Quản lý tài khoản người dùng",
                icon: <TeamOutlined />,
                color: "#0ea5e9",
                component: <UserManagement />,
            },
            {
                key: "settings",
                label: "Cấu hình hệ thống",
                title: "Thiết lập và tùy chỉnh hệ thống",
                icon: <SettingOutlined />,
                color: "#475569",
                // component: <Settings />,
            },
        ],
    },
];

const AdminLayout = ({ onLogout }) => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState("dashboard");
    const [collapsed, setCollapsed] = useState(false);

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
                onSelect={setSelected}
                collapsed={collapsed}
                onCollapse={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
            />

            <div className={cx("rightContainer", { collapsed })}>
                <Header title={activeMenu?.title || "Trang quản trị"} />
                <div className={cx("content")}>
                    {activeMenu?.component || <div>Không tìm thấy trang</div>}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
