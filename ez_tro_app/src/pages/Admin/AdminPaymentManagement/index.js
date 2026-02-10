import React, { useState } from 'react';
import {
    Card,
    Table,
    Button,
    Tag,
    Space,
    Input,
    Select,
    DatePicker,
    Modal,
    Form,
    InputNumber,
    message,
    Statistic,
    Row,
    Col,
    Badge,
    Tooltip,
    Descriptions,
    Timeline,
    Image,
    Upload
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    DownloadOutlined,
    EyeOutlined,
    FileTextOutlined,
    CreditCardOutlined,
    BankOutlined,
    ShoppingOutlined,
    UploadOutlined,
    ExclamationCircleOutlined,
    RiseOutlined,
    FallOutlined
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './AdminPaymentManagement.module.scss';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Mock Data
const mockTransactions = [
    {
        id: 1,
        transactionCode: 'TXN-2025-0001',
        userId: 101,
        userName: 'Nguyễn Văn A',
        userEmail: 'nguyenvana@email.com',
        userPhone: '0901234567',
        planName: 'Standard',
        amount: 350000,
        duration: 6,
        paymentMethod: 'MOMO',
        status: 'PENDING',
        createdAt: '2025-01-22 10:30:00',
        paidAt: null,
        invoiceCode: 'INV-2025-0001',
        note: 'Chờ xác nhận chuyển khoản',
        screenshot: null
    },
    {
        id: 2,
        transactionCode: 'TXN-2025-0002',
        userId: 102,
        userName: 'Trần Thị B',
        userEmail: 'tranthib@email.com',
        userPhone: '0902345678',
        planName: 'Pro',
        amount: 799000,
        duration: 1,
        paymentMethod: 'VNPAY',
        status: 'SUCCESS',
        createdAt: '2025-01-22 09:15:00',
        paidAt: '2025-01-22 09:16:23',
        invoiceCode: 'INV-2025-0002',
        note: 'Thanh toán qua VNPAY thành công',
        screenshot: null
    },
    {
        id: 3,
        transactionCode: 'TXN-2025-0003',
        userId: 103,
        userName: 'Lê Văn C',
        userEmail: 'levanc@email.com',
        userPhone: '0903456789',
        planName: 'Basic',
        amount: 150000,
        duration: 12,
        paymentMethod: 'BANK_TRANSFER',
        status: 'PENDING',
        createdAt: '2025-01-21 15:45:00',
        paidAt: null,
        invoiceCode: 'INV-2025-0003',
        note: 'Khách đã chuyển khoản, chờ xác nhận',
        screenshot: 'https://via.placeholder.com/400x600'
    },
    {
        id: 4,
        transactionCode: 'TXN-2025-0004',
        userId: 104,
        userName: 'Phạm Thị D',
        userEmail: 'phamthid@email.com',
        userPhone: '0904567890',
        planName: 'Standard',
        amount: 350000,
        duration: 1,
        paymentMethod: 'ZALOPAY',
        status: 'FAILED',
        createdAt: '2025-01-20 14:20:00',
        paidAt: null,
        invoiceCode: 'INV-2025-0004',
        note: 'Giao dịch thất bại - Số dư không đủ',
        screenshot: null
    },
    {
        id: 5,
        transactionCode: 'TXN-2025-0005',
        userId: 105,
        userName: 'Hoàng Văn E',
        userEmail: 'hoangvane@email.com',
        userPhone: '0905678901',
        planName: 'Pro',
        amount: 4794000,
        duration: 12,
        paymentMethod: 'BANK_TRANSFER',
        status: 'SUCCESS',
        createdAt: '2025-01-19 11:00:00',
        paidAt: '2025-01-19 16:30:00',
        invoiceCode: 'INV-2025-0005',
        note: 'Thanh toán 12 tháng - Đã giảm 50%',
        screenshot: 'https://via.placeholder.com/400x600'
    }
];

const mockStatistics = {
    totalRevenue: 5643000,
    todayRevenue: 1299000,
    pendingAmount: 500000,
    successCount: 125,
    pendingCount: 8,
    failedCount: 3,
    revenueGrowth: 15.8,
    transactionGrowth: -2.3
};

function AdminPaymentManagement() {
    const [transactions, setTransactions] = useState(mockTransactions);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);

    const [filters, setFilters] = useState({
        status: 'ALL',
        paymentMethod: 'ALL',
        searchText: '',
        dateRange: null
    });

    const [form] = Form.useForm();

    const getStatusColor = (status) => {
        const colors = {
            SUCCESS: 'green',
            PENDING: 'orange',
            FAILED: 'red',
            REFUNDED: 'purple'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            SUCCESS: 'Thành công',
            PENDING: 'Chờ xác nhận',
            FAILED: 'Thất bại',
            REFUNDED: 'Đã hoàn tiền'
        };
        return texts[status] || status;
    };

    const getPaymentMethodIcon = (method) => {
        const icons = {
            MOMO: '💰',
            ZALOPAY: '💳',
            VNPAY: '🏦',
            BANK_TRANSFER: '🏛️'
        };
        return icons[method] || '💵';
    };

    const getPaymentMethodText = (method) => {
        const texts = {
            MOMO: 'MoMo',
            ZALOPAY: 'ZaloPay',
            VNPAY: 'VNPAY',
            BANK_TRANSFER: 'Chuyển khoản'
        };
        return texts[method] || method;
    };

    const handleViewDetail = (record) => {
        setSelectedTransaction(record);
        setDetailModalVisible(true);
    };

    const handleConfirmPayment = (record) => {
        setSelectedTransaction(record);
        setConfirmModalVisible(true);
    };

    const handleRejectPayment = (record) => {
        setSelectedTransaction(record);
        setRejectModalVisible(true);
    };

    const confirmTransaction = (values) => {
        const updatedTransactions = transactions.map(t =>
            t.id === selectedTransaction.id
                ? {
                    ...t,
                    status: 'SUCCESS',
                    paidAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    note: values.note || t.note
                }
                : t
        );
        setTransactions(updatedTransactions);
        message.success('Đã xác nhận thanh toán thành công');
        setConfirmModalVisible(false);
        form.resetFields();
    };

    const rejectTransaction = (values) => {
        const updatedTransactions = transactions.map(t =>
            t.id === selectedTransaction.id
                ? {
                    ...t,
                    status: 'FAILED',
                    note: values.reason
                }
                : t
        );
        setTransactions(updatedTransactions);
        message.warning('Đã từ chối giao dịch');
        setRejectModalVisible(false);
        form.resetFields();
    };

    const filteredTransactions = transactions.filter(t => {
        const matchStatus = filters.status === 'ALL' || t.status === filters.status;
        const matchMethod = filters.paymentMethod === 'ALL' || t.paymentMethod === filters.paymentMethod;
        const matchSearch = !filters.searchText ||
            t.transactionCode.toLowerCase().includes(filters.searchText.toLowerCase()) ||
            t.userName.toLowerCase().includes(filters.searchText.toLowerCase()) ||
            t.userEmail.toLowerCase().includes(filters.searchText.toLowerCase());

        return matchStatus && matchMethod && matchSearch;
    });

    const columns = [
        {
            title: 'Mã GD',
            dataIndex: 'transactionCode',
            key: 'transactionCode',
            fixed: 'left',
            width: 140,
            render: (text) => (
                <span className={cx('transaction-code')}>{text}</span>
            )
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 200,
            render: (_, record) => (
                <div className={cx('customer-info')}>
                    <div className={cx('customer-name')}>{record.userName}</div>
                    <div className={cx('customer-contact')}>{record.userPhone}</div>
                </div>
            )
        },
        {
            title: 'Gói dịch vụ',
            dataIndex: 'planName',
            key: 'planName',
            width: 120,
            render: (text, record) => (
                <div>
                    <Tag color="blue">{text}</Tag>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        {record.duration} tháng
                    </div>
                </div>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 130,
            render: (amount) => (
                <span className={cx('amount')}>
          {amount.toLocaleString('vi-VN')} đ
        </span>
            )
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 150,
            render: (method) => (
                <Space>
                    <span>{getPaymentMethodIcon(method)}</span>
                    <span>{getPaymentMethodText(method)}</span>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status) => (
                <Tag
                    color={getStatusColor(status)}
                    icon={
                        status === 'SUCCESS' ? <CheckCircleOutlined /> :
                            status === 'PENDING' ? <ClockCircleOutlined /> :
                                <CloseCircleOutlined />
                    }
                >
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (text) => (
                <div style={{ fontSize: 13 }}>
                    {text}
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    {record.status === 'PENDING' && (
                        <>
                            <Tooltip title="Xác nhận">
                                <Button
                                    type="text"
                                    icon={<CheckCircleOutlined />}
                                    style={{ color: '#52c41a' }}
                                    onClick={() => handleConfirmPayment(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button
                                    type="text"
                                    icon={<CloseCircleOutlined />}
                                    danger
                                    onClick={() => handleRejectPayment(record)}
                                />
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Tải hóa đơn">
                        <Button
                            type="text"
                            icon={<DownloadOutlined />}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className={cx('payment-wrapper')}>
            {/* Statistics */}
            <Row gutter={[16, 16]} className={cx('statistics-row')}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('stat-card', 'primary')}>
                        <Statistic
                            title="Tổng doanh thu tháng"
                            value={mockStatistics.totalRevenue}
                            precision={0}
                            valueStyle={{ color: '#722ed1', fontSize: 28 }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                        <div className={cx('stat-growth', 'up')}>
                            <RiseOutlined /> {mockStatistics.revenueGrowth}% so với tháng trước
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('stat-card', 'success')}>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={mockStatistics.todayRevenue}
                            precision={0}
                            valueStyle={{ color: '#52c41a', fontSize: 28 }}
                            prefix={<ShoppingOutlined />}
                            suffix="đ"
                        />
                        <div className={cx('stat-detail')}>
                            {mockStatistics.successCount} giao dịch thành công
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('stat-card', 'warning')}>
                        <Statistic
                            title="Chờ xác nhận"
                            value={mockStatistics.pendingAmount}
                            precision={0}
                            valueStyle={{ color: '#fa8c16', fontSize: 28 }}
                            prefix={<ClockCircleOutlined />}
                            suffix="đ"
                        />
                        <div className={cx('stat-detail')}>
                            {mockStatistics.pendingCount} giao dịch đang chờ
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={cx('stat-card', 'danger')}>
                        <Statistic
                            title="Thất bại"
                            value={mockStatistics.failedCount}
                            valueStyle={{ color: '#ff4d4f', fontSize: 28 }}
                            prefix={<CloseCircleOutlined />}
                            suffix="GD"
                        />
                        <div className={cx('stat-growth', 'down')}>
                            <FallOutlined /> {Math.abs(mockStatistics.transactionGrowth)}% so với tháng trước
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className={cx('filter-card')}>
                <Space size="middle" wrap className={cx('filter-space')}>
                    <Input
                        placeholder="Tìm mã GD, tên KH, email..."
                        prefix={<SearchOutlined />}
                        style={{ width: 280 }}
                        value={filters.searchText}
                        onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                        allowClear
                    />

                    <Select
                        placeholder="Trạng thái"
                        style={{ width: 150 }}
                        value={filters.status}
                        onChange={(value) => setFilters({ ...filters, status: value })}
                    >
                        <Select.Option value="ALL">Tất cả</Select.Option>
                        <Select.Option value="PENDING">Chờ xác nhận</Select.Option>
                        <Select.Option value="SUCCESS">Thành công</Select.Option>
                        <Select.Option value="FAILED">Thất bại</Select.Option>
                    </Select>

                    <Select
                        placeholder="Phương thức"
                        style={{ width: 160 }}
                        value={filters.paymentMethod}
                        onChange={(value) => setFilters({ ...filters, paymentMethod: value })}
                    >
                        <Select.Option value="ALL">Tất cả</Select.Option>
                        <Select.Option value="MOMO">MoMo</Select.Option>
                        <Select.Option value="ZALOPAY">ZaloPay</Select.Option>
                        <Select.Option value="VNPAY">VNPAY</Select.Option>
                        <Select.Option value="BANK_TRANSFER">Chuyển khoản</Select.Option>
                    </Select>

                    <RangePicker
                        style={{ width: 260 }}
                        placeholder={['Từ ngày', 'Đến ngày']}
                    />

                    <Button icon={<FilterOutlined />}>
                        Lọc nâng cao
                    </Button>

                    <Button type="primary" icon={<DownloadOutlined />}>
                        Xuất báo cáo
                    </Button>
                </Space>
            </Card>

            {/* Table */}
            <Card className={cx('table-card')}>
                <Table
                    columns={columns}
                    dataSource={filteredTransactions}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} giao dịch`,
                        showSizeChanger: true
                    }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title={<><FileTextOutlined /> Chi tiết giao dịch</>}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedTransaction && (
                    <div className={cx('detail-content')}>
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="Mã giao dịch" span={2}>
                                <span className={cx('transaction-code')}>{selectedTransaction.transactionCode}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã hóa đơn" span={2}>
                                {selectedTransaction.invoiceCode}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng" span={2}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{selectedTransaction.userName}</div>
                                    <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                                        {selectedTransaction.userEmail} • {selectedTransaction.userPhone}
                                    </div>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Gói dịch vụ">
                                <Tag color="blue">{selectedTransaction.planName}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời hạn">
                                {selectedTransaction.duration} tháng
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                <span className={cx('amount-large')}>
                  {selectedTransaction.amount.toLocaleString('vi-VN')} đ
                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức">
                                {getPaymentMethodIcon(selectedTransaction.paymentMethod)}{' '}
                                {getPaymentMethodText(selectedTransaction.paymentMethod)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={2}>
                                <Tag
                                    color={getStatusColor(selectedTransaction.status)}
                                    icon={
                                        selectedTransaction.status === 'SUCCESS' ? <CheckCircleOutlined /> :
                                            selectedTransaction.status === 'PENDING' ? <ClockCircleOutlined /> :
                                                <CloseCircleOutlined />
                                    }
                                >
                                    {getStatusText(selectedTransaction.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian tạo">
                                {selectedTransaction.createdAt}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian thanh toán">
                                {selectedTransaction.paidAt || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>
                                {selectedTransaction.note || '—'}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedTransaction.screenshot && (
                            <div style={{ marginTop: 24 }}>
                                <h4>Ảnh chứng từ chuyển khoản:</h4>
                                <Image
                                    width={200}
                                    src={selectedTransaction.screenshot}
                                    placeholder={<div>Loading...</div>}
                                />
                            </div>
                        )}

                        {selectedTransaction.status === 'PENDING' && (
                            <Space style={{ marginTop: 24, width: '100%' }} size="middle">
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => {
                                        setDetailModalVisible(false);
                                        handleConfirmPayment(selectedTransaction);
                                    }}
                                    block
                                >
                                    Xác nhận thanh toán
                                </Button>
                                <Button
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        setDetailModalVisible(false);
                                        handleRejectPayment(selectedTransaction);
                                    }}
                                    block
                                >
                                    Từ chối
                                </Button>
                            </Space>
                        )}
                    </div>
                )}
            </Modal>

            {/* Confirm Modal */}
            <Modal
                title={<><CheckCircleOutlined style={{ color: '#52c41a' }} /> Xác nhận thanh toán</>}
                open={confirmModalVisible}
                onCancel={() => {
                    setConfirmModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                {selectedTransaction && (
                    <Form form={form} layout="vertical" onFinish={confirmTransaction}>
                        <div className={cx('confirm-info')}>
                            <p>
                                <strong>Mã GD:</strong> {selectedTransaction.transactionCode}
                            </p>
                            <p>
                                <strong>Khách hàng:</strong> {selectedTransaction.userName}
                            </p>
                            <p>
                                <strong>Số tiền:</strong>{' '}
                                <span className={cx('amount-large')}>
                  {selectedTransaction.amount.toLocaleString('vi-VN')} đ
                </span>
                            </p>
                        </div>

                        <Form.Item
                            name="note"
                            label="Ghi chú xác nhận"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Nhập ghi chú (không bắt buộc)"
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                title={<><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Từ chối giao dịch</>}
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                {selectedTransaction && (
                    <Form form={form} layout="vertical" onFinish={rejectTransaction}>
                        <div className={cx('confirm-info')}>
                            <p>
                                <strong>Mã GD:</strong> {selectedTransaction.transactionCode}
                            </p>
                            <p>
                                <strong>Khách hàng:</strong> {selectedTransaction.userName}
                            </p>
                        </div>

                        <Form.Item
                            name="reason"
                            label="Lý do từ chối"
                            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Ví dụ: Thông tin chuyển khoản không khớp, ảnh chứng từ không rõ ràng..."
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
}

export default AdminPaymentManagement;