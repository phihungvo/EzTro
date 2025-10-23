import React from "react";
import classNames from "classnames/bind";
import styles from "./UserSidebar.module.scss";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    HomeOutlined,
    FileTextOutlined,
    DollarOutlined,
    ThunderboltOutlined,
    UserOutlined,
    PhoneOutlined
} from "@ant-design/icons";

const cx = classNames.bind(styles);

const UserSidebar = ({
                         menu,
                         selected,
                         onSelect,
                         collapsed,
                         onCollapse,
                         onLogout,
                         userInfo
                     }) => {
    return (
        <aside className={cx("sidebar", {collapsed})} role="navigation">
            {/* Header with User Info */}
            <div className={cx("sidebarHeader")}>
                {!collapsed && (
                    <div className={cx("userProfile")}>
                        <div className={cx("avatar")}>
                            {userInfo?.name?.charAt(0) || "U"}
                        </div>
                        <div className={cx("userDetails")}>
                            <h3 className={cx("userName")}>{userInfo?.name || "Người dùng"}</h3>
                            <span className={cx("roomNumber")}>Phòng {userInfo?.room || "101"}</span>
                        </div>
                    </div>
                )}
                <button
                    className={cx("collapseBtn")}
                    onClick={onCollapse}
                    title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                    aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                >
                    {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                </button>
            </div>

            {/* Menu Items */}
            <div className={cx("menuContainer")}>
                <ul className={cx("menu")} role="menu">
                    {menu.map((item) => (
                        <li
                            key={item.key}
                            className={cx("menuItem", {active: selected === item.key})}
                            onClick={() => onSelect(item.key)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    onSelect(item.key);
                                }
                            }}
                            title={collapsed ? item.label : undefined}
                            role="menuitem"
                            tabIndex={0}
                            aria-current={selected === item.key ? "page" : undefined}
                        >
                            <span className={cx("icon")} aria-hidden="true">
                                {item.icon}
                            </span>
                            {!collapsed && (
                                <>
                                    <span className={cx("label")}>{item.label}</span>
                                    {item.badge && (
                                        <span className={cx("badge")}>{item.badge}</span>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Logout Button */}
            <div className={cx("bottom")}>
                <ul className={cx("menu")} role="menu">
                    <li
                        className={cx("menuItem")}
                        onClick={onLogout}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                onLogout();
                            }
                        }}
                        title={collapsed ? "Đăng xuất" : undefined}
                        role="menuitem"
                        tabIndex={0}
                    >
                        <span className={cx("icon")} aria-hidden="true">
                            <LogoutOutlined/>
                        </span>
                        {!collapsed && <span className={cx("label")}>Đăng xuất</span>}
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default UserSidebar;