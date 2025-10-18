import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/AdminDashboard/Room/Room.module.scss';
import SmartTable from '~/components/Layout/components/SmartTable';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/components/SmartInput';
import SmartButton from '~/components/Layout/components/SmartButton';
import PopupModal from '~/components/Layout/components/PopupModal';
import { Form, message, Tag } from 'antd';
import { getAllRooms } from '~/service/admin/room';

const cx = classNames.bind(styles);

function Room() {
    const [roomSource, setRoomSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [form] = Form.useForm();

    const statusRoom = {
        AVAILABLE: { color: 'success', label: 'Trống' },
        OCCUPIED: { color: 'warning', label: 'Đã cho thuê' },
        MAINTENANCE: { color: 'error', label: 'Đang bảo trì' },
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
            render: (price) => price ? `${price.toLocaleString()}` : 'N/A',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: (status) => {
                const info = statusRoom[status] || { color: 'default', label: 'Không xác định' };
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
            render: (_, record) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined />}
                        buttonWidth={50}
                        onClick={() => handleEditRoom(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={50}
                        onClick={() => handleDeleteRoom(record)}
                        style={{ marginLeft: '8px' }}
                    />
                </>
            ),
        },
    ];

    const userModalFields = [
        {
            label: 'Chức vụ',
            name: 'title',
            type: 'text',
            rules: [{ required: true, message: 'Chức vụ bắt buộc!' }],
        },
        {
            label: 'Mô tả chi tiết',
            name: 'description',
            type: 'text',
        },
        {
            label: 'Lương cơ bản',
            name: 'baseSalary',
            type: 'number',
            rules: [{ type: 'number', min: 0, message: 'Lương cơ bản phải lớn hơn 0!' }],
        },
        {
            label: 'Loại công việc',
            name: 'positionType',
            type: 'select',
            options: [
                'INTERN',
                'JUNIOR',
                'MID',
                'SENIOR',
                'LEADER',
                'MANAGER',
                'DIRECTOR',
                'EXECUTIVE',
            ],
            rules: [{ required: true, message: 'Loại công việc bắt buộc!' }],
        },
    ];

    useEffect(() => {
        handleGetRooms();
    }, []);

    const handleGetRooms = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await getAllRooms({ page: page - 1, pageSize });

            if (response && Array.isArray(response.content)) {
                const mappedRooms = response.content.map((room) => ({
                    ...room,
                }));
                setRoomSource(mappedRooms);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
            } else {
                setRoomSource([]);
                message.error('Dữ liệu vị trí không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách vị trí: ${error.response?.data?.message || error.message}`);
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

    const handleCallCreateRoom = async (formData) => {
        try {
            // await createPosition(formData);
            handleGetRooms();
            setIsModalOpen(false);
            message.success('Tạo vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi tạo vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditRoom = (record) => {
        setSelectedPosition(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateRoom = async (formData) => {
        try {
            // await updatePosition(selectedPosition.id, formData);
            handleGetRooms();
            setIsModalOpen(false);
            message.success('Cập nhật vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi cập nhật vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteRoom = (record) => {
        setModalMode('delete');
        setSelectedPosition(record.id);
        setIsModalOpen(true);
    };

    const handleCallDeleteRoom = async () => {
        try {
            // await deletePosition(selectedPosition);
            handleGetRooms();
            setIsModalOpen(false);
            message.success('Xóa vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi xóa vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateRoom(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateRoom(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteRoom();
        }
    };

    const handleTableChange = (pagination) => {
        handleGetRooms(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm vị trí mới';
            case 'edit':
                return 'Chỉnh sửa vị trí';
            case 'delete':
                return 'Xóa vị trí';
            default:
                return 'Chi tiết vị trí';
        }
    };

    return (
        <div className={cx('room-wrapper')}>
            <div className={cx('sub_header')}>
                <SmartInput
                    size="large"
                    placeholder="Tìm kiếm"
                    icon={<SearchOutlined />}
                />
                <div className={cx('features')}>
                    <SmartButton
                        title="Thêm"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={handleAddRoom}
                    />
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined />} />
                    <SmartButton title="Excel" icon={<CloudUploadOutlined />} />
                </div>
            </div>
            <div className={cx('room-container')}>
                <SmartTable
                    columns={columns}
                    dataSources={roomSource}
                    loading={loading}
                    pagination={pagination}
                    onTableChange={handleTableChange}
                />
            </div>

            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={modalMode === 'delete' ? [] : userModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedPosition}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Room;