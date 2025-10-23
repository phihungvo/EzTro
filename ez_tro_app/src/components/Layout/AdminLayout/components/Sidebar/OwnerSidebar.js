import React from "react";
import {Link, useLocation} from "react-router-dom";
import {HomeOutlined, DashboardOutlined, UserOutlined} from "@ant-design/icons";

const OwnerSidebar = () => {
    const {pathname} = useLocation();

    return (
        <div className="sidebar">
            <h2 className="sidebar-title">Owner Panel</h2>
            <ul>
                <li className={pathname === "/owner/dashboard" ? "active" : ""}>
                    <Link to="/owner/dashboard"><DashboardOutlined/> Dashboard</Link>
                </li>
                <li className={pathname === "/owner/rooms" ? "active" : ""}>
                    <Link to="/owner/rooms"><HomeOutlined/> Quản lý phòng</Link>
                </li>
                <li className={pathname === "/owner/tenants" ? "active" : ""}>
                    <Link to="/owner/tenants"><UserOutlined/> Người thuê</Link>
                </li>
            </ul>
        </div>
    );
};

export default OwnerSidebar;
