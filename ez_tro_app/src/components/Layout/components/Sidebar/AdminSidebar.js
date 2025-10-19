import React from "react";
import classNames from "classnames/bind";
import styles from "./AdminSidebar.module.scss";
import {MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined} from "@ant-design/icons";

const cx = classNames.bind(styles);

const AdminSidebar = ({
                          menu,
                          selected,
                          onSelect,
                          collapsed,
                          onCollapse,
                          onLogout,
                      }) => {
    return (
        <div className={cx("sidebar", {collapsed})}>
            {/* Header */}
            <div className={cx("sidebarHeader")}>
                <h2 className={cx("title")}>{!collapsed && "Admin Panel"}</h2>
                <button
                    className={cx("collapseBtn")}
                    onClick={onCollapse}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                </button>
            </div>

            {/* Menu Items */}
            <ul className={cx("menu")}>
                {menu.map((item) => (
                    <li
                        key={item.key}
                        className={cx("menuItem", {active: selected === item.key})}
                        onClick={() => onSelect(item.key)}
                        title={collapsed ? item.label : ""}
                    >
            <span
                className={cx("icon")}
                style={{color: item.color}}
            >
              {item.icon}
            </span>
                        {!collapsed && <span className={cx("label")}>{item.label}</span>}
                    </li>
                ))}
            </ul>

            {/* Logout Button */}
            <div className={cx("bottom")}>
                <li
                    className={cx("menuItem")}
                    onClick={onLogout}
                    title={collapsed ? "Logout" : ""}
                >
          <span className={cx("icon", "logoutIcon")}>
            <LogoutOutlined/>
          </span>
                    {!collapsed && <span className={cx("label")}>Đăng xuất</span>}
                </li>
            </div>
        </div>
    );
};

export default AdminSidebar;