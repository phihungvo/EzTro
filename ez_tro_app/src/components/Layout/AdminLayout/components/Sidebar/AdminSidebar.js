import React from "react";
import classNames from "classnames/bind";
import styles from "./AdminSidebar.module.scss";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined
} from "@ant-design/icons";

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
        <aside className={cx("sidebar", { collapsed })} role="navigation">
            {/* Header */}
            <div className={cx("sidebarHeader")}>
                {!collapsed && <h2 className={cx("title")}>Admin Panel</h2>}
                <button
                    className={cx("collapseBtn")}
                    onClick={onCollapse}
                    title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                    aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                >
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
            </div>

            {/* Menu Groups */}
            <div className={cx("menuContainer")}>
                {menu.map((group, groupIndex) => (
                    <div key={group.group || groupIndex} className={cx("menuGroup")}>
                        {!collapsed && group.group && (
                            <div className={cx("groupTitle")} role="presentation">
                                {group.group}
                            </div>
                        )}

                        <ul className={cx("menu")} role="menu">
                            {group.items.map((item) => (
                                <li
                                    key={item.key}
                                    className={cx("menuItem", { active: selected === item.key })}
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
                  <span
                      className={cx("icon")}
                      style={{ color: item.color }}
                      aria-hidden="true"
                  >
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
                ))}
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
              <LogoutOutlined />
            </span>
                        {!collapsed && <span className={cx("label")}>Đăng xuất</span>}
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default AdminSidebar;