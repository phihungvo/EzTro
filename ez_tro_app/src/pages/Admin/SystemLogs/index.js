import React, {useState, useMemo} from 'react';
import {
    Card, Table, Tag, Input, Select, DatePicker, Space, Button, Badge,
    Typography, Avatar, Tooltip, Timeline, Divider, Statistic, Row, Col,
    Tabs, Switch, Dropdown, Menu, Empty,
} from 'antd';
import {
    SearchOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined,
    ClockCircleOutlined, UserOutlined, CheckCircleOutlined, WarningOutlined,
    CloseCircleOutlined, InfoCircleOutlined, DeleteOutlined, EditOutlined,
    EyeOutlined, LockOutlined, UnlockOutlined, FileTextOutlined,
    DollarOutlined, HomeOutlined, TeamOutlined, SettingOutlined,
    BellOutlined, MailOutlined, PhoneOutlined, CalendarOutlined,
    SyncOutlined, DatabaseOutlined, CloudServerOutlined, SafetyOutlined,
    ThunderboltOutlined, RocketOutlined, FireOutlined, TrophyOutlined,
    MoreOutlined, ExportOutlined, PrinterOutlined, ShareAltOutlined, EnvironmentOutlined, DesktopOutlined,
} from '@ant-design/icons';
import styles from './SystemLogs.module.scss';

const {Title, Text, Paragraph} = Typography;
const {RangePicker} = DatePicker;
const {TabPane} = Tabs;

function SystemLogs() {
    const [searchText, setSearchText] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedUser, setSelectedUser] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // table or timeline

    // Mock data - System Logs
    const mockLogs = [
        {
            id: 'LOG-2026-001',
            timestamp: '2026-02-08 14:32:18',
            level: 'success',
            category: 'authentication',
            user: 'Nguyễn Văn A',
            userId: 'USR-001',
            action: 'Đăng nhập hệ thống',
            description: 'Đăng nhập thành công từ IP 192.168.1.100',
            ip: '192.168.1.100',
            device: 'Chrome 121 on Windows 10',
            location: 'Ho Chi Minh, Vietnam',
            details: {method: 'email', status: 'success', duration: '1.2s'}
        },
        {
            id: 'LOG-2026-002',
            timestamp: '2026-02-08 14:28:45',
            level: 'info',
            category: 'room',
            user: 'Trần Thị B',
            userId: 'USR-002',
            action: 'Tạo phòng mới',
            description: 'Thêm phòng "A101" vào tòa nhà "Tòa A"',
            ip: '192.168.1.105',
            device: 'Safari 17 on macOS',
            location: 'Hanoi, Vietnam',
            details: {roomCode: 'A101', building: 'Tòa A', price: '3.5M VNĐ'}
        },
        {
            id: 'LOG-2026-003',
            timestamp: '2026-02-08 14:25:12',
            level: 'warning',
            category: 'payment',
            user: 'Lê Văn C',
            userId: 'USR-003',
            action: 'Thanh toán trễ hạn',
            description: 'Thanh toán hóa đơn #INV-2026-0234 chậm 3 ngày',
            ip: '192.168.1.112',
            device: 'Chrome Mobile on Android 14',
            location: 'Da Nang, Vietnam',
            details: {invoice: 'INV-2026-0234', amount: '3.5M VNĐ', lateDays: 3}
        },
        {
            id: 'LOG-2026-004',
            timestamp: '2026-02-08 14:20:33',
            level: 'error',
            category: 'system',
            user: 'System',
            userId: 'SYS-000',
            action: 'Lỗi backup database',
            description: 'Backup database thất bại do hết dung lượng ổ đĩa',
            ip: 'localhost',
            device: 'System Daemon',
            location: 'Server DC-01',
            details: {errorCode: 'DISK_FULL', diskUsage: '98%', requiredSpace: '2.5GB'}
        },
        {
            id: 'LOG-2026-005',
            timestamp: '2026-02-08 14:15:28',
            level: 'success',
            category: 'contract',
            user: 'Phạm Thị D',
            userId: 'USR-004',
            action: 'Ký hợp đồng điện tử',
            description: 'Hợp đồng #CON-2026-0156 được ký thành công',
            ip: '192.168.1.120',
            device: 'Edge 121 on Windows 11',
            location: 'Can Tho, Vietnam',
            details: {contract: 'CON-2026-0156', room: 'B205', duration: '12 months'}
        },
        {
            id: 'LOG-2026-006',
            timestamp: '2026-02-08 14:10:55',
            level: 'info',
            category: 'utility',
            user: 'Hoàng Văn E',
            userId: 'USR-005',
            action: 'Ghi chỉ số điện nước',
            description: 'Cập nhật chỉ số điện nước tháng 2/2026 cho phòng C301',
            ip: '192.168.1.130',
            device: 'Chrome 121 on Linux',
            location: 'Hai Phong, Vietnam',
            details: {room: 'C301', electric: '245 kWh', water: '12 m³', month: '02/2026'}
        },
        {
            id: 'LOG-2026-007',
            timestamp: '2026-02-08 14:05:42',
            level: 'warning',
            category: 'security',
            user: 'Unknown',
            userId: 'N/A',
            action: 'Thử đăng nhập thất bại',
            description: '5 lần thử đăng nhập sai mật khẩu cho tài khoản admin@example.com',
            ip: '45.123.45.67',
            device: 'curl/7.88.1',
            location: 'Unknown Location',
            details: {attempts: 5, account: 'admin@example.com', blocked: true}
        },
        {
            id: 'LOG-2026-008',
            timestamp: '2026-02-08 14:00:15',
            level: 'success',
            category: 'invoice',
            user: 'Võ Thị F',
            userId: 'USR-006',
            action: 'Xuất hóa đơn tự động',
            description: 'Tạo hóa đơn tháng 2/2026 cho 45 phòng',
            ip: '192.168.1.140',
            device: 'Firefox 122 on Windows 10',
            location: 'Ho Chi Minh, Vietnam',
            details: {totalRooms: 45, totalAmount: '157.5M VNĐ', invoiceMonth: '02/2026'}
        },
        {
            id: 'LOG-2026-009',
            timestamp: '2026-02-08 13:55:23',
            level: 'info',
            category: 'tenant',
            user: 'Đặng Văn G',
            userId: 'USR-007',
            action: 'Thêm khách thuê mới',
            description: 'Đăng ký khách thuê "Nguyễn Thị H" vào phòng D402',
            ip: '192.168.1.150',
            device: 'Chrome 121 on macOS',
            location: 'Hanoi, Vietnam',
            details: {tenantName: 'Nguyễn Thị H', room: 'D402', moveInDate: '15/02/2026'}
        },
        {
            id: 'LOG-2026-010',
            timestamp: '2026-02-08 13:50:08',
            level: 'error',
            category: 'payment',
            user: 'Payment Gateway',
            userId: 'PG-001',
            action: 'Giao dịch thất bại',
            description: 'Thanh toán online bị từ chối bởi ngân hàng',
            ip: '203.162.4.190',
            device: 'API Client',
            location: 'VietcomBank Gateway',
            details: {transactionId: 'TXN-20260208-1234', amount: '4.2M VNĐ', reason: 'Insufficient funds'}
        },
        {
            id: 'LOG-2026-011',
            timestamp: '2026-02-08 13:45:30',
            level: 'success',
            category: 'report',
            user: 'Bùi Văn I',
            userId: 'USR-008',
            action: 'Xuất báo cáo doanh thu',
            description: 'Xuất báo cáo doanh thu tháng 1/2026 thành công',
            ip: '192.168.1.160',
            device: 'Chrome 121 on Windows 11',
            location: 'Da Nang, Vietnam',
            details: {reportType: 'Revenue', period: '01/2026', format: 'Excel', size: '2.4MB'}
        },
        {
            id: 'LOG-2026-012',
            timestamp: '2026-02-08 13:40:17',
            level: 'info',
            category: 'maintenance',
            user: 'Lý Thị K',
            userId: 'USR-009',
            action: 'Tạo yêu cầu sửa chữa',
            description: 'Yêu cầu sửa máy lạnh tại phòng E501',
            ip: '192.168.1.170',
            device: 'Mobile App iOS',
            location: 'Can Tho, Vietnam',
            details: {issue: 'Air conditioner not working', room: 'E501', priority: 'High'}
        },
        {
            id: 'LOG-2026-013',
            timestamp: '2026-02-08 13:35:45',
            level: 'warning',
            category: 'system',
            user: 'System Monitor',
            userId: 'SYS-001',
            action: 'CPU usage cao',
            description: 'CPU usage đạt 85% trong 10 phút',
            ip: 'localhost',
            device: 'Monitoring Daemon',
            location: 'Server DC-01',
            details: {cpuUsage: '85%', duration: '10 minutes', threshold: '80%'}
        },
        {
            id: 'LOG-2026-014',
            timestamp: '2026-02-08 13:30:22',
            level: 'success',
            category: 'authentication',
            user: 'Trương Văn L',
            userId: 'USR-010',
            action: 'Đổi mật khẩu',
            description: 'Cập nhật mật khẩu thành công',
            ip: '192.168.1.180',
            device: 'Safari 17 on iOS 17',
            location: 'Hai Phong, Vietnam',
            details: {method: 'password_change', verified: true, notificationSent: true}
        },
        {
            id: 'LOG-2026-015',
            timestamp: '2026-02-08 13:25:10',
            level: 'info',
            category: 'notification',
            user: 'System',
            userId: 'SYS-000',
            action: 'Gửi thông báo nhắc nhở',
            description: 'Gửi 23 email nhắc thanh toán cho khách thuê',
            ip: 'localhost',
            device: 'Email Service',
            location: 'Email Server',
            details: {totalSent: 23, successRate: '100%', bounceRate: '0%'}
        },
        {
            id: 'LOG-2026-016',
            timestamp: '2026-02-08 13:20:38',
            level: 'error',
            category: 'integration',
            user: 'SMS Gateway',
            userId: 'SMS-001',
            action: 'Gửi SMS thất bại',
            description: 'Không thể gửi SMS xác thực do hết credit',
            ip: '203.162.5.100',
            device: 'SMS API',
            location: 'SMS Provider',
            details: {phoneNumber: '0901***456', errorCode: 'INSUFFICIENT_CREDIT', remainingCredit: 0}
        },
        {
            id: 'LOG-2026-017',
            timestamp: '2026-02-08 13:15:55',
            level: 'success',
            category: 'room',
            user: 'Ngô Thị M',
            userId: 'USR-011',
            action: 'Cập nhật trạng thái phòng',
            description: 'Đổi trạng thái phòng F601 từ "Đang sửa chữa" sang "Còn trống"',
            ip: '192.168.1.190',
            device: 'Mobile App Android',
            location: 'Ho Chi Minh, Vietnam',
            details: {room: 'F601', oldStatus: 'Under maintenance', newStatus: 'Available'}
        },
        {
            id: 'LOG-2026-018',
            timestamp: '2026-02-08 13:10:12',
            level: 'info',
            category: 'settings',
            user: 'Admin',
            userId: 'ADM-001',
            action: 'Cập nhật cấu hình',
            description: 'Thay đổi cấu hình giá điện từ 3,500đ/kWh lên 3,800đ/kWh',
            ip: '192.168.1.200',
            device: 'Chrome 121 on Windows 11',
            location: 'Admin Office',
            details: {setting: 'electricity_price', oldValue: '3,500đ', newValue: '3,800đ'}
        },
        {
            id: 'LOG-2026-019',
            timestamp: '2026-02-08 13:05:28',
            level: 'warning',
            category: 'contract',
            user: 'System',
            userId: 'SYS-000',
            action: 'Hợp đồng sắp hết hạn',
            description: '12 hợp đồng sẽ hết hạn trong vòng 30 ngày',
            ip: 'localhost',
            device: 'Contract Monitor',
            location: 'System',
            details: {expiringContracts: 12, daysRemaining: 30, notificationsSent: 12}
        },
        {
            id: 'LOG-2026-020',
            timestamp: '2026-02-08 13:00:05',
            level: 'success',
            category: 'backup',
            user: 'System',
            userId: 'SYS-000',
            action: 'Backup tự động',
            description: 'Backup database thành công - 458MB',
            ip: 'localhost',
            device: 'Backup Service',
            location: 'Backup Server',
            details: {size: '458MB', duration: '2m 34s', location: 'AWS S3', compression: '65%'}
        },
    ];

    // Statistics
    const logStats = useMemo(() => {
        const total = mockLogs.length;
        const success = mockLogs.filter(log => log.level === 'success').length;
        const error = mockLogs.filter(log => log.level === 'error').length;
        const warning = mockLogs.filter(log => log.level === 'warning').length;
        const info = mockLogs.filter(log => log.level === 'info').length;

        return {total, success, error, warning, info};
    }, [mockLogs]);

    // Filter logs
    const filteredLogs = useMemo(() => {
        return mockLogs.filter(log => {
            const matchSearch = searchText === '' ||
                log.action.toLowerCase().includes(searchText.toLowerCase()) ||
                log.description.toLowerCase().includes(searchText.toLowerCase()) ||
                log.user.toLowerCase().includes(searchText.toLowerCase());
            const matchLevel = selectedLevel === 'all' || log.level === selectedLevel;
            const matchCategory = selectedCategory === 'all' || log.category === selectedCategory;
            const matchUser = selectedUser === 'all' || log.userId === selectedUser;

            return matchSearch && matchLevel && matchCategory && matchUser;
        });
    }, [mockLogs, searchText, selectedLevel, selectedCategory, selectedUser]);

    // Level config
    const levelConfig = {
        success: {color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircleOutlined/>, label: 'Success'},
        error: {color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: <CloseCircleOutlined/>, label: 'Error'},
        warning: {color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', icon: <WarningOutlined/>, label: 'Warning'},
        info: {color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)', icon: <InfoCircleOutlined/>, label: 'Info'},
    };

    // Category config
    const categoryConfig = {
        authentication: {icon: <LockOutlined/>, color: '#6366f1', label: 'Authentication'},
        room: {icon: <HomeOutlined/>, color: '#10b981', label: 'Room Management'},
        payment: {icon: <DollarOutlined/>, color: '#f59e0b', label: 'Payment'},
        contract: {icon: <FileTextOutlined/>, color: '#8b5cf6', label: 'Contract'},
        utility: {icon: <ThunderboltOutlined/>, color: '#06b6d4', label: 'Utility'},
        tenant: {icon: <TeamOutlined/>, color: '#ec4899', label: 'Tenant'},
        invoice: {icon: <FileTextOutlined/>, color: '#f97316', label: 'Invoice'},
        report: {icon: <DatabaseOutlined/>, color: '#14b8a6', label: 'Report'},
        maintenance: {icon: <SettingOutlined/>, color: '#a855f7', label: 'Maintenance'},
        notification: {icon: <BellOutlined/>, color: '#3b82f6', label: 'Notification'},
        security: {icon: <SafetyOutlined/>, color: '#ef4444', label: 'Security'},
        system: {icon: <CloudServerOutlined/>, color: '#64748b', label: 'System'},
        settings: {icon: <SettingOutlined/>, color: '#84cc16', label: 'Settings'},
        backup: {icon: <DatabaseOutlined/>, color: '#22c55e', label: 'Backup'},
        integration: {icon: <SyncOutlined/>, color: '#0ea5e9', label: 'Integration'},
    };

    // Table columns
    const columns = [
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (text) => (
                <div className={styles.timestampCell}>
                    <ClockCircleOutlined className={styles.timeIcon}/>
                    <div className={styles.timeText}>
                        <Text strong>{text.split(' ')[1]}</Text>
                        <Text type="secondary">{text.split(' ')[0]}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            width: 120,
            render: (level) => {
                const config = levelConfig[level];
                return (
                    <div className={styles.levelBadge} style={{
                        background: config.bgColor,
                        color: config.color,
                        border: `1px solid ${config.color}30`
                    }}>
                        {config.icon}
                        <span>{config.label}</span>
                    </div>
                );
            },
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 160,
            render: (category) => {
                const config = categoryConfig[category];
                return (
                    <div className={styles.categoryTag}>
                        <div className={styles.categoryIcon} style={{color: config.color}}>
                            {config.icon}
                        </div>
                        <Text>{config.label}</Text>
                    </div>
                );
            },
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            width: 180,
            render: (user, record) => (
                <div className={styles.userCell}>
                    <Avatar size={32} style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        fontWeight: 600
                    }}>
                        {user.charAt(0)}
                    </Avatar>
                    <div className={styles.userInfo}>
                        <Text strong>{user}</Text>
                        <Text type="secondary" style={{fontSize: 12}}>{record.userId}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Action & Description',
            key: 'action',
            render: (_, record) => (
                <div className={styles.actionCell}>
                    <Text strong className={styles.actionTitle}>{record.action}</Text>
                    <Paragraph className={styles.actionDescription} ellipsis={{rows: 2, expandable: false}}>
                        {record.description}
                    </Paragraph>
                    <div className={styles.actionMeta}>
                        <Tag icon={<EnvironmentOutlined/>} style={{borderRadius: 12}}>
                            {record.location}
                        </Tag>
                        <Tag icon={<DesktopOutlined/>} style={{borderRadius: 12}}>
                            {record.device.split(' on ')[0]}
                        </Tag>
                    </div>
                </div>
            ),
        },
        {
            title: 'Details',
            key: 'details',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined/>}
                            className={styles.actionButton}
                        />
                    </Tooltip>
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item icon={<ExportOutlined/>}>Export</Menu.Item>
                                <Menu.Item icon={<ShareAltOutlined/>}>Share</Menu.Item>
                                <Menu.Divider/>
                                <Menu.Item icon={<DeleteOutlined/>} danger>Delete</Menu.Item>
                            </Menu>
                        }
                        trigger={['click']}
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined/>}
                            className={styles.actionButton}
                        />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    // Timeline items
    const timelineItems = filteredLogs.map(log => {
        const config = levelConfig[log.level];
        const catConfig = categoryConfig[log.category];

        return {
            color: config.color,
            dot: (
                <div className={styles.timelineDot} style={{background: config.color}}>
                    {config.icon}
                </div>
            ),
            children: (
                <div className={styles.timelineItem}>
                    <div className={styles.timelineHeader}>
                        <div className={styles.timelineTitle}>
                            <div className={styles.categoryIcon} style={{color: catConfig.color}}>
                                {catConfig.icon}
                            </div>
                            <Text strong>{log.action}</Text>
                            <div className={styles.levelBadge} style={{
                                background: config.bgColor,
                                color: config.color,
                                border: `1px solid ${config.color}30`
                            }}>
                                {config.icon}
                                <span>{config.label}</span>
                            </div>
                        </div>
                        <Text type="secondary" className={styles.timelineTime}>
                            <ClockCircleOutlined/> {log.timestamp}
                        </Text>
                    </div>
                    <Paragraph className={styles.timelineDescription}>
                        {log.description}
                    </Paragraph>
                    <div className={styles.timelineMeta}>
                        <Space size="large" wrap>
                            <Text type="secondary">
                                <UserOutlined/> {log.user}
                            </Text>
                            <Text type="secondary">
                                <EnvironmentOutlined/> {log.location}
                            </Text>
                            <Text type="secondary">
                                <DesktopOutlined/> {log.device}
                            </Text>
                        </Space>
                    </div>
                </div>
            ),
        };
    });

    const actionMenu = (
        <Menu>
            <Menu.Item icon={<ExportOutlined/>}>Export to CSV</Menu.Item>
            <Menu.Item icon={<ExportOutlined/>}>Export to Excel</Menu.Item>
            <Menu.Item icon={<PrinterOutlined/>}>Print Logs</Menu.Item>
            <Menu.Divider/>
            <Menu.Item icon={<DeleteOutlined/>} danger>Clear All Logs</Menu.Item>
        </Menu>
    );

    return (
        <div className={styles.logsWrapper}>
            <div className={styles.logsContainer}>
                {/* Header */}
                {/*<div className={styles.logsHeader}>*/}
                {/*    <div className={styles.headerContent}>*/}
                {/*        <div className={styles.headerLeft}>*/}
                {/*            <div className={styles.titleSection}>*/}
                {/*                <Title level={1} className={styles.mainTitle}>*/}
                {/*                    <DatabaseOutlined className={styles.titleIcon}/>*/}
                {/*                    System Logs*/}
                {/*                    <Badge count="LIVE" className={styles.liveBadge}/>*/}
                {/*                </Title>*/}
                {/*                <Paragraph className={styles.subtitle}>*/}
                {/*                    Real-time monitoring and comprehensive system activity tracking*/}
                {/*                </Paragraph>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*        <div className={styles.headerRight}>*/}
                {/*            <Space size="middle">*/}
                {/*                <div className={styles.autoRefreshToggle}>*/}
                {/*                    <Switch*/}
                {/*                        checked={autoRefresh}*/}
                {/*                        onChange={setAutoRefresh}*/}
                {/*                        checkedChildren="Auto"*/}
                {/*                        unCheckedChildren="Manual"*/}
                {/*                    />*/}
                {/*                    <Text type="secondary" style={{fontSize: 13, marginLeft: 8}}>*/}
                {/*                        Auto Refresh*/}
                {/*                    </Text>*/}
                {/*                </div>*/}
                {/*                <Button*/}
                {/*                    icon={<ReloadOutlined spin={autoRefresh}/>}*/}
                {/*                    className={styles.iconButton}*/}
                {/*                >*/}
                {/*                    Refresh*/}
                {/*                </Button>*/}
                {/*                <Dropdown overlay={actionMenu} trigger={['click']}>*/}
                {/*                    <Button*/}
                {/*                        icon={<DownloadOutlined/>}*/}
                {/*                        type="primary"*/}
                {/*                        className={styles.primaryButton}*/}
                {/*                    >*/}
                {/*                        Export*/}
                {/*                    </Button>*/}
                {/*                </Dropdown>*/}
                {/*            </Space>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Statistics */}
                <Row gutter={[24, 24]} className={styles.statsSection}>
                    <Col span={6}>
                        <Card className={styles.statCard} bordered={false}>
                            <div className={styles.statContent}>
                                <div className={styles.statIcon} style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                }}>
                                    <DatabaseOutlined/>
                                </div>
                                <div className={styles.statInfo}>
                                    <Text className={styles.statLabel}>Total Logs</Text>
                                    <Title level={2} className={styles.statValue}>{logStats.total}</Title>
                                    <Text type="secondary" className={styles.statChange}>Last 24 hours</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className={styles.statCard} bordered={false}>
                            <div className={styles.statContent}>
                                <div className={styles.statIcon} style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                }}>
                                    <CheckCircleOutlined/>
                                </div>
                                <div className={styles.statInfo}>
                                    <Text className={styles.statLabel}>Success</Text>
                                    <Title level={2} className={styles.statValue}>{logStats.success}</Title>
                                    <Text type="secondary" className={styles.statChange}>
                                        {((logStats.success / logStats.total) * 100).toFixed(1)}% success rate
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className={styles.statCard} bordered={false}>
                            <div className={styles.statContent}>
                                <div className={styles.statIcon} style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                }}>
                                    <WarningOutlined/>
                                </div>
                                <div className={styles.statInfo}>
                                    <Text className={styles.statLabel}>Warnings</Text>
                                    <Title level={2} className={styles.statValue}>{logStats.warning}</Title>
                                    <Text type="secondary" className={styles.statChange}>Requires attention</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className={styles.statCard} bordered={false}>
                            <div className={styles.statContent}>
                                <div className={styles.statIcon} style={{
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                }}>
                                    <CloseCircleOutlined/>
                                </div>
                                <div className={styles.statInfo}>
                                    <Text className={styles.statLabel}>Errors</Text>
                                    <Title level={2} className={styles.statValue}>{logStats.error}</Title>
                                    <Text type="secondary" className={styles.statChange}>Critical issues</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Card className={styles.filterCard} bordered={false}>
                    <Space size="large" wrap className={styles.filterContainer}>
                        <Input
                            placeholder="Search logs..."
                            prefix={<SearchOutlined/>}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className={styles.searchInput}
                            allowClear
                        />
                        <Select
                            value={selectedLevel}
                            onChange={setSelectedLevel}
                            className={styles.filterSelect}
                            suffixIcon={<FilterOutlined/>}
                        >
                            <Select.Option value="all">All Levels</Select.Option>
                            <Select.Option value="success">✓ Success</Select.Option>
                            <Select.Option value="info">ⓘ Info</Select.Option>
                            <Select.Option value="warning">⚠ Warning</Select.Option>
                            <Select.Option value="error">✕ Error</Select.Option>
                        </Select>
                        <Select
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            className={styles.filterSelect}
                            suffixIcon={<FilterOutlined/>}
                        >
                            <Select.Option value="all">All Categories</Select.Option>
                            {Object.entries(categoryConfig).map(([key, config]) => (
                                <Select.Option key={key} value={key}>
                                    {config.label}
                                </Select.Option>
                            ))}
                        </Select>
                        <RangePicker className={styles.dateRangePicker}/>
                        <div className={styles.viewModeToggle}>
                            <Button.Group>
                                <Button
                                    type={viewMode === 'table' ? 'primary' : 'default'}
                                    icon={<DatabaseOutlined/>}
                                    onClick={() => setViewMode('table')}
                                >
                                    Table
                                </Button>
                                <Button
                                    type={viewMode === 'timeline' ? 'primary' : 'default'}
                                    icon={<ClockCircleOutlined/>}
                                    onClick={() => setViewMode('timeline')}
                                >
                                    Timeline
                                </Button>
                            </Button.Group>
                        </div>
                    </Space>
                </Card>

                {/* Logs Content */}
                <Card className={styles.logsCard} bordered={false}>
                    <div className={styles.logsCardHeader}>
                        <Title level={4} className={styles.logsCardTitle}>
                            Activity Logs
                            <Badge count={filteredLogs.length} showZero className={styles.countBadge}/>
                        </Title>
                        <Text type="secondary">
                            Showing {filteredLogs.length} of {mockLogs.length} logs
                        </Text>
                    </div>

                    {viewMode === 'table' ? (
                        <Table
                            columns={columns}
                            dataSource={filteredLogs}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} logs`,
                                className: styles.pagination
                            }}
                            className={styles.logsTable}
                        />
                    ) : (
                        <div className={styles.timelineContainer}>
                            <Timeline items={timelineItems}/>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default SystemLogs;