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
    TeamOutlined,
    UsergroupAddOutlined,
    ApartmentOutlined, 
    SolutionOutlined,
    ClockCircleOutlined,
    BarChartOutlined, 
    BookOutlined, 
    ProjectOutlined, 
    CalendarOutlined, 
    DollarOutlined, 
    CoffeeOutlined,
    IdcardOutlined,
    UserAddOutlined
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
        title: 'Người dùng',
        color: '#1890ff', 
        icon: <TeamOutlined />,
        url: '/admin/user-management',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Nhân viên',
        color: '#ab47bc', 
        icon: <UsergroupAddOutlined />,
        url: '/admin/employee',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Phòng ban',
        color: '#ec407a',
        icon: <ApartmentOutlined />,
        url: '/admin/department',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Chức vụ',
        color: '#7e57c2', 
        icon: <SolutionOutlined />,
        url: '/admin/position',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Nghĩ phép',
        color: '#ff7043', 
        icon: <CoffeeOutlined />, 
        url: '/admin/leave',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Bảng lương',
        color: '#d4a017', 
        icon: <DollarOutlined />, 
        url: '/admin/payroll',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Nhóm',
        color: '#0baedb',
        icon: <TeamOutlined />,
        url: '/admin/team',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Tuyển dụng',
        color: '#26a69a',
        icon: <UserAddOutlined />,
        url: '/admin/recruitment',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Chấm công',
        color: '#26a69a',
        icon: <ClockCircleOutlined />, 
        url: '/admin/attendance',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Hiệu suất',
        color: '#ffa726', 
        icon: <BarChartOutlined />, 
        url: '/admin/performance',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Đào tạo',
        color: '#66bb6a', 
        icon: <BookOutlined />,
        url: '/admin/training',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Dự án',
        color: '#ef5350',
        icon: <ProjectOutlined />, 
        url: '/admin/project',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Bảng chấm công',
        color: '#29b6f6',
        icon: <CalendarOutlined />, 
        url: '/admin/timesheet',
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
        roleIcon: <SafetyOutlined />,
        permissionIcon: <LockOutlined />,
    },
    {
        title: 'Thông báo',
        color: '#ff4d4f',
        icon: <BellOutlined />,
        role: 'USER',
        permissions: ['USER:READ'],
    },
    {
        title: 'Cài đặt',
        color: '#3f51b5', 
        icon: <SettingFilled />,
        role: 'ADMIN',
        permissions: ['ADMIN:MANAGE'],
    },
    {
        title: 'Cửa hàng',
        color: '#ffab00',
        icon: <ShopOutlined />,
        role: 'USER',
        permissions: ['USER:READ'],
    },
];

function DashboardLayout({ children, pageTitle }) {
    const [collapsed, setCollapsed] = useState(false);
    const title = pageTitle || 'Dashboard';

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

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