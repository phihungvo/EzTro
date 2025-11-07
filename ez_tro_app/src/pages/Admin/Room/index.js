import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/Room/Room.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import RoomCard from '~/components/Layout/AdminLayout/components/RoomCard';
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
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import {Form, message, Tag, Row, Col, Segmented, Pagination} from 'antd';
import {getAllRooms, createRoom, updateRoom, deleteRoom} from '~/service/admin/room';
import {getAllBoardingHousesNoPaged, getUtilityByBoardingHouse} from "~/service/admin/boarding_house";
import {deleteBuilding, getByBoardingHouse, updateBuilding} from "~/service/admin/building";
import {createContract} from "~/service/admin/contract";

const cx = classNames.bind(styles);

function Room() {
    const [roomSource, setRoomSource] = useState([]);
    const [utilityOption, setUtilityOption] = useState([]);
    const [buildingOption, setBuildingOption] = useState([]);
    const [boardingHouseOption, setBoardingHouseOption] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const statusRoom = {
        AVAILABLE: {color: 'success', label: 'Trống'},
        OCCUPIED: {color: 'warning', label: 'Đã cho thuê'},
        MAINTENANCE: {color: 'error', label: 'Đang bảo trì'},
    };

    const disabledWhenEdit = modalMode === 'edit';

    const handleBoardingHouseChange = async (boardingHouseId) => {
        if (!boardingHouseId) {
            setUtilityOption([]);
            setBuildingOption([]);
            form.setFieldsValue({utilityIds: [], buildingId: null});
            return;
        }

        setLoading(true);
        try {
            const [utilitiesResponse, buildingsResponse] = await Promise.all([
                getUtilityByBoardingHouse(boardingHouseId),
                getByBoardingHouse(boardingHouseId),
            ]);

            setUtilityOption(utilitiesResponse.map(u => ({label: u.name, value: u.id})));
            setBuildingOption(buildingsResponse.map(b => ({label: b.name, value: b.id})));

            form.setFieldsValue({utilityIds: [], buildingId: null});
        } catch (error) {
            message.error('Không thể tải tiện ích và tòa nhà cho khu này');
            setUtilityOption([]);
            setBuildingOption([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGetRooms = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllRooms({page: page - 1, pageSize});

            if (response?.content) {
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

    const fetchOptions = async () => {
        try {
            const response = await getAllBoardingHousesNoPaged();
            setBoardingHouseOption(response.map(bh => ({value: bh.id, label: bh.name})));
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleAddRoom = () => {
        setModalMode('create');
        setSelectedRoom(null);
        form.resetFields();
        setUtilityOption([]);
        setBuildingOption([]);
        setIsModalOpen(true);
    };

    const handleCallCreateRoom = async (formData) => {
        try {
            await createRoom(formData);
            handleGetRooms();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo phòng: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleEditRoom = async (record) => {
        setSelectedRoom(record);
        setModalMode('edit');
        form.setFieldsValue(record);

        if (record.boardingHouseId) {
            await handleBoardingHouseChange(record.boardingHouseId);
            form.setFieldsValue({
                ...record,
                utilityIds: record.utilityIds || [],
                buildingId: record.buildingId || null,
            });
        }

        setIsModalOpen(true);
    };

    const handleCallUpdateRoom = async (formData) => {
        try {
            await updateRoom(selectedRoom.id, formData);
            handleGetRooms();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật phòng: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteRoom = (record) => {
        setModalMode('delete');
        setSelectedRoom(record);
        setIsModalOpen(true);
    };

    const handleCallDeleteRoom = async () => {
        await deleteRoom(selectedRoom.id);
        handleGetRooms();
        setIsModalOpen(false);
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateRoom(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateRoom(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteRoom();
        }
        setIsModalOpen(false);
        handleGetRooms(pagination.current, pagination.pageSize);
    };

    const handleTableChange = (pagination) => {
        handleGetRooms(pagination.current, pagination.pageSize);
    };

    const handleViewRoom = (record) => {
        setSelectedRoom(record);
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

    useEffect(() => {
        fetchOptions();
        handleGetRooms();
    }, []);

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
            title: 'Thuộc nhà trọ',
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
            width: 350,
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

    const roomModalFields = [
        {
            label: 'Khu nhà',
            name: modalMode === 'edit' ? 'boardingHouseName' : 'boardingHouseId',
            type: modalMode === 'edit' ? 'text' : 'select',
            options: boardingHouseOption,
            disabled: modalMode === 'edit',
            onChange: modalMode === 'create' ? handleBoardingHouseChange : undefined,
            rules: modalMode === 'create' ? [{ required: true, message: 'Chọn khu nhà!' }] : [],
        },
        {
            label: 'Tòa nhà',
            name: modalMode === 'edit' ? 'buildingName' : 'buildingId',
            type: modalMode === 'edit' ? 'text' : 'select',
            options: buildingOption,
            disabled: modalMode === 'edit',
            rules: modalMode === 'create' ? [{ required: true, message: 'Chọn tòa nhà!' }] : [],
        },
        {
            label: 'Số phòng',
            name: 'roomNumber',
            type: 'text',
            placeholder: 'Để trống để hệ thống tự sinh',
        },
        {
            label: 'Diện tích (m²)',
            name: 'area',
            type: 'number',
        },
        {
            label: 'Số tầng',
            name: 'floorNumber',
            type: 'number',
        },
        {
            label: 'Số người tối đa',
            name: 'maxOccupants',
            type: 'number',
        },
        {
            label: 'Giá cho thuê',
            name: 'price',
            type: 'number',
            placeholder: 'Để trống nếu chưa xác định',
        },
        {
            label: 'Ghi chú',
            name: 'note',
            type: 'textarea',
        },
        {
            label: 'Tiện ích phòng',
            name: 'utilityIds',
            type: 'select',
            multiple: true,
            options: utilityOption,
            placeholder: 'Chọn phòng trước',
        },
        {
            label: 'Ghi chú',
            name: 'hasAirConditioner',
            type: 'checkbox',
        },
        {
            label: 'Ghi chú',
            name: 'hasBathroom',
            type: 'checkbox',
        },
        {
            label: 'Ghi chú',
            name: 'hasKitchen',
            type: 'checkbox',
        },

        // {
        //     label: 'Tiện ích cơ bản',
        //     name: 'basicAmenities',
        //     type: 'checkbox-group',
        //     options: [
        //         { label: 'Điều hòa', value: 'hasAirConditioner' },
        //         { label: 'Phòng tắm riêng', value: 'hasBathroom' },
        //         { label: 'Bếp', value: 'hasKitchen' },
        //     ],
        //     rules: [{ required: true, type: 'array', min: 1, message: 'Chọn ít nhất 1 tiện ích!' }],
        // },
    ];

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
                                        room={room}
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
                fields={modalMode === 'delete' ? [] : roomModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedRoom}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Room;