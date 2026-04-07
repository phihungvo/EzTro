import React, {useEffect, useMemo, useState} from "react";
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
    AppstoreOutlined
} from "@ant-design/icons";
import {useLocation, useNavigate} from "react-router-dom";
import {message, Button} from "antd";
import NotificationBell from "~/components/Layout/AdminLayout/components/NotificationBell";
import NotificationCenter from "~/pages/Common/NotificationCenter";
import {getMyProfile} from "~/service/user/profile";
import {getMyRoomInfo} from "~/service/user/my-room";

const cx = classNames.bind(styles);

const userMenuConfig = [
    {
        key: "notifications",
        label: "Thông Báo",
        icon: <BellOutlined/>,
        component: <NotificationCenter embedded/>,
    },
    {
        key: "dashboard",
        label: "Trang Chủ",
        icon: <HomeOutlined/>,
        component: <Dashboard/>,
    },
    {
        key: "my-room",
        label: "Phòng Của Tôi",
        icon: <AppstoreOutlined/>,
        component: <MyRoom/>,
    },
    {
        key: "bills",
        label: "Hóa Đơn",
        icon: <DollarOutlined/>,
        component: <Bills/>,
    },
    {
        key: "contract",
        label: "Hợp Đồng",
        icon: <FileTextOutlined/>,
        component: <Contract/>,
    },
    {
        key: "utilities",
        label: "Điện/Nước",
        icon: <ThunderboltOutlined/>,
        component: <Utilities/>,
    },
    {
        key: "profile",
        label: "Thông Tin",
        icon: <UserOutlined/>,
        component: <Profile/>,
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
    if (tabParam && TAB_KEYS_SET.has(tabParam)) {
        return tabParam;
    }

    const normalized = String(pathname || "").replace(/\/+$/, "");
    if (normalized === "/user" || normalized === "/user/dashboard" || normalized === "") {
        return "dashboard";
    }

    const segment = normalized.replace(/^\/user\/?/, "").split("/")[0];
    const mapped = SEGMENT_TO_TAB[segment];
    return mapped && TAB_KEYS_SET.has(mapped) ? mapped : "dashboard";
};

const UserLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selected, setSelected] = useState("dashboard");
    const [userInfo, setUserInfo] = useState({name: "Tenant", room: ""});

    const canonicalUrl = useMemo(() => {
        const tab = resolveTabFromUrl(location.pathname, location.search);
        return {pathname: "/user/dashboard", search: `?tab=${encodeURIComponent(tab)}`};
    }, [location.pathname, location.search]);

    useEffect(() => {
        const tab = resolveTabFromUrl(location.pathname, location.search);
        setSelected(tab);

        const shouldCanonicalize = location.pathname !== canonicalUrl.pathname
            || location.search !== canonicalUrl.search;
        if (shouldCanonicalize) {
            navigate(canonicalUrl, {replace: true});
        }
    }, [canonicalUrl, location.pathname, location.search, navigate]);

    useEffect(() => {
        let active = true;

        const computeInitials = (name) => {
            const parts = String(name || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean);
            const first = parts[0]?.[0] || "T";
            const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
            return `${first}${last}`.toUpperCase();
        };

        const loadUserInfo = async () => {
            try {
                const [profile, roomRes] = await Promise.all([
                    getMyProfile().catch(() => null),
                    getMyRoomInfo().catch(() => null),
                ]);

                if (!active) return;

                const name = profile?.fullName || profile?.email || "Tenant";
                const room = roomRes?.result?.roomNumber || "";
                setUserInfo({name, room, initials: computeInitials(name)});
            } catch {
                // ignore
            }
        };

        loadUserInfo();
        return () => {
            active = false;
        };
    }, []);

    const activeMenu = userMenuConfig.find((item) => item.key === selected);

    const handleTabChange = (tabKey) => {
        if (!TAB_KEYS_SET.has(tabKey)) {
            return;
        }
        navigate({pathname: "/user/dashboard", search: `?tab=${encodeURIComponent(tabKey)}`});
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
        message.success("Đăng xuất thành công");
    };

    return (
        <div className={cx("wrapper")}>
            {/* Header */}
            <header className={cx("header")}>
                <div className={cx("headerContent")}>
                    <div className={cx("logo")}>
                        <span className={cx("icon")}>🏠</span>
                        <h1 className={cx("title")}>Portal Nhà Trọ</h1>
                    </div>
                    <div className={cx("userSection")}>
                        <div className={cx("userProfile")}>
                            <div className={cx("avatar")}>{userInfo.initials || "T"}</div>
                            <span className={cx("userName")}>{userInfo.name}</span>
                        </div>
                        <NotificationBell/>
                        <Button
                            type="primary"
                            onClick={handleLogout}
                            className={cx("logoutBtn")}
                        >
                            Đăng Xuất
                        </Button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className={cx("navigation")}>
                <div className={cx("navContent")}>
                    {userMenuConfig.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => handleTabChange(item.key)}
                            className={cx("navItem", {active: selected === item.key})}
                        >
                            <span className={cx("navIcon")}>{item.icon}</span>
                            <span className={cx("navLabel")}>{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className={cx("content")}>
                <div className={cx("contentWrapper")}>
                    {activeMenu?.component || <div>Không tìm thấy trang</div>}
                </div>
            </main>
        </div>
    );
};

export default UserLayout;
