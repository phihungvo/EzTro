// src/pages/Admin/Revenue/Revenue.jsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Revenue.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import RevenueCard from '~/components/Layout/AdminLayout/components/RevenueCard';
import {
    DollarOutlined,
    CloudUploadOutlined,
    EyeOutlined,
    TableOutlined,
    AppstoreOutlined,
    LineChartOutlined,
    FundOutlined,
    HomeOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import { Form, message, Row, Col, Pagination, Segmented, Tag, Card, Statistic } from 'antd';
import dayjs from 'dayjs';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);

// Mock data
const mockRevenues = [
    {
        id: 1,
        revenueCode: 'REV001',
        boardingHouseName: 'Nhà trọ Sunshine',
        buildingName: 'Toà A',
        roomNumber: '101',
        tenantName: 'Nguyễn Văn A',
        month: '2025-11',
        roomPrice: 3000000,
        electricityFee: 200000,
        waterFee: 50000,
        internetFee: 100000,
        parkingFee: 100000,
        cleaningFee: 50000,
        otherFees: 0,
        totalRevenue: 3500000,
        paidAmount: 3500000,
        status: 'PAID',
        paymentDate: '2025-11-05T10:30:00',
        createdAt: '2025-11-01T08:00:00',
    },
    {
        id: 2,
        revenueCode: 'REV002',
        boardingHouseName: 'Nhà trọ Green Park',
        buildingName: 'Toà B',
        roomNumber: '205',
        tenantName: 'Trần Thị B',
        month: '2025-11',
        roomPrice: 3500000,
        electricityFee: 250000,
        waterFee: 60000,
        internetFee: 100000,
        parkingFee: 150000,
        cleaningFee: 50000,
        otherFees: 40000,
        totalRevenue: 4150000,
        paidAmount: 2000000,
        status: 'PARTIAL',
        paymentDate: '2025-11-10T14:20:00',
        createdAt: '2025-11-01T08:00:00',
    },
    {
        id: 3,
        revenueCode: 'REV003',
        boardingHouseName: 'Nhà trọ Sky View',
        buildingName: 'Toà C',
        roomNumber: '302',
        tenantName: 'Lê Văn C',
        month: '2025-11',
        roomPrice: 4000000,
        electricityFee: 300000,
        waterFee: 70000,
        internetFee: 100000,
        parkingFee: 200000,
        cleaningFee: 50000,
        otherFees: 0,
        totalRevenue: 4720000,
        paidAmount: 0,
        status: 'UNPAID',
        paymentDate: null,
        createdAt: '2025-11-01T08:00:00',
    },
    {
        id: 4,
        revenueCode: 'REV004',
        boardingHouseName: 'Nhà trọ Sunshine',
        buildingName: 'Toà A',
        roomNumber: '108',
        tenantName: 'Phạm Thị D',
        month: '2025-10',
        roomPrice: 3000000,
        electricityFee: 180000,
        waterFee: 45000,
        internetFee: 100000,
        parkingFee: 100000,
        cleaningFee: 50000,
        otherFees: 25000,
        totalRevenue: 3500000,
        paidAmount: 3500000,
        status: 'PAID',
        paymentDate: '2025-10-05T09:15:00',
        createdAt: '2025-10-01T08:00:00',
    },
    {
        id: 5,
        revenueCode: 'REV005',
        boardingHouseName: 'Nhà trọ Green Park',
        buildingName: 'Toà D',
        roomNumber: '401',
        tenantName: 'Hoàng Văn E',
        month: '2025-11',
        roomPrice: 5000000,
        electricityFee: 350000,
        waterFee: 80000,
        internetFee: 150000,
        parkingFee: 200000,
        cleaningFee: 100000,
        otherFees: 120000,
        totalRevenue: 6000000,
        paidAmount: 6000000,
        status: 'PAID',
        paymentDate: '2025-11-08T16:45:00',
        createdAt: '2025-11-01T08:00:00',
    },
];

function Revenue() {
    const [revenueSource, setRevenueSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRevenue, setSelectedRevenue] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    // Filter states
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [monthFilter, setMonthFilter] = useState(dayjs().format('YYYY-MM'));
    const [boardingHouseFilter, setBoardingHouseFilter] = useState('ALL');

    // Statistics
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        paidRevenue: 0,
        unpaidRevenue: 0,
        partialRevenue: 0,
    });

    const renderStatusTag = (status) => {
        const map = {
            PAID: { color: 'green', text: 'Đã thanh toán' },
            PARTIAL: { color: 'orange', text: 'Thanh toán 1 phần' },
            UNPAID: { color: 'red', text: 'Chưa thanh toán' },
            OVERDUE: { color: 'volcano', text: 'Quá hạn' },
        };
        const { color, text } = map[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const columns = [
        {
            title: 'Mã doanh thu',
            dataIndex: 'revenueCode',
            key: 'revenueCode',
            width: 130,
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Tháng',
            dataIndex: 'month',
            key: 'month',
            width: 100,
            align: 'center',
            render: (month) => dayjs(month).format('MM/YYYY'),
        },
        {
            title: 'Người thuê',
            dataIndex: 'tenantName',
            key: 'tenantName',
            width: 150,
            align: 'center',
        },
        {
            title: 'Phòng - Toà - Khu trọ',
            key: 'location',
            width: 280,
            align: 'center',
            render: (_, record) => (
                <>
                    {record.roomNumber} - {record.buildingName} - {record.boardingHouseName}
                </>
            ),
        },
        {
            title: 'Tiền phòng',
            dataIndex: 'roomPrice',
            key: 'roomPrice',
            width: 130,
            align: 'right',
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Tiền điện',
            dataIndex: 'electricityFee',
            key: 'electricityFee',
            width: 120,
            align: 'right',
            render: (fee) => formatCurrency(fee),
        },
        {
            title: 'Tiền nước',
            dataIndex: 'waterFee',
            key: 'waterFee',
            width: 110,
            align: 'right',
            render: (fee) => formatCurrency(fee),
        },
        {
            title: 'Phí khác',
            key: 'otherFees',
            width: 120,
            align: 'right',
            render: (_, record) => {
                const total = record.internetFee + record.parkingFee + record.cleaningFee + record.otherFees;
                return formatCurrency(total);
            },
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            width: 140,
            align: 'right',
            render: (total) => (
                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                    {formatCurrency(total)}
                </span>
            ),
        },
        {
            title: 'Đã thanh toán',
            dataIndex: 'paidAmount',
            key: 'paidAmount',
            width: 140,
            align: 'right',
            render: (paid) => formatCurrency(paid),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: renderStatusTag,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <SmartButton
                    type="default"
                    icon={<EyeOutlined />}
                    buttonWidth={40}
                    onClick={() => handleViewRevenue(record)}
                />
            ),
        },
    ];

    useEffect(() => {
        handleGetRevenues();
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
        handleGetRevenues();
    }, [debouncedSearch, statusFilter, monthFilter, boardingHouseFilter]);

    const handleGetRevenues = async (page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            setTimeout(() => {
                let filtered = [...mockRevenues];

                if (debouncedSearch) {
                    filtered = filtered.filter(r =>
                        r.revenueCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        r.tenantName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        r.roomNumber.includes(debouncedSearch)
                    );
                }

                if (statusFilter !== 'ALL') {
                    filtered = filtered.filter(r => r.status === statusFilter);
                }

                if (monthFilter) {
                    filtered = filtered.filter(r => r.month === monthFilter);
                }

                if (boardingHouseFilter !== 'ALL') {
                    filtered = filtered.filter(r => r.boardingHouseName === boardingHouseFilter);
                }

                // Calculate statistics
                const stats = {
                    totalRevenue: filtered.reduce((sum, r) => sum + r.totalRevenue, 0),
                    paidRevenue: filtered.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.paidAmount, 0),
                    unpaidRevenue: filtered.filter(r => r.status === 'UNPAID').reduce((sum, r) => sum + (r.totalRevenue - r.paidAmount), 0),
                    partialRevenue: filtered.filter(r => r.status === 'PARTIAL').reduce((sum, r) => sum + (r.totalRevenue - r.paidAmount), 0),
                };
                setStatistics(stats);

                setRevenueSource(filtered);
                setPagination({
                    current: page,
                    pageSize,
                    total: filtered.length,
                });
                setLoading(false);
            }, 500);
        } catch (error) {
            message.error(error.response?.data?.message || error.message);
            setRevenueSource([]);
            setLoading(false);
        }
    };

    const handleViewRevenue = (record) => {
        setSelectedRevenue(record);
        setIsModalOpen(true);
    };

    const handleTableChange = (pagination) => {
        handleGetRevenues(pagination.current, pagination.pageSize);
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('ALL');
        setMonthFilter(dayjs().format('YYYY-MM'));
        setBoardingHouseFilter('ALL');
        message.success('Đã reset bộ lọc');
    };

    const renderViewContent = () => {
        if (!selectedRevenue) return null;

        return (
            <div style={{ padding: '16px 0' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Thông tin chung</h4>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Mã doanh thu:</strong> {selectedRevenue.revenueCode}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Tháng:</strong> {dayjs(selectedRevenue.month).format('MM/YYYY')}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Trạng thái:</strong> {renderStatusTag(selectedRevenue.status)}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Người thuê:</strong> {selectedRevenue.tenantName}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Phòng:</strong> {selectedRevenue.roomNumber} - {selectedRevenue.buildingName}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Khu trọ:</strong> {selectedRevenue.boardingHouseName}
                            </div>
                        </Col>
                    </Row>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Chi tiết phí</h4>
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                        <Row gutter={[16, 12]}>
                            <Col span={12}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Tiền phòng:</span>
                                    <strong>{formatCurrency(selectedRevenue.roomPrice)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Tiền điện:</span>
                                    <strong>{formatCurrency(selectedRevenue.electricityFee)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Tiền nước:</span>
                                    <strong>{formatCurrency(selectedRevenue.waterFee)}</strong>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Tiền internet:</span>
                                    <strong>{formatCurrency(selectedRevenue.internetFee)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Phí gửi xe:</span>
                                    <strong>{formatCurrency(selectedRevenue.parkingFee)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Phí vệ sinh:</span>
                                    <strong>{formatCurrency(selectedRevenue.cleaningFee)}</strong>
                                </div>
                            </Col>
                        </Row>
                        {selectedRevenue.otherFees > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d9d9d9' }}>
                                <span>Phí khác:</span>
                                <strong>{formatCurrency(selectedRevenue.otherFees)}</strong>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #52c41a', fontSize: '16px' }}>
                            <strong style={{ color: '#52c41a' }}>Tổng cộng:</strong>
                            <strong style={{ color: '#52c41a', fontSize: '18px' }}>{formatCurrency(selectedRevenue.totalRevenue)}</strong>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Thông tin thanh toán</h4>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Đã thanh toán:</strong> <span style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>{formatCurrency(selectedRevenue.paidAmount)}</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Còn thiếu:</strong> <span style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}>{formatCurrency(selectedRevenue.totalRevenue - selectedRevenue.paidAmount)}</span>
                            </div>
                        </Col>
                        <Col span={12}>
                            {selectedRevenue.paymentDate && (
                                <div style={{ marginBottom: '8px' }}>
                                    <strong>Ngày thanh toán:</strong> {dayjs(selectedRevenue.paymentDate).format('DD/MM/YYYY HH:mm')}
                                </div>
                            )}
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Ngày tạo:</strong> {dayjs(selectedRevenue.createdAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    };

    return (
        <div className={cx('revenue-wrapper')}>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className={cx('statistics-section')}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('stat-card', 'total')}>
                        <Statistic
                            title="Tổng doanh thu"
                            value={statistics.totalRevenue}
                            prefix={<FundOutlined />}
                            suffix="đ"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('stat-card', 'paid')}>
                        <Statistic
                            title="Đã thu"
                            value={statistics.paidRevenue}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('stat-card', 'unpaid')}>
                        <Statistic
                            title="Chưa thu"
                            value={statistics.unpaidRevenue}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('stat-card', 'partial')}>
                        <Statistic
                            title="Thu 1 phần"
                            value={statistics.partialRevenue}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter Section */}
            <FilterComponent
                fields={[
                    {
                        type: 'search',
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Tìm mã doanh thu, tên người thuê, phòng...'
                    },
                    {
                        type: 'select',
                        value: boardingHouseFilter,
                        onChange: setBoardingHouseFilter,
                        options: [
                            { value: 'ALL', label: 'Tất cả khu trọ' },
                            { value: 'Nhà trọ Sunshine', label: 'Nhà trọ Sunshine' },
                            { value: 'Nhà trọ Green Park', label: 'Nhà trọ Green Park' },
                            { value: 'Nhà trọ Sky View', label: 'Nhà trọ Sky View' }
                        ]
                    },
                    {
                        type: 'month',
                        value: monthFilter ? dayjs(monthFilter) : null,
                        onChange: (date) => setMonthFilter(date ? date.format('YYYY-MM') : null)
                    },
                    {
                        type: 'select',
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { value: 'ALL', label: 'Tất cả trạng thái' },
                            { value: 'PAID', label: 'Đã thanh toán' },
                            { value: 'PARTIAL', label: 'Thanh toán 1 phần' },
                            { value: 'UNPAID', label: 'Chưa thanh toán' },
                            { value: 'OVERDUE', label: 'Quá hạn' }
                        ]
                    }
                ]}
                onReset={handleReset}
                gridTemplate="minmax(200px, 1fr) minmax(180px, 1fr) minmax(150px, 1fr) minmax(180px, 1fr) 80px"
            />

            {/* Header */}
            <div className={cx('sub_header')}>
                <div className={cx('features')}>
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: 'Bảng', value: 'table', icon: <TableOutlined /> },
                            { label: 'Thẻ', value: 'card', icon: <AppstoreOutlined /> },
                        ]}
                        className={cx('view-toggle')}
                    />
                    <SmartButton
                        title="Biểu đồ"
                        icon={<LineChartOutlined />}
                        onClick={() => message.info('Tính năng biểu đồ sắp có!')}
                    />
                    <SmartButton
                        title="Excel"
                        icon={<CloudUploadOutlined />}
                        onClick={() => message.info('Xuất Excel sắp có!')}
                    />
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        showQuickJumper
                        pageSizeOptions={['6', '12', '24']}
                        onChange={(page, pageSize) => handleGetRevenues(page, pageSize)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className={cx('revenue-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={revenueSource}
                        loading={loading}
                        pagination={false}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                        {revenueSource.map((revenue) => (
                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={revenue.id}>
                                <RevenueCard
                                    revenue={revenue}
                                    onView={() => handleViewRevenue(revenue)}
                                    renderStatusTag={renderStatusTag}
                                    formatCurrency={formatCurrency}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* Modal */}
            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title="Chi tiết doanh thu"
                fields={[]}
                initialValues={selectedRevenue}
                isDeleteMode={false}
                formInstance={form}
                customContent={renderViewContent()}
            />
        </div>
    );
}

export default Revenue;
