// src/components/OperatingCostTracker/OperatingCostTracker.jsx
import React, {useState, useEffect} from 'react';
import {
    Button, Space, Card, Table, Select, DatePicker, Modal, Form, Input, InputNumber, message,
    Tag, Badge, Tooltip, Row, Col, Divider, Progress
} from 'antd';
import {
    PlusOutlined, DownloadOutlined, FilterOutlined, EyeOutlined, EditOutlined,
    DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, AlertOutlined,
    ThunderboltOutlined, ToolOutlined, HomeOutlined, SafetyOutlined, ShoppingOutlined,
    RiseOutlined, FallOutlined, TrophyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './OperatingCostTracker.module.scss';
import CostStatsOverview from "~/components/Layout/AdminLayout/components/CostStatsOverview";

const {Option} = Select;
const {TextArea} = Input;
const {RangePicker} = DatePicker;

// Mock data
const mockCosts = [
    {
        id: 1,
        date: '2024-11-15',
        category: 'ELECTRIC',
        description: 'Tiền điện tháng 11 - Toà A',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Toà A',
        amount: 15600000,
        paymentMethod: 'TRANSFER',
        vendor: 'Điện lực TP.HCM',
        invoice: 'HD-DL-202411-001',
        status: 'PAID',
        paidDate: '2024-11-15',
        paidBy: 'Admin',
        note: 'Đã thanh toán đúng hạn',
        recurring: true,
        estimatedAmount: 15000000,
        variance: 600000,
        createdAt: '2024-11-01',
    },
    {
        id: 2,
        date: '2024-11-10',
        category: 'WATER',
        description: 'Tiền nước tháng 11 - Toàn bộ',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Tất cả',
        amount: 4200000,
        paymentMethod: 'CASH',
        vendor: 'Công ty Cấp nước Sài Gòn',
        invoice: 'HD-NC-202411-001',
        status: 'PAID',
        paidDate: '2024-11-10',
        paidBy: 'Admin',
        note: '',
        recurring: true,
        estimatedAmount: 4000000,
        variance: 200000,
        createdAt: '2024-11-01',
    },
    {
        id: 3,
        date: '2024-11-08',
        category: 'MAINTENANCE',
        description: 'Sửa chữa điều hòa phòng 205',
        boardingHouse: 'Nhà trọ Green Park',
        building: 'Toà B',
        amount: 1500000,
        paymentMethod: 'CASH',
        vendor: 'Công ty TNHH Điện Lạnh ABC',
        invoice: null,
        status: 'PAID',
        paidDate: '2024-11-08',
        paidBy: 'Kỹ thuật viên',
        note: 'Thay gas, vệ sinh máy',
        recurring: false,
        estimatedAmount: null,
        variance: null,
        createdAt: '2024-11-08',
    },
    {
        id: 4,
        date: '2024-11-20',
        category: 'INTERNET',
        description: 'Cước Internet tháng 11',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Tất cả',
        amount: 3000000,
        paymentMethod: 'TRANSFER',
        vendor: 'Viettel',
        invoice: 'HD-VT-202411-001',
        status: 'PENDING',
        paidDate: null,
        paidBy: null,
        note: 'Hạn thanh toán: 25/11',
        recurring: true,
        estimatedAmount: 3000000,
        variance: 0,
        createdAt: '2024-11-01',
    },
    {
        id: 5,
        date: '2024-11-05',
        category: 'CLEANING',
        description: 'Vệ sinh khu vực chung',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Tất cả',
        amount: 2000000,
        paymentMethod: 'CASH',
        vendor: 'Dịch vụ vệ sinh Minh Anh',
        invoice: null,
        status: 'PAID',
        paidDate: '2024-11-05',
        paidBy: 'Admin',
        note: 'Vệ sinh 2 lần/tháng',
        recurring: true,
        estimatedAmount: 2000000,
        variance: 0,
        createdAt: '2024-11-01',
    },
    {
        id: 6,
        date: '2024-11-12',
        category: 'SECURITY',
        description: 'Lương bảo vệ tháng 11',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Tất cả',
        amount: 6000000,
        paymentMethod: 'TRANSFER',
        vendor: 'Công ty An ninh Đại Việt',
        invoice: 'HD-BV-202411-001',
        status: 'PAID',
        paidDate: '2024-11-12',
        paidBy: 'Admin',
        note: '2 bảo vệ x 3.000.000đ',
        recurring: true,
        estimatedAmount: 6000000,
        variance: 0,
        createdAt: '2024-11-01',
    },
    {
        id: 7,
        date: '2024-11-18',
        category: 'REPAIR',
        description: 'Sửa cửa phòng 108',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Toà A',
        amount: 800000,
        paymentMethod: 'CASH',
        vendor: 'Thợ mộc Tấn Phát',
        invoice: null,
        status: 'PAID',
        paidDate: '2024-11-18',
        paidBy: 'Admin',
        note: 'Thay bản lề cửa',
        recurring: false,
        estimatedAmount: null,
        variance: null,
        createdAt: '2024-11-18',
    },
    {
        id: 8,
        date: '2024-11-25',
        category: 'INSURANCE',
        description: 'Bảo hiểm cháy nổ',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Tất cả',
        amount: 5000000,
        paymentMethod: 'TRANSFER',
        vendor: 'Bảo Việt',
        invoice: null,
        status: 'OVERDUE',
        paidDate: null,
        paidBy: null,
        note: 'Quá hạn 2 ngày',
        recurring: true,
        estimatedAmount: 5000000,
        variance: 0,
        createdAt: '2024-10-25',
    },
    {
        id: 9,
        date: '2024-11-03',
        category: 'SUPPLIES',
        description: 'Mua vật tư tiêu hao',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Tất cả',
        amount: 1200000,
        paymentMethod: 'CASH',
        vendor: 'Siêu thị Điện máy Xanh',
        invoice: 'HD-DMX-20241103',
        status: 'PAID',
        paidDate: '2024-11-03',
        paidBy: 'Admin',
        note: 'Bóng đèn, công tắc, ổ cắm',
        recurring: false,
        estimatedAmount: null,
        variance: null,
        createdAt: '2024-11-03',
    },
    {
        id: 10,
        date: '2024-10-15',
        category: 'ELECTRIC',
        description: 'Tiền điện tháng 10 - Toà A',
        boardingHouse: 'Nhà trọ Sunshine',
        building: 'Toà A',
        amount: 14800000,
        paymentMethod: 'TRANSFER',
        vendor: 'Điện lực TP.HCM',
        invoice: 'HD-DL-202410-001',
        status: 'PAID',
        paidDate: '2024-10-15',
        paidBy: 'Admin',
        note: '',
        recurring: true,
        estimatedAmount: 15000000,
        variance: -200000,
        createdAt: '2024-10-01',
    },
];

const mockBudgets = {
    ELECTRIC: {monthly: 16000000, alert: 90},
    WATER: {monthly: 4500000, alert: 90},
    INTERNET: {monthly: 3000000, alert: 100},
    MAINTENANCE: {monthly: 5000000, alert: 80},
    REPAIR: {monthly: 3000000, alert: 80},
    CLEANING: {monthly: 2000000, alert: 100},
    SECURITY: {monthly: 6000000, alert: 100},
    INSURANCE: {monthly: 5000000, alert: 100},
    SUPPLIES: {monthly: 2000000, alert: 90},
    OTHER: {monthly: 3000000, alert: 90},
};

const categoryConfig = {
    ELECTRIC: {icon: <ThunderboltOutlined/>, color: '#faad14', label: 'Tiền điện'},
    WATER: {icon: <ThunderboltOutlined/>, color: '#1890ff', label: 'Tiền nước'},
    INTERNET: {icon: <ThunderboltOutlined/>, color: '#722ed1', label: 'Internet'},
    MAINTENANCE: {icon: <ToolOutlined/>, color: '#13c2c2', label: 'Bảo trì'},
    REPAIR: {icon: <ToolOutlined/>, color: '#fa541c', label: 'Sửa chữa'},
    CLEANING: {icon: <HomeOutlined/>, color: '#52c41a', label: 'Vệ sinh'},
    SECURITY: {icon: <SafetyOutlined/>, color: '#2f54eb', label: 'Bảo vệ'},
    INSURANCE: {icon: <SafetyOutlined/>, color: '#eb2f96', label: 'Bảo hiểm'},
    SUPPLIES: {icon: <ShoppingOutlined/>, color: '#faad14', label: 'Vật tư'},
    OTHER: {icon: <ToolOutlined/>, color: '#8c8c8c', label: 'Khác'},
};

const OperatingCostTracker = () => {
    const [costs, setCosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedCost, setSelectedCost] = useState(null);
    const [form] = Form.useForm();

    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [boardingHouseFilter, setBoardingHouseFilter] = useState('ALL');

    const [statistics, setStatistics] = useState({
        totalCost: 0, paidCost: 0, pendingCost: 0, overdueCost: 0, vsLastMonth: 0, vsBudget: 0
    });
    const [categoryStats, setCategoryStats] = useState([]);

    useEffect(() => {
        loadCosts();
    }, [dateRange, categoryFilter, statusFilter, boardingHouseFilter]);

    const loadCosts = () => {
        setLoading(true);
        setTimeout(() => {
            let filtered = [...mockCosts];

            if (dateRange?.[0] && dateRange?.[1]) {
                filtered = filtered.filter(cost => {
                    const costDate = dayjs(cost.date);
                    return costDate.isAfter(dateRange[0].startOf('day')) && costDate.isBefore(dateRange[1].endOf('day'));
                });
            }

            if (categoryFilter !== 'ALL') filtered = filtered.filter(c => c.category === categoryFilter);
            if (statusFilter !== 'ALL') filtered = filtered.filter(c => c.status === statusFilter);
            if (boardingHouseFilter !== 'ALL') filtered = filtered.filter(c => c.boardingHouse === boardingHouseFilter);

            const totalCost = filtered.reduce((sum, c) => sum + c.amount, 0);
            const paidCost = filtered.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0);
            const pendingCost = filtered.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0);
            const overdueCost = filtered.filter(c => c.status === 'OVERDUE').reduce((sum, c) => sum + c.amount, 0);

            const lastMonthTotal = 38000000;
            const vsLastMonth = ((totalCost - lastMonthTotal) / lastMonthTotal) * 100;
            const totalBudget = Object.values(mockBudgets).reduce((s, b) => s + b.monthly, 0);
            const vsBudget = totalBudget > 0 ? (totalCost / totalBudget) * 100 : 0;

            const catStats = {};
            filtered.forEach(cost => {
                if (!catStats[cost.category]) {
                    catStats[cost.category] = {
                        category: cost.category,
                        total: 0,
                        count: 0,
                        budget: mockBudgets[cost.category]?.monthly || 0
                    };
                }
                catStats[cost.category].total += cost.amount;
                catStats[cost.category].count += 1;
            });

            const statsArray = Object.values(catStats).map(stat => ({
                ...stat,
                percentage: stat.budget > 0 ? (stat.total / stat.budget) * 100 : 0,
                remaining: stat.budget - stat.total,
            })).sort((a, b) => b.total - a.total);

            setCosts(filtered);
            setStatistics({totalCost, paidCost, pendingCost, overdueCost, vsLastMonth, vsBudget});
            setCategoryStats(statsArray);
            setLoading(false);
        }, 500);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(amount);
    };

    const renderCategoryTag = (category) => {
        const config = categoryConfig[category] || categoryConfig.OTHER;
        return <Tag icon={config.icon} color={config.color}>{config.label}</Tag>;
    };

    const renderStatusBadge = (status) => {
        const config = {
            PAID: {text: 'Đã thanh toán', color: 'success'},
            PENDING: {text: 'Chờ thanh toán', color: 'warning'},
            OVERDUE: {text: 'Quá hạn', color: 'error'},
        }[status] || {text: 'Chờ', color: 'warning'};
        return <Badge status={config.color} text={config.text}/>;
    };

    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
        },
        {
            title: 'Loại chi phí',
            dataIndex: 'category',
            key: 'category',
            width: 140,
            render: renderCategoryTag,
            filters: Object.keys(categoryConfig).map(key => ({
                text: categoryConfig[key].label,
                value: key,
            })),
            onFilter: (value, record) => record.category === value,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Khu trọ',
            dataIndex: 'boardingHouse',
            key: 'boardingHouse',
            width: 160,
            ellipsis: true,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 140,
            align: 'right',
            render: (amount) => (
                <span className={styles.amount}>{formatCurrency(amount)}</span>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: renderStatusBadge,
            filters: [
                {text: 'Đã thanh toán', value: 'PAID'},
                {text: 'Chờ thanh toán', value: 'PENDING'},
                {text: 'Quá hạn', value: 'OVERDUE'},
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined/>} onClick={() => handleViewCost(record)}/>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined/>} onClick={() => handleEditCost(record)}/>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleViewCost = (record) => {
        setSelectedCost(record);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEditCost = (record) => {
        setSelectedCost(record);
        setModalMode('edit');
        form.setFieldsValue({
            ...record,
            date: dayjs(record.date),
        });
        setIsModalOpen(true);
    };

    const handleAddCost = () => {
        setSelectedCost(null);
        setModalMode('add');
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleFormSubmit = async () => {
        try {
            await form.validateFields();
            message.success(modalMode === 'add' ? 'Thêm chi phí thành công!' : 'Cập nhật thành công!');
            setIsModalOpen(false);
            loadCosts();
        } catch (error) {
            message.error('Vui lòng kiểm tra lại thông tin!');
        }
    };

    const renderViewContent = () => {
        if (!selectedCost) return null;

        return (
            <div className={styles.modalContent}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Loại chi phí:</span>
                            {renderCategoryTag(selectedCost.category)}
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Số tiền:</span>
                            <div className={styles.amountValue}>{formatCurrency(selectedCost.amount)}</div>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Ngày:</span>
                            <div className={styles.value}>{dayjs(selectedCost.date).format('DD/MM/YYYY')}</div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Trạng thái:</span>
                            {renderStatusBadge(selectedCost.status)}
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Phương thức:</span>
                            <div className={styles.value}>
                                {selectedCost.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                            </div>
                        </div>
                        {selectedCost.paidDate && (
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Ngày thanh toán:</span>
                                <div className={styles.value}>{dayjs(selectedCost.paidDate).format('DD/MM/YYYY')}</div>
                            </div>
                        )}
                    </Col>
                </Row>

                <Divider/>

                <div className={styles.detailItem}>
                    <span className={styles.label}>Mô tả:</span>
                    <div className={styles.value}>{selectedCost.description}</div>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Khu trọ:</span>
                    <div className={styles.value}>{selectedCost.boardingHouse} - {selectedCost.building}</div>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>Nhà cung cấp:</span>
                    <div className={styles.value}>{selectedCost.vendor}</div>
                </div>
                {selectedCost.invoice && (
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Số hóa đơn:</span>
                        <div className={styles.value} style={{fontFamily: 'monospace'}}>
                            {selectedCost.invoice}
                        </div>
                    </div>
                )}
                {selectedCost.note && (
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Ghi chú:</span>
                        <div className={styles.note}>{selectedCost.note}</div>
                    </div>
                )}
            </div>
        );
    };

    const renderFormContent = () => (
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="date" label="Ngày" rules={[{required: true, message: 'Chọn ngày!'}]}>
                        <DatePicker style={{width: '100%'}} format="DD/MM/YYYY"/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="category" label="Loại chi phí" rules={[{required: true, message: 'Chọn loại!'}]}>
                        <Select placeholder="Chọn loại">
                            {Object.keys(categoryConfig).map(key => (
                                <Option key={key} value={key}>
                                    {categoryConfig[key].icon} {categoryConfig[key].label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="description" label="Mô tả" rules={[{required: true, message: 'Nhập mô tả!'}]}>
                <Input placeholder="VD: Tiền điện tháng 11"/>
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="boardingHouse" label="Khu trọ"
                               rules={[{required: true, message: 'Chọn khu trọ!'}]}>
                        <Select placeholder="Chọn khu trọ">
                            <Option value="Nhà trọ Sunshine">Nhà trọ Sunshine</Option>
                            <Option value="Nhà trọ Green Park">Nhà trọ Green Park</Option>
                            <Option value="Nhà trọ Sky View">Nhà trọ Sky View</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="building" label="Toà nhà">
                        <Input placeholder="VD: Toà A, Tất cả"/>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="amount" label="Số tiền" rules={[{required: true, message: 'Nhập số tiền!'}]}>
                        <InputNumber
                            style={{width: '100%'}}
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="paymentMethod" label="Phương thức"
                               rules={[{required: true, message: 'Chọn phương thức!'}]}>
                        <Select placeholder="Chọn">
                            <Option value="CASH">Tiền mặt</Option>
                            <Option value="TRANSFER">Chuyển khoản</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="vendor" label="Nhà cung cấp"
                               rules={[{required: true, message: 'Nhập nhà cung cấp!'}]}>
                        <Input placeholder="Tên nhà cung cấp"/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="invoice" label="Số hóa đơn">
                        <Input placeholder="Số hóa đơn (nếu có)"/>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="status" label="Trạng thái" rules={[{required: true, message: 'Chọn trạng thái!'}]}>
                        <Select placeholder="Chọn">
                            <Option value="PAID">Đã thanh toán</Option>
                            <Option value="PENDING">Chờ thanh toán</Option>
                            <Option value="OVERDUE">Quá hạn</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="paidDate" label="Ngày thanh toán">
                        <DatePicker style={{width: '100%'}} format="DD/MM/YYYY"/>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="note" label="Ghi chú">
                <TextArea rows={3} placeholder="Ghi chú thêm (nếu có)"/>
            </Form.Item>
        </Form>
    );

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Space>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={handleAddCost}>
                        Thêm chi phí
                    </Button>
                    <Button icon={<DownloadOutlined/>}>Xuất báo cáo</Button>
                </Space>
            </div>

            {/* Thống kê & Ngân sách */}
            <CostStatsOverview
                statistics={statistics}
                categoryStats={categoryStats}
                mockBudgets={mockBudgets}
                categoryConfig={categoryConfig}
            />

            {/* Bộ lọc */}
            <Card className={styles.filterCard}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} lg={8}>
                        <RangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                            style={{width: '100%'}}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={4}>
                        <Select value={categoryFilter} onChange={setCategoryFilter} style={{width: '100%'}}
                                placeholder="Loại chi phí">
                            <Option value="ALL">Tất cả loại</Option>
                            {Object.keys(categoryConfig).map(key => (
                                <Option key={key} value={key}>{categoryConfig[key].label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={4}>
                        <Select value={statusFilter} onChange={setStatusFilter} style={{width: '100%'}}
                                placeholder="Trạng thái">
                            <Option value="ALL">Tất cả</Option>
                            <Option value="PAID">Đã thanh toán</Option>
                            <Option value="PENDING">Chờ thanh toán</Option>
                            <Option value="OVERDUE">Quá hạn</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Select value={boardingHouseFilter} onChange={setBoardingHouseFilter} style={{width: '100%'}}
                                placeholder="Khu trọ">
                            <Option value="ALL">Tất cả khu trọ</Option>
                            <Option value="Nhà trọ Sunshine">Nhà trọ Sunshine</Option>
                            <Option value="Nhà trọ Green Park">Nhà trọ Green Park</Option>
                            <Option value="Nhà trọ Sky View">Nhà trọ Sky View</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={2}>
                        <Button
                            icon={<FilterOutlined/>}
                            onClick={() => {
                                setDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
                                setCategoryFilter('ALL');
                                setStatusFilter('ALL');
                                setBoardingHouseFilter('ALL');
                            }}
                            style={{width: '100%'}}
                        >
                            Reset
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Bảng dữ liệu */}
            <Card className={styles.tableCard}>
                <Table
                    columns={columns}
                    dataSource={costs}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                    }}
                    scroll={{x: 1200}}
                    summary={(pageData) => {
                        const totalAmount = pageData.reduce((sum, record) => sum + record.amount, 0);
                        return (
                            <Table.Summary fixed>
                                <Table.Summary.Row className={styles.summaryRow}>
                                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                                        Tổng trang này:
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <span className={styles.summaryTotal}>{formatCurrency(totalAmount)}</span>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} colSpan={2}/>
                                </Table.Summary.Row>
                            </Table.Summary>
                        );
                    }}
                />
            </Card>

            {/* Modal */}
            <Modal
                title={
                    modalMode === 'view'
                        ? 'Chi tiết Chi phí'
                        : modalMode === 'add'
                            ? 'Thêm Chi phí mới'
                            : 'Chỉnh sửa Chi phí'
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={
                    modalMode === 'view' ? [
                        <Button key="close" onClick={() => setIsModalOpen(false)}>
                            Đóng
                        </Button>
                    ] : [
                        <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>,
                        <Button key="submit" type="primary" onClick={() => form.submit()}>
                            {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                        </Button>
                    ]
                }
                width={modalMode === 'view' ? 600 : 800}
            >
                {modalMode === 'view' ? renderViewContent() : renderFormContent()}
            </Modal>
        </div>
    );
};

export default OperatingCostTracker;