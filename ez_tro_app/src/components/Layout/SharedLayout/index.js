import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./SharedLayout.module.scss";
import Header from "../Header";
import {MENU_CONFIG} from "~/config/sidebarMenus";
import {useAuth} from "~/routes/AuthContext";
import {message} from "antd";
import AdminSidebar from "~/components/Layout/AdminLayout/components/Sidebar/AdminSidebar";

const cx = classNames.bind(styles);

const SharedLayout = ({children}) => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const role = user?.role?.toUpperCase();
    const menu = MENU_CONFIG[role] || MENU_CONFIG.OWNER;

    const getActiveKey = () => {
        const item = menu
            .flatMap(g => g.items)
            .find(i => location.pathname === i.path || location.pathname.startsWith(i.path + "/"));
        return item?.key || "dashboard";
    };

    const activeItem = menu
        .flatMap(g => g.items)
        .find(i => i.key === getActiveKey());

    const handleMenuSelect = (key) => {
        const item = menu.flatMap(g => g.items).find(i => i.key === key);
        if (item) navigate(item.path);
    };

    const handleLogout = () => {
        logout();
        message.success("Đăng xuất thành công!");
    };

    return (<div className={cx("wrapper")}>
            <AdminSidebar
                menu={menu}
                selected={getActiveKey()}
                onSelect={handleMenuSelect}
                collapsed={collapsed}
                onCollapse={() => setCollapsed(prev => !prev)}
                onLogout={handleLogout}
            />

            <div className={cx("main", {collapsed})}>
                <Header title={activeItem?.title || "Trang quản trị"}/>
                <div className={cx("content")}>
                    {children}
                </div>
            </div>
        </div>);
};

export default SharedLayout;