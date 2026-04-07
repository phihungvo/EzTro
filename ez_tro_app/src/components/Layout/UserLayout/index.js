import React, { useEffect, useMemo, useState, useCallback } from "react";
import classNames from "classnames/bind";
import styles from "./UserLayout.module.scss";
import Dashboard from "~/pages/User/Dashboard";
import MyRoom from "~/pages/User/MyRoom";
import Bills from "~/pages/User/Bills";
import Contract from "~/pages/User/Contract";
import Utilities from "~/pages/User/Utilities";
import Profile from "~/pages/User/Profile";

import {
    BellOutlined,
    HomeOutlined,
    FileTextOutlined,
    DollarOutlined,
    ThunderboltOutlined,
    UserOutlined,
    AppstoreOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Badge, Tooltip } from "antd";
import NotificationBell from "~/components/Layout/AdminLayout/components/NotificationBell";
import NotificationCenter from "~/pages/Common/NotificationCenter";
import { getMyProfile } from "~/service/user/profile";
import { getMyRoomInfo } from "~/service/user/my-room";

const cx = classNames.bind(styles);

const userMenuConfig = [
    {
        key: "dashboard",
        label: "Trang Chủ",
        icon: <HomeOutlined />,
        component: <Dashboard />,
        description: "Tổng quan",
    },
    {
        key: "my-room",
        label: "Phòng Của Tôi",
        icon: <AppstoreOutlined />,
        component: <MyRoom />,
        description: "Thông tin phòng",
    },
    {
        key: "bills",
        label: "Hóa Đơn",
        icon: <DollarOutlined />,
        component: <Bills />,
        description: "Thanh toán",
    },
    {
        key: "contract",
        label: "Hợp Đồng",
        icon: <FileTextOutlined />,
        component: <Contract />,
        description: "Hợp đồng thuê",
    },
    {
        key: "utilities",
        label: "Điện / Nước",
        icon: <ThunderboltOutlined />,
        component: <Utilities />,
        description: "Chỉ số tiêu thụ",
    },
    {
        key: "notifications",
        label: "Thông Báo",
        icon: <BellOutlined />,
        component: <NotificationCenter embedded />,
        description: "Thông báo mới",
    },
    {
        key: "profile",
        label: "Hồ Sơ",
        icon: <UserOutlined />,
        component: <Profile />,
        description: "Thông tin cá nhân",
    },
];

const TAB_KEYS = userMenuConfig.map((item) => item.key);
const TAB_KEYS_SET = new Set(TAB_KEYS);

const SEGMENT_TO_TAB = {
    dashboard: "dashboard",
    notifications: "notifications",
    "my-room": "my-room",
    bills: "bills",
    contract: "contract",
    utilities: "utilities",
    profile: "profile",
    maintenance: "my-room",
};

const resolveTabFromUrl = (pathname, search) => {
    const params = new URLSearchParams(search || "");
    const tabParam = params.get("tab");
    if (tabParam && TAB_KEYS_SET.has(tabParam)) return tabParam;

    const normalized = String(pathname || "").replace(/\/+$/, "");
    if (
        normalized === "/user" ||
        normalized === "/user/dashboard" ||
        normalized === ""
    )
        return "dashboard";

    const segment = normalized.replace(/^\/user\/?/, "").split("/")[0];
    const mapped = SEGMENT_TO_TAB[segment];
    return mapped && TAB_KEYS_SET.has(mapped) ? mapped : "dashboard";
};

const computeInitials = (name) => {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    const first = parts[0]?.[0] || "T";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return `${first}${last}`.toUpperCase();
};

// ─── Skeleton loader ────────────────────────────────────────────────────────
const SkeletonLoader = () => (
    <div className={cx("skeleton")}>
        {[...Array(3)].map((_, i) => (
            <div key={i} className={cx("skeletonCard")} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className={cx("skeletonHeader")} />
                <div className={cx("skeletonLine")} />
                <div className={cx("skeletonLine", "short")} />
            </div>
        ))}
    </div>
);

// ─── Main Layout ─────────────────────────────────────────────────────────────
const UserLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [selected, setSelected] = useState("dashboard");
    const [userInfo, setUserInfo] = useState({ name: "Tenant", room: "", initials: "T" });
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [contentKey, setContentKey] = useState(0); // for re-mount animation

    const canonicalUrl = useMemo(() => {
        const tab = resolveTabFromUrl(location.pathname, location.search);
        return { pathname: "/user/dashboard", search: `?tab=${encodeURIComponent(tab)}` };
    }, [location.pathname, location.search]);

    useEffect(() => {
        const tab = resolveTabFromUrl(location.pathname, location.search);
        setSelected(tab);
        setContentKey((k) => k + 1);

        const shouldCanonicalize =
            location.pathname !== canonicalUrl.pathname ||
            location.search !== canonicalUrl.search;
        if (shouldCanonicalize) navigate(canonicalUrl, { replace: true });
    }, [canonicalUrl, location.pathname, location.search, navigate]);

    useEffect(() => {
        let active = true;
        const loadUserInfo = async () => {
            try {
                setLoading(true);
                const [profile, roomRes] = await Promise.all([
                    getMyProfile().catch(() => null),
                    getMyRoomInfo().catch(() => null),
                ]);
                if (!active) return;
                const name = profile?.fullName || profile?.email || "Tenant";
                const room = roomRes?.result?.roomNumber || "";
                setUserInfo({ name, room, initials: computeInitials(name) });
            } catch {
                // ignore
            } finally {
                if (active) setLoading(false);
            }
        };
        loadUserInfo();
        return () => { active = false; };
    }, []);

    const activeMenu = userMenuConfig.find((item) => item.key === selected);

    const handleTabChange = useCallback((tabKey) => {
        if (!TAB_KEYS_SET.has(tabKey)) return;
        setMobileNavOpen(false);
        navigate({ pathname: "/user/dashboard", search: `?tab=${encodeURIComponent(tabKey)}` });
    }, [navigate]);

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate("/login");
        message.success("Đăng xuất thành công");
    }, [navigate]);

    return (
        <div className={cx("wrapper")}>
            {/* ── Sidebar ── */}
            <aside className={cx("sidebar", { collapsed: sidebarCollapsed, mobileOpen: mobileNavOpen })}>
                {/* Logo */}
                <div className={cx("sidebarLogo")}>
                    <div className={cx("logoMark")}>
                        <span className={cx("logoIcon")}>🏠</span>
                    </div>
                    {!sidebarCollapsed && (
                        <div className={cx("logoText")}>
                            <span className={cx("logoTitle")}>Portal</span>
                            <span className={cx("logoSub")}>Nhà Trọ</span>
                        </div>
                    )}
                </div>

                {/* User Card */}
                <div className={cx("userCard", { mini: sidebarCollapsed })}>
                    <div className={cx("userAvatar")}>
                        <span>{userInfo.initials}</span>
                        <span className={cx("onlineDot")} />
                    </div>
                    {!sidebarCollapsed && (
                        <div className={cx("userMeta")}>
                            <span className={cx("userNameText")}>{userInfo.name}</span>
                            {userInfo.room && (
                                <span className={cx("userRoom")}>Phòng {userInfo.room}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className={cx("sidebarDivider")} />

                {/* Nav Items */}
                <nav className={cx("sidebarNav")}>
                    {userMenuConfig.map((item) => {
                        const isActive = selected === item.key;
                        return (
                            <Tooltip
                                key={item.key}
                                title={sidebarCollapsed ? item.label : ""}
                                placement="right"
                                overlayClassName={cx("navTooltip")}
                            >
                                <button
                                    onClick={() => handleTabChange(item.key)}
                                    className={cx("navItem", { active: isActive })}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {isActive && <span className={cx("activeBar")} />}
                                    <span className={cx("navItemIcon")}>{item.icon}</span>
                                    {!sidebarCollapsed && (
                                        <div className={cx("navItemText")}>
                                            <span className={cx("navItemLabel")}>{item.label}</span>
                                            <span className={cx("navItemDesc")}>{item.description}</span>
                                        </div>
                                    )}
                                    {isActive && !sidebarCollapsed && (
                                        <span className={cx("activeChevron")}>›</span>
                                    )}
                                </button>
                            </Tooltip>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className={cx("sidebarFooter")}>
                    <div className={cx("sidebarDivider")} />
                    <Tooltip
                        title={sidebarCollapsed ? "Đăng Xuất" : ""}
                        placement="right"
                    >
                        <button onClick={handleLogout} className={cx("logoutBtn")}>
                            <LogoutOutlined className={cx("logoutIcon")} />
                            {!sidebarCollapsed && <span>Đăng Xuất</span>}
                        </button>
                    </Tooltip>
                </div>

                {/* Collapse Toggle */}
                <button
                    className={cx("collapseBtn")}
                    onClick={() => setSidebarCollapsed((v) => !v)}
                    aria-label="Toggle sidebar"
                >
                    {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
            </aside>

            {/* Mobile overlay */}
            {mobileNavOpen && (
                <div
                    className={cx("mobileOverlay")}
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            {/* ── Main Area ── */}
            <div className={cx("mainArea")}>
                {/* Top Bar */}
                <header className={cx("topBar")}>
                    <div className={cx("topBarLeft")}>
                        <button
                            className={cx("mobileMenuBtn")}
                            onClick={() => setMobileNavOpen((v) => !v)}
                            aria-label="Open menu"
                        >
                            <MenuUnfoldOutlined />
                        </button>

                        {/* Breadcrumb */}
                        <div className={cx("breadcrumb")}>
                            <span className={cx("breadcrumbRoot")}>Portal</span>
                            <span className={cx("breadcrumbSep")}>/</span>
                            <span className={cx("breadcrumbCurrent")}>{activeMenu?.label}</span>
                        </div>
                    </div>

                    <div className={cx("topBarRight")}>
                        <NotificationBell />
                        {/*<div className={cx("topUserChip")}>*/}
                        {/*    <div className={cx("topAvatar")}>{userInfo.initials}</div>*/}
                        {/*    <span className={cx("topUserName")}>{userInfo.name}</span>*/}
                        {/*</div>*/}
                    </div>
                </header>

                {/* Content */}
                <main className={cx("content")}>
                    {/* Page Header */}
                    {/*<div className={cx("pageHeader")}>*/}
                    {/*    <div className={cx("pageHeaderIcon")}>{activeMenu?.icon}</div>*/}
                    {/*    <div>*/}
                    {/*        <h1 className={cx("pageTitle")}>{activeMenu?.label}</h1>*/}
                    {/*        <p className={cx("pageSubtitle")}>{activeMenu?.description}</p>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/* Content Body */}
                    <div key={contentKey} className={cx("contentBody")}>
                        {loading ? (
                            <SkeletonLoader />
                        ) : (
                            activeMenu?.component || (
                                <div className={cx("emptyState")}>
                                    <span className={cx("emptyIcon")}>🔍</span>
                                    <h3>Không tìm thấy trang</h3>
                                    <p>Trang bạn yêu cầu không tồn tại.</p>
                                </div>
                            )
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;