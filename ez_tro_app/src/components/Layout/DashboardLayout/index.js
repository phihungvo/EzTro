import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './DashboardLayout.module.scss';
import Sidebar from '../components/Sidebar';
import Header from '../Header';
import {
    HomeOutlined,
    BellOutlined,
    ShopOutlined,
    SettingFilled,
    SafetyOutlined,
    LockOutlined,
    BankOutlined,        // 🏢 Nhà trọ
    AppstoreOutlined,    // 🧱 Toà nhà
    HomeTwoTone,         // 🏠 Phòng
    UserOutlined,        // 👤 Người thuê
    FileTextOutlined,    // 🧾 Hợp đồng
    FileDoneOutlined,    // 💵 Hoá đơn
    ThunderboltOutlined, // ⚡ Điện/Nước
    NotificationOutlined,// 🔔 Thông báo
    ToolOutlined,        // ⚙️ Cài đặt
    ShoppingOutlined,    // 🛍️ Cửa hàng
} from '@ant-design/icons';

const cx = classNames.bind(styles);

const sideBar = [
    {
        title: 'Dashboard',
        color: '#40c4ff',
        icon: <HomeOutlined />,
        url: '/admin/dashboard',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Toà nhà',
        color: '#1976d2',
        icon: <AppstoreOutlined />,
        url: '/admin/buildings',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Phòng',
        color: '#8e24aa',
        icon: <HomeTwoTone twoToneColor="#8e24aa" />,
        url: '/admin/rooms',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Người thuê',
        color: '#ec407a',
        icon: <UserOutlined />,
        url: '/admin/tenants',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Nhà trọ',
        color: '#7e57c2',
        icon: <BankOutlined />,
        url: '/admin/boarding-houses',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Hợp đồng',
        color: '#ff7043',
        icon: <FileTextOutlined />,
        url: '/admin/contracts',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Hoá đơn',
        color: '#d4a017',
        icon: <FileDoneOutlined />,
        url: '/admin/bills',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Điện/Nước',
        color: '#00bcd4',
        icon: <ThunderboltOutlined />,
        url: '/admin/electric-water',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Thông báo',
        color: '#ff4d4f',
        icon: <NotificationOutlined />,
        role: 'USER',
        permissions: ['USER:READ'],
    },
    {
        title: 'Cài đặt',
        color: '#3f51b5',
        icon: <ToolOutlined />,
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
    },
    {
        title: 'Cửa hàng',
        color: '#ffab00',
        icon: <ShoppingOutlined />,
        role: 'USER',
        permissions: ['USER:READ'],
    },
];

function DashboardLayout({ children, pageTitle }) {
    const [collapsed, setCollapsed] = useState(false);
    const title = pageTitle || 'Dashboard';

    const toggleCollapsed = () => setCollapsed(!collapsed);

    return (
        <div className={cx('wrapper')}>
            <Sidebar
                hiddenLogo={true}
                dataSource={sideBar}
                collapsed={collapsed}
                onCollapse={toggleCollapsed}
            />
            <div className={cx('right-container', { collapsed })}>
                <Header title={title} />
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

export default DashboardLayout;
