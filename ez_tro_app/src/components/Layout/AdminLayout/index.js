import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./AdminLayout.module.scss";
import Header from "../Header";
import AdminSidebar from "~/components/Layout/components/Sidebar/AdminSidebar";

import Dashboard from "~/pages/Admin/HomeDashboard";
import UserManagement from "~/pages/Admin/User/UserManagement";
import Room from "~/pages/Admin/Room";
import {
    DashboardOutlined,
    TeamOutlined,
    BankOutlined,
    HomeOutlined,
    UserSwitchOutlined,
    AppstoreOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Building from "~/pages/Admin/Building";
import Tenant from "~/pages/Admin/Tenant";
import BoardingHouses from "~/pages/Admin/BoardingHouse";
import {message} from "antd";

const cx = classNames.bind(styles);

const adminMenuConfig = [
    {
        key: "dashboard",
        label: "Dashboard",
        title: "Tổng quan hệ thống",
        icon: <DashboardOutlined />,
        color: "#3b82f6",
        component: <Dashboard />,
    },
    {
        key: "users",
        label: "Người dùng",
        title: "Quản lý Người dùng",
        icon: <TeamOutlined />,
        color: "#8b5cf6",
        component: <UserManagement />,
    },
    {
        key: "boarding-houses",
        label: "Khu nhà",
        title: "Quản lý Khu nhà trọ",
        icon: <AppstoreOutlined />,
        color: "#10b981",
        component: <BoardingHouses />,
    },
    {
        key: "buildings",
        label: "Toà nhà",
        title: "Quản lý Toà nhà",
        icon: <BankOutlined />,
        color: "#14b8a6",
        component: <Building />,
    },
    {
        key: "rooms",
        label: "Phòng",
        title: "Quản lý Phòng",
        icon: <HomeOutlined />,
        color: "#ec4899",
        component: <Room />,
    },
    {
        key: "tenants",
        label: "Người thuê",
        title: "Quản lý Người thuê",
        icon: <UserSwitchOutlined />,
        color: "#f59e0b",
        component: <Tenant />,
    },
    {
        key: "services",
        label: "Dịch vụ",
        title: "Quản lý Dịch vụ",
        icon: <ToolOutlined />,
        color: "#6366f1",
        component: <Tenant />,
    },
];

const AdminLayout = ({ onLogout }) => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState("dashboard");
    const [collapsed, setCollapsed] = useState(false);

    const activeMenu = adminMenuConfig.find((item) => item.key === selected);

    const handleLogout = () => {
        // Xóa dữ liệu trong localStorage
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("refreshToken");
        // localStorage.removeItem("userInfo");

        // Nếu bạn lưu tất cả vào 1 key, dùng:
        localStorage.clear();

        // Điều hướng về trang đăng nhập
        navigate("/login");

        // (tuỳ chọn) Thông báo
        message.warning("Đăng xuất thành công");
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
