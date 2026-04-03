import React, {useEffect, useState} from "react";
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
import {useNavigate, useSearchParams} from "react-router-dom";
import {message, Button} from "antd";
import NotificationBell from "~/components/Layout/AdminLayout/components/NotificationBell";
import NotificationCenter from "~/pages/Common/NotificationCenter";

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

const UserLayout = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selected, setSelected] = useState(searchParams.get("tab") || "dashboard");

    // Mock user info - replace with real data
    const userInfo = {
        name: "Nguyễn Văn C",
        room: "101",
    };

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && userMenuConfig.some((item) => item.key === tab)) {
            setSelected(tab);
            return;
        }
        setSelected("dashboard");
    }, [searchParams]);

    const activeMenu = userMenuConfig.find((item) => item.key === selected);

    const handleTabChange = (tabKey) => {
        setSelected(tabKey);
        setSearchParams({tab: tabKey});
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
                            <div className={cx("avatar")}>NC</div>
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
