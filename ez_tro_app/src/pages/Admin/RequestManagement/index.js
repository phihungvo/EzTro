import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/RequestManagement/Request.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import RequestCard from '~/components/Layout/AdminLayout/components/RequestCard';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    TableOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import { Form, message, Row, Col, Pagination, Segmented, Tag, DatePicker } from 'antd';
import dayjs from 'dayjs';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);

const mockRequests = [
    {
        id: 1,
        requestCode: 'REQ001',
        type: 'CLEANING',
        tenantName: 'Nguyễn Văn A',
        tenantPhone: '0901234567',
        roomNumber: '101',
        buildingName: 'Toà A',
        boardingHouseName: 'Nhà trọ Sunshine',
        description: 'Yêu cầu dọn phòng vào sáng thứ 7',
        status: 'PENDING',
        createdAt: '2025-11-10T08:00:00',
        scheduledDate: null,
        note: null
    },
    {
        id: 2,
        requestCode: 'REQ002',
        type: 'CHECKOUT',
        tenantName: 'Trần Thị B',
        tenantPhone: '0912345678',
        roomNumber: '205',
        buildingName: 'Toà B',
        boardingHouseName: 'Nhà trọ Green Park',
        description: 'Trả phòng vào cuối tháng 11',
        status: 'APPROVED',
        createdAt: '2025-11-12T14:30:00',
        checkoutDate: '2025-11-30',
        scheduledDate: '2025-11-30T10:00:00',
        note: 'Đã xác nhận lịch trả phòng'
    },
    {
        id: 3,
        requestCode: 'REQ003',
        type: 'CLEANING',
        tenantName: 'Lê Văn C',
        tenantPhone: '0923456789',
        roomNumber: '302',
        buildingName: 'Toà C',
        boardingHouseName: 'Nhà trọ Sky View',
        description: 'Cần dọn dẹp vệ sinh phòng khẩn cấp',
        status: 'COMPLETED',
        createdAt: '2025-11-08T10:15:00',
        scheduledDate: '2025-11-09T08:00:00',
        note: 'Đã hoàn thành dọn phòng'
    },
    {
        id: 4,
        requestCode: 'REQ004',
        type: 'CHECKOUT',
        tenantName: 'Phạm Thị D',
        tenantPhone: '0934567890',
        roomNumber: '108',
        buildingName: 'Toà A',
        boardingHouseName: 'Nhà trọ Sunshine',
        description: 'Trả phòng sớm do chuyển công tác',
        status: 'REJECTED',
        createdAt: '2025-11-14T16:45:00',
        checkoutDate: '2025-11-20',
        note: 'Không đủ thời gian chuẩn bị'
    },
    {
        id: 5,
        requestCode: 'REQ005',
        type: 'CLEANING',
        tenantName: 'Hoàng Văn E',
        tenantPhone: '0945678901',
        roomNumber: '401',
        buildingName: 'Toà D',
        boardingHouseName: 'Nhà trọ Green Park',
        description: 'Dọn phòng định kỳ cuối tuần',
        status: 'PENDING',
        createdAt: '2025-11-15T09:20:00',
        scheduledDate: null,
        note: null
    }
];

function Request() {
    const [requestSource, setRequestSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('view');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    // Filter states
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [dateRange, setDateRange] = useState(null);

    const renderStatusTag = (status) => {
        const map = {
            PENDING: { color: 'orange', text: 'Chờ xử lý' },
            APPROVED: { color: 'blue', text: 'Đã duyệt' },
            COMPLETED: { color: 'green', text: 'Hoàn thành' },
            REJECTED: { color: 'red', text: 'Từ chối' },
        };
        const { color, text } = map[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
    };

    const renderTypeTag = (type) => {
        const map = {
            CLEANING: { color: 'blue', text: 'Dọn phòng' },
            CHECKOUT: { color: 'purple', text: 'Trả phòng' },
        };
        const { color, text } = map[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
    };

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'requestCode',
            key: 'requestCode',
            width: 130,
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Loại yêu cầu',
            dataIndex: 'type',
            key: 'type',
            width: 130,
            align: 'center',
            render: renderTypeTag
        },
        {
            title: 'Người thuê',
            dataIndex: 'tenantName',
            key: 'tenantName',
            width: 160,
            align: 'center',
        },
        {
            title: 'SĐT',
            dataIndex: 'tenantPhone',
            key: 'tenantPhone',
            width: 120,
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
            title: 'Nội dung',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            align: 'center',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: renderStatusTag
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            align: 'center',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 160,
            align: 'center',
            render: (_, record) => (
                <>
                    <SmartButton
                        type="default"
                        icon={<EyeOutlined />}
                        buttonWidth={40}
                        onClick={() => handleViewRequest(record)}
                    />
                    {record.status === 'PENDING' && (
                        <>
                            <SmartButton
                                type="primary"
                                icon={<CheckOutlined />}
                                buttonWidth={40}
                                onClick={() => handleApproveRequest(record)}
                                style={{ marginLeft: '8px' }}
                            />
                            <SmartButton
                                type="danger"
                                icon={<CloseOutlined />}
                                buttonWidth={40}
                                onClick={() => handleRejectRequest(record)}
                                style={{ marginLeft: '8px' }}
                            />
                        </>
                    )}
                </>
            ),
        },
    ];

    const approveModalFields = [
        {
            label: 'Thời gian dự kiến',
            name: 'scheduledDate',
            type: 'date',
            render: () => <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />,
            rules: [{ required: true, message: 'Vui lòng chọn thời gian!' }],
        },
        {
            label: 'Ghi chú',
            name: 'note',
            type: 'textarea',
        },
    ];

    const rejectModalFields = [
        {
            label: 'Lý do từ chối',
            name: 'note',
            type: 'textarea',
            rules: [{ required: true, message: 'Vui lòng nhập lý do từ chối!' }],
        },
    ];

    useEffect(() => {
        handleGetRequests();
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
        handleGetRequests();
    }, [debouncedSearch, statusFilter, typeFilter, dateRange]);

    const handleGetRequests = async (page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            // Mock API call - sau này thay bằng API thật
            setTimeout(() => {
                let filtered = [...mockRequests];

                // Apply filters
                if (debouncedSearch) {
                    filtered = filtered.filter(r =>
                        r.requestCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        r.tenantName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        r.roomNumber.includes(debouncedSearch)
                    );
                }

                if (statusFilter !== 'ALL') {
                    filtered = filtered.filter(r => r.status === statusFilter);
                }

                if (typeFilter !== 'ALL') {
                    filtered = filtered.filter(r => r.type === typeFilter);
                }

                if (dateRange && dateRange[0] && dateRange[1]) {
                    filtered = filtered.filter(r => {
                        const createdAt = dayjs(r.createdAt);
                        return createdAt.isAfter(dateRange[0]) && createdAt.isBefore(dateRange[1]);
                    });
                }

                setRequestSource(filtered);
                setPagination({
                    current: page,
                    pageSize,
                    total: filtered.length,
                });
                setLoading(false);
            }, 500);
        } catch (error) {
            message.error(error.response?.data?.message || error.message);
            setRequestSource([]);
            setLoading(false);
        }
    };

    const handleViewRequest = (record) => {
        setSelectedRequest(record);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleApproveRequest = (record) => {
        setSelectedRequest(record);
        setModalMode('approve');
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleRejectRequest = (record) => {
        setSelectedRequest(record);
        setModalMode('reject');
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallApproveRequest = async (formData) => {
        try {
            // Mock API call - sau này thay bằng API thật
            console.log('Approve request:', selectedRequest.id, formData);
            message.success('Đã phê duyệt yêu cầu thành công!');
            handleGetRequests();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi phê duyệt yêu cầu: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleCallRejectRequest = async (formData) => {
        try {
            // Mock API call - sau này thay bằng API thật
            console.log('Reject request:', selectedRequest.id, formData);
            message.success('Đã từ chối yêu cầu!');
            handleGetRequests();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi từ chối yêu cầu: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'approve') {
            handleCallApproveRequest(formData);
        } else if (modalMode === 'reject') {
            handleCallRejectRequest(formData);
        }
    };

    const handleTableChange = (pagination) => {
        handleGetRequests(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'view':
                return 'Chi tiết yêu cầu';
            case 'approve':
                return 'Phê duyệt yêu cầu';
            case 'reject':
                return 'Từ chối yêu cầu';
            default:
                return 'Yêu cầu';
        }
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('ALL');
        setTypeFilter('ALL');
        setDateRange(null);
        message.success('Đã reset bộ lọc');
    };

    const renderViewContent = () => {
        if (!selectedRequest) return null;

        return (
            <div style={{ padding: '16px 0' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Thông tin yêu cầu</h4>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Mã yêu cầu:</strong> {selectedRequest.requestCode}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Loại yêu cầu:</strong> {renderTypeTag(selectedRequest.type)}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Trạng thái:</strong> {renderStatusTag(selectedRequest.status)}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Người thuê:</strong> {selectedRequest.tenantName}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Số điện thoại:</strong> {selectedRequest.tenantPhone}
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>Ngày tạo:</strong> {dayjs(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                        </Col>
                    </Row>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Thông tin phòng</h4>
                    <div style={{ marginBottom: '8px' }}>
                        <strong>Phòng:</strong> {selectedRequest.roomNumber}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <strong>Toà nhà:</strong> {selectedRequest.buildingName}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <strong>Khu trọ:</strong> {selectedRequest.boardingHouseName}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Nội dung yêu cầu</h4>
                    <div style={{
                        padding: '12px',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        lineHeight: '1.6'
                    }}>
                        {selectedRequest.description}
                    </div>
                </div>

                {selectedRequest.scheduledDate && (
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Thời gian dự kiến</h4>
                        <div>{dayjs(selectedRequest.scheduledDate).format('DD/MM/YYYY HH:mm')}</div>
                    </div>
                )}

                {selectedRequest.note && (
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Ghi chú</h4>
                        <div style={{
                            padding: '12px',
                            background: '#f5f5f5',
                            borderRadius: '4px',
                            lineHeight: '1.6'
                        }}>
                            {selectedRequest.note}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cx('request-wrapper')}>
            {/* Filter Section */}
            <FilterComponent
                fields={[
                    {
                        type: 'search',
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Tìm mã yêu cầu, tên người thuê, phòng...'
                    },
                    {
                        type: 'select',
                        value: typeFilter,
                        onChange: setTypeFilter,
                        options: [
                            { value: 'ALL', label: 'Tất cả loại' },
                            { value: 'CLEANING', label: 'Dọn phòng' },
                            { value: 'CHECKOUT', label: 'Trả phòng' }
                        ]
                    },
                    {
                        type: 'select',
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { value: 'ALL', label: 'Tất cả trạng thái' },
                            { value: 'PENDING', label: 'Chờ xử lý' },
                            { value: 'APPROVED', label: 'Đã duyệt' },
                            { value: 'COMPLETED', label: 'Hoàn thành' },
                            { value: 'REJECTED', label: 'Từ chối' }
                        ]
                    },
                    {
                        type: 'dateRange',
                        value: dateRange,
                        onChange: setDateRange
                    }
                ]}
                onReset={handleReset}
                gridTemplate="minmax(200px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) minmax(240px, 1fr) 80px"
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
                        title="Excel"
                        icon={<CloudUploadOutlined />}
                        onClick={() => message.info('Xuất Excel sắp có!')}
                    />
                </div>
            </div>

            {/* Content */}
            <div className={cx('request-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={requestSource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {requestSource.map((request) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={request.id}>
                                    <RequestCard
                                        request={request}
                                        onView={() => handleViewRequest(request)}
                                        onApprove={() => handleApproveRequest(request)}
                                        onReject={() => handleRejectRequest(request)}
                                        renderStatusTag={renderStatusTag}
                                        renderTypeTag={renderTypeTag}
                                    />
                                </Col>
                            ))}
                        </Row>

                        <div className={cx('pagination-wrapper')}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                showSizeChanger
                                showQuickJumper
                                pageSizeOptions={['6', '12', '24']}
                                onChange={(page, pageSize) => handleGetRequests(page, pageSize)}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={modalMode === 'view' ? [] : modalMode === 'approve' ? approveModalFields : rejectModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedRequest}
                isDeleteMode={false}
                formInstance={form}
                customContent={modalMode === 'view' ? renderViewContent() : null}
            />
        </div>
    );
}

export default Request;