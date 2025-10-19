import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/Room/Room.module.scss';
import SmartTable from '~/components/Layout/components/SmartTable';
import RoomCard from 'src/components/Layout/components/BuildingCard';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
    TableOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/components/SmartInput';
import SmartButton from '~/components/Layout/components/SmartButton';
import PopupModal from '~/components/Layout/components/PopupModal';
import {Form, message, Tag, Row, Col, Segmented, Pagination} from 'antd';
import {getAllRooms} from '~/service/admin/room';

const cx = classNames.bind(styles);

function Room() {
    const [roomSource, setRoomSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const statusRoom = {
        AVAILABLE: {color: 'success', label: 'Trống'},
        OCCUPIED: {color: 'warning', label: 'Đã cho thuê'},
        MAINTENANCE: {color: 'error', label: 'Đang bảo trì'},
    };

    const columns = [
        {
            title: 'Số phòng',
            dataIndex: 'roomNumber',
            key: 'roomNumber',
            width: 150,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Diện tích',
            dataIndex: 'area',
            key: 'area',
            width: 150,
            align: 'center',
        },
        {
            title: 'Tên nhà trọ',
            dataIndex: 'boardingHouseName',
            key: 'boardingHouseName',
            align: 'center',
            width: 250,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            align: 'center',
            render: (price) => (price ? `${price.toLocaleString()} ₫` : 'N/A'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: (status) => {
                const info = statusRoom[status] || {color: 'default', label: 'Không xác định'};
                return <Tag color={info.color}>{info.label}</Tag>;
            },
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: 150,
            align: 'center',
        },
        {
            title: 'Thao tác',
            fixed: 'right',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEditRoom(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDeleteRoom(record)}
                        style={{marginLeft: '8px'}}
                    />
                </>
            ),
        },
    ];

    useEffect(() => {
        handleGetRooms();
    }, []);

    const handleGetRooms = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllRooms({page: page - 1, pageSize});

            if (response && Array.isArray(response.content)) {
                setRoomSource(response.content);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
            } else {
                setRoomSource([]);
                message.error('Dữ liệu phòng không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách phòng: ${error.response?.data?.message || error.message}`);
            setRoomSource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoom = () => {
        setModalMode('create');
        setSelectedPosition(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditRoom = (record) => {
        setSelectedPosition(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDeleteRoom = (record) => {
        setModalMode('delete');
        setSelectedPosition(record.id);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            message.success('Tạo phòng thành công (demo)');
        } else if (modalMode === 'edit') {
            message.success('Cập nhật phòng thành công (demo)');
        } else if (modalMode === 'delete') {
            message.success('Xóa phòng thành công (demo)');
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        handleGetRooms(pagination.current, pagination.pageSize);
    };

    const handleViewRoom = (record) => {
        setSelectedPosition(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm phòng mới';
            case 'edit':
                return 'Chỉnh sửa phòng';
            case 'delete':
                return 'Xóa phòng';
            case 'view':
                return 'Chi tiết phòng';
            default:
                return 'Chi tiết phòng';
        }
    };

    return (
        <div className={cx('room-wrapper')}>
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm phòng" icon={<SearchOutlined/>}/>
                <div className={cx('features')}>
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            {label: 'Bảng', value: 'table', icon: <TableOutlined/>},
                            {label: 'Thẻ', value: 'card', icon: <AppstoreOutlined/>},
                        ]}
                        className={cx('view-toggle')}
                    />
                    <SmartButton title="Thêm" icon={<PlusOutlined/>} type="primary" onClick={handleAddRoom}/>
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                </div>
            </div>

            <div className={cx('room-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={roomSource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {roomSource.map((room) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={room.id}>
                                    <RoomCard
                                        room={{
                                            id: room.id,
                                            name: room.boardingHouseName || 'N/A',
                                            address: room.note || 'Chưa có địa chỉ',
                                            floors: room.area || 0,
                                            totalRooms: room.roomNumber || 0,
                                            owner: room.status
                                                ? statusRoom[room.status]?.label
                                                : 'N/A',
                                        }}
                                        onView={() => handleViewRoom(room)}
                                        onEdit={() => handleEditRoom(room)}
                                        onDelete={() => handleDeleteRoom(room)}
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
                                onChange={(page, pageSize) => handleGetRooms(page, pageSize)}
                            />
                        </div>
                    </>
                )}
            </div>

            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={[]}
                onSubmit={handleFormSubmit}
                initialValues={selectedPosition}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Room;
