// src/pages/Admin/Appointment/Appointment.jsx
import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from './Appointment.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import AppointmentCard from '~/components/Layout/AdminLayout/components/AppointmentCard';
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
    CalendarOutlined,
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import {Form, message, Row, Col, Pagination, Segmented, Tag, DatePicker, Calendar, Badge} from 'antd';
import dayjs from 'dayjs';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);

// Mock data
const mockAppointments = [
    {
        id: 1,
        appointmentCode: 'APT001',
        visitorName: 'Nguyễn Văn A',
        visitorPhone: '0901234567',
        visitorEmail: 'nguyenvana@gmail.com',
        roomNumber: '101',
        buildingName: 'Toà A',
        boardingHouseName: 'Nhà trọ Sunshine',
        appointmentDate: '2025-11-20T10:00:00',
        status: 'PENDING',
        note: 'Khách muốn xem phòng vào buổi sáng',
        createdAt: '2025-11-15T08:00:00',
    },
    {
        id: 2,
        appointmentCode: 'APT002',
        visitorName: 'Trần Thị B',
        visitorPhone: '0912345678',
        visitorEmail: 'tranthib@gmail.com',
        roomNumber: '205',
        buildingName: 'Toà B',
        boardingHouseName: 'Nhà trọ Green Park',
        appointmentDate: '2025-11-21T14:00:00',
        status: 'CONFIRMED',
        note: 'Đã xác nhận lịch hẹn',
        createdAt: '2025-11-14T10:30:00',
    },
    {
        id: 3,
        appointmentCode: 'APT003',
        visitorName: 'Lê Văn C',
        visitorPhone: '0923456789',
        visitorEmail: 'levanc@gmail.com',
        roomNumber: '302',
        buildingName: 'Toà C',
        boardingHouseName: 'Nhà trọ Sky View',
        appointmentDate: '2025-11-18T09:00:00',
        status: 'COMPLETED',
        note: 'Khách đã xem phòng và hài lòng',
        createdAt: '2025-11-13T15:20:00',
    },
    {
        id: 4,
        appointmentCode: 'APT004',
        visitorName: 'Phạm Thị D',
        visitorPhone: '0934567890',
        visitorEmail: 'phamthid@gmail.com',
        roomNumber: '108',
        buildingName: 'Toà A',
        boardingHouseName: 'Nhà trọ Sunshine',
        appointmentDate: '2025-11-19T16:00:00',
        status: 'CANCELLED',
        note: 'Khách hủy do bận việc đột xuất',
        createdAt: '2025-11-12T11:00:00',
    },
    {
        id: 5,
        appointmentCode: 'APT005',
        visitorName: 'Hoàng Văn E',
        visitorPhone: '0945678901',
        visitorEmail: 'hoangvane@gmail.com',
        roomNumber: '401',
        buildingName: 'Toà D',
        boardingHouseName: 'Nhà trọ Green Park',
        appointmentDate: '2025-11-22T11:00:00',
        status: 'PENDING',
        note: 'Khách yêu cầu gặp chủ trọ',
        createdAt: '2025-11-16T09:00:00',
    },
];

function Appointment() {
    const [appointmentSource, setAppointmentSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('view');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [calendarView, setCalendarView] = useState(false);
    const [form] = Form.useForm();

    // Filter states
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateRange, setDateRange] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const renderStatusTag = (status) => {
        const map = {
            PENDING: {color: 'orange', text: 'Chờ xác nhận'},
            CONFIRMED: {color: 'blue', text: 'Đã xác nhận'},
            COMPLETED: {color: 'green', text: 'Đã hoàn thành'},
            CANCELLED: {color: 'red', text: 'Đã hủy'},
        };
        const {color, text} = map[status] || {color: 'default', text: status};
        return <Tag color={color}>{text}</Tag>;
    };

    const columns = [
        {
            title: 'Mã lịch hẹn',
            dataIndex: 'appointmentCode',
            key: 'appointmentCode',
            width: 130,
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'visitorName',
            key: 'visitorName',
            width: 160,
            align: 'center',
        },
        {
            title: 'SĐT',
            dataIndex: 'visitorPhone',
            key: 'visitorPhone',
            width: 120,
            align: 'center',
        },
        {
            title: 'Email',
            dataIndex: 'visitorEmail',
            key: 'visitorEmail',
            width: 200,
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
            title: 'Ngày hẹn',
            dataIndex: 'appointmentDate',
            key: 'appointmentDate',
            width: 180,
            align: 'center',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            align: 'center',
            render: renderStatusTag
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
                        icon={<EyeOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleViewAppointment(record)}
                    />
                    {record.status === 'PENDING' && (
                        <>
                            <SmartButton
                                type="primary"
                                icon={<CheckOutlined/>}
                                buttonWidth={40}
                                onClick={() => handleConfirmAppointment(record)}
                                style={{marginLeft: '8px'}}
                            />
                            <SmartButton
                                type="danger"
                                icon={<CloseOutlined/>}
                                buttonWidth={40}
                                onClick={() => handleCancelAppointment(record)}
                                style={{marginLeft: '8px'}}
                            />
                        </>
                    )}
                </>
            ),
        },
    ];

    const confirmModalFields = [
        {
            label: 'Thời gian xác nhận',
            name: 'appointmentDate',
            type: 'date',
            render: () => <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{width: '100%'}}/>,
            rules: [{required: true, message: 'Vui lòng chọn thời gian!'}],
        },
        {
            label: 'Ghi chú',
            name: 'note',
            type: 'textarea',
        },
    ];

    const cancelModalFields = [
        {
            label: 'Lý do hủy',
            name: 'note',
            type: 'textarea',
            rules: [{required: true, message: 'Vui lòng nhập lý do hủy!'}],
        },
    ];

    useEffect(() => {
        handleGetAppointments();
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        setPagination(prev => ({...prev, current: 1}));
        handleGetAppointments();
    }, [debouncedSearch, statusFilter, dateRange]);

    const handleGetAppointments = async (page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            // Mock API call
            setTimeout(() => {
                let filtered = [...mockAppointments];

                if (debouncedSearch) {
                    filtered = filtered.filter(a =>
                        a.appointmentCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        a.visitorName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        a.visitorPhone.includes(debouncedSearch)
                    );
                }

                if (statusFilter !== 'ALL') {
                    filtered = filtered.filter(a => a.status === statusFilter);
                }

                if (dateRange && dateRange[0] && dateRange[1]) {
                    filtered = filtered.filter(a => {
                        const appointmentDate = dayjs(a.appointmentDate);
                        return appointmentDate.isAfter(dateRange[0]) && appointmentDate.isBefore(dateRange[1]);
                    });
                }

                setAppointmentSource(filtered);
                setPagination({
                    current: page,
                    pageSize,
                    total: filtered.length,
                });
                setLoading(false);
            }, 500);
        } catch (error) {
            message.error(error.response?.data?.message || error.message);
            setAppointmentSource([]);
            setLoading(false);
        }
    };

    const handleViewAppointment = (record) => {
        setSelectedAppointment(record);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleConfirmAppointment = (record) => {
        setSelectedAppointment(record);
        setModalMode('confirm');
        form.resetFields();
        form.setFieldsValue({
            appointmentDate: dayjs(record.appointmentDate)
        });
        setIsModalOpen(true);
    };

    const handleCancelAppointment = (record) => {
        setSelectedAppointment(record);
        setModalMode('cancel');
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallConfirmAppointment = async (formData) => {
        try {
            console.log('Confirm appointment:', selectedAppointment.id, formData);
            message.success('Đã xác nhận lịch hẹn!');
            handleGetAppointments();
            setIsModalOpen(false);
        } catch (error) {
            message.error(`Lỗi khi xác nhận lịch hẹn: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleCallCancelAppointment = async (formData) => {
        try {
            console.log('Cancel appointment:', selectedAppointment.id, formData);
            message.success('Đã hủy lịch hẹn!');
            handleGetAppointments();
            setIsModalOpen(false);
        } catch (error) {
            message.error(`Lỗi khi hủy lịch hẹn: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'confirm') {
            handleCallConfirmAppointment(formData);
        } else if (modalMode === 'cancel') {
            handleCallCancelAppointment(formData);
        }
    };

    const handleTableChange = (pagination) => {
        handleGetAppointments(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'view':
                return 'Chi tiết lịch hẹn';
            case 'confirm':
                return 'Xác nhận lịch hẹn';
            case 'cancel':
                return 'Hủy lịch hẹn';
            default:
                return 'Lịch hẹn';
        }
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('ALL');
        setDateRange(null);
        message.success('Đã reset bộ lọc');
    };

    const renderViewContent = () => {
        if (!selectedAppointment) return null;

        return (
            <div style={{padding: '16px 0'}}>
                <div style={{marginBottom: '24px'}}>
                    <h4 style={{marginBottom: '12px', color: '#1890ff'}}>Thông tin khách hàng</h4>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Họ tên:</strong> {selectedAppointment.visitorName}
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Số điện thoại:</strong> {selectedAppointment.visitorPhone}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Email:</strong> {selectedAppointment.visitorEmail}
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Mã lịch hẹn:</strong> {selectedAppointment.appointmentCode}
                            </div>
                        </Col>
                    </Row>
                </div>

                <div style={{marginBottom: '24px'}}>
                    <h4 style={{marginBottom: '12px', color: '#1890ff'}}>Thông tin phòng</h4>
                    <div style={{marginBottom: '8px'}}>
                        <strong>Phòng:</strong> {selectedAppointment.roomNumber}
                    </div>
                    <div style={{marginBottom: '8px'}}>
                        <strong>Toà nhà:</strong> {selectedAppointment.buildingName}
                    </div>
                    <div style={{marginBottom: '8px'}}>
                        <strong>Khu trọ:</strong> {selectedAppointment.boardingHouseName}
                    </div>
                </div>

                <div style={{marginBottom: '24px'}}>
                    <h4 style={{marginBottom: '12px', color: '#1890ff'}}>Thông tin lịch hẹn</h4>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Ngày
                                    hẹn:</strong> {dayjs(selectedAppointment.appointmentDate).format('DD/MM/YYYY HH:mm')}
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Trạng thái:</strong> {renderStatusTag(selectedAppointment.status)}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Ngày
                                    tạo:</strong> {dayjs(selectedAppointment.createdAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                        </Col>
                    </Row>
                </div>

                {selectedAppointment.note && (
                    <div style={{marginBottom: '24px'}}>
                        <h4 style={{marginBottom: '12px', color: '#1890ff'}}>Ghi chú</h4>
                        <div style={{
                            padding: '12px',
                            background: '#f5f5f5',
                            borderRadius: '4px',
                            lineHeight: '1.6'
                        }}>
                            {selectedAppointment.note}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Calendar helpers
    const getListData = (value) => {
        const dateStr = value.format('YYYY-MM-DD');
        return appointmentSource.filter(apt =>
            dayjs(apt.appointmentDate).format('YYYY-MM-DD') === dateStr
        );
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                {listData.map(item => (
                    <li key={item.id} style={{marginBottom: '4px'}}>
                        <Badge
                            status={
                                item.status === 'CONFIRMED' ? 'processing' :
                                    item.status === 'COMPLETED' ? 'success' :
                                        item.status === 'CANCELLED' ? 'error' : 'warning'
                            }
                            text={
                                <span style={{fontSize: '12px'}}>
                                    {dayjs(item.appointmentDate).format('HH:mm')} - {item.visitorName}
                                </span>
                            }
                        />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className={cx('appointment-wrapper')}>
            {/* Filter Section */}
            <FilterComponent
                fields={[
                    {
                        type: 'search',
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Tìm mã lịch hẹn, tên khách, SĐT...'
                    },
                    {
                        type: 'select',
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            {value: 'ALL', label: 'Tất cả trạng thái'},
                            {value: 'PENDING', label: 'Chờ xác nhận'},
                            {value: 'CONFIRMED', label: 'Đã xác nhận'},
                            {value: 'COMPLETED', label: 'Đã hoàn thành'},
                            {value: 'CANCELLED', label: 'Đã hủy'}
                        ]
                    },
                    {
                        type: 'dateRange',
                        value: dateRange,
                        onChange: setDateRange
                    }
                ]}
                onReset={handleReset}
                gridTemplate="minmax(200px, 1fr) minmax(180px, 1fr) minmax(240px, 1fr) 80px"
            />

            {/* Header */}
            <div className={cx('sub_header')}>
                <div className={cx('features')}>
                    <Segmented
                        value={calendarView ? 'calendar' : viewMode}
                        onChange={(value) => {
                            if (value === 'calendar') {
                                setCalendarView(true);
                            } else {
                                setCalendarView(false);
                                setViewMode(value);
                            }
                        }}
                        options={[
                            {label: 'Bảng', value: 'table', icon: <TableOutlined/>},
                            {label: 'Thẻ', value: 'card', icon: <AppstoreOutlined/>},
                            {label: 'Lịch', value: 'calendar', icon: <CalendarOutlined/>},
                        ]}
                        className={cx('view-toggle')}
                    />
                    <SmartButton
                        title="Excel"
                        icon={<CloudUploadOutlined/>}
                        onClick={() => message.info('Xuất Excel sắp có!')}
                    />
                </div>
            </div>

            {/* Content */}
            <div className={cx('appointment-container')}>
                {calendarView ? (
                    <div className={cx('calendar-wrapper')}>
                        <Calendar
                            dateCellRender={dateCellRender}
                            onSelect={(date) => setSelectedDate(date)}
                        />
                    </div>
                ) : viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={appointmentSource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {appointmentSource.map((appointment) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={appointment.id}>
                                    <AppointmentCard
                                        appointment={appointment}
                                        onView={() => handleViewAppointment(appointment)}
                                        onConfirm={() => handleConfirmAppointment(appointment)}
                                        onCancel={() => handleCancelAppointment(appointment)}
                                        renderStatusTag={renderStatusTag}
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
                                onChange={(page, pageSize) => handleGetAppointments(page, pageSize)}
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
                fields={modalMode === 'view' ? [] : modalMode === 'confirm' ? confirmModalFields : cancelModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedAppointment}
                isDeleteMode={false}
                formInstance={form}
                customContent={modalMode === 'view' ? renderViewContent() : null}
            />
        </div>
    );
}

export default Appointment;