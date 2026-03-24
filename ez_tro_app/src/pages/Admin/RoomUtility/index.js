import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/RoomUtility/RoomUtility.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
// import RoomUtilityCard from '~/components/Layout/AdminLayout/components/RoomUtilityCard';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
    TableOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import {Form, message, Row, Col, Pagination, Segmented, Tag} from 'antd';
import {
    createRoomUtility,
    updateRoomUtility,
    deleteRoomUtility,
    getAllRoomUtilitiesPaged
} from '~/service/admin/room-utility';
import {getAllRoomNoPaged} from "~/service/admin/room";
import {getUtilityByBoardingHouse} from "~/service/admin/boarding_house";

const cx = classNames.bind(styles);

function RoomUtility() {
    const [roomUtilitySource, setRoomUtilitySource] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [utilityOptionSource, setUtilityOptionSource] = useState([]);
    const [roomSource, setRoomSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoomUtility, setSelectedRoomUtility] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();
    const selectedRoomId = Form.useWatch('roomId', form);

    const formatUtilityOptions = (utilities = []) => {
        const currency = (value) => Number(value).toLocaleString('vi-VN') + ' đ';

        return utilities.map(({ id, name, unitPrice, unit }) => ({
            value: id,
            label: name + (unitPrice || unit ? ` (${[unitPrice && currency(unitPrice), unit].filter(Boolean).join(' / ')})` : ''),
        }));
    };

    const getRegistrationStatusTag = (endDate) => {
        if (!endDate) {
            return <Tag color="green">Đang áp dụng</Tag>;
        }

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return end >= new Date()
            ? <Tag color="green">Đang áp dụng</Tag>
            : <Tag color="default">Đã kết thúc</Tag>;
    };

    const columns = [
        {
            title: 'Phòng',
            dataIndex: 'roomNumber',
            key: 'roomNumber',
            width: 200,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'utilityName',
            key: 'utilityName',
            width: 180,
            align: 'center',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            align: 'center',
        },
        {
            title: 'Tiêu thụ',
            dataIndex: 'usageAmount',
            key: 'usageAmount',
            width: 150,
            align: 'center',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            width: 200,
            render: (date) =>
                date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            width: 200,
            render: (date) =>
                date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'endDate',
            key: 'status',
            width: 150,
            align: 'center',
            render: (endDate) => getRegistrationStatusTag(endDate),
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
                        onClick={() => handleEditRoomUtility(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDeleteRoomUtility(record)}
                        style={{marginLeft: '8px'}}
                    />
                </>
            ),
        },
    ];

    const roomUtilityModalFields = [
        {
            label: 'Phòng',
            name: 'roomId',
            type: 'select',
            options: roomSource,
            disabled: modalMode === 'edit' || modalMode === 'view',
            rules: [{ required: true, message: 'Vui lòng chọn phòng!' }],
            placeholder: 'Chọn phòng',
        },
        {
            label: 'Dịch vụ',
            name: 'utilityId',
            type: 'select',
            options: utilityOptionSource,
            disabled: modalMode === 'edit' || modalMode === 'view' || !selectedRoomId,
            rules: [{ required: true, message: 'Vui lòng chọn dịch vụ!' }],
            placeholder: 'Chọn dịch vụ (Điện, Nước, Internet...)',
        },
        {
            label: 'Số lượng',
            name: 'quantity',
            type: 'text',
            placeholder: 'VD: Số xe giữ, số người dùng internet...',
        },
        {
            label: 'Lượng tiêu thụ',
            name: 'usageAmount',
            type: 'number',
            placeholder: 'VD: 0, 10, 100...',
        },
        {
            label: 'Ngày bắt đầu',
            name: 'startDate',
            type: 'date',
            placeholder: 'Chọn ngày bắt đầu',
        },
        {
            label: 'Ngày kết thúc (nếu có)',
            name: 'endDate',
            type: 'date',
            placeholder: 'Chọn ngày kết thúc',
        },
        {
            label: 'Ghi chú',
            name: 'note',
            type: 'textarea',
            placeholder: 'Nhập ghi chú (không bắt buộc)',
        },
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        handleGetAllRooms();
        handleGetRoomUtilities();
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!isModalOpen || modalMode !== 'create') {
            return;
        }

        if (!selectedRoomId) {
            setUtilityOptionSource([]);
            form.setFieldValue('utilityId', undefined);
            return;
        }

        loadUtilityOptionsForRoom(selectedRoomId);
    }, [selectedRoomId, isModalOpen, modalMode, rooms]);

    const handleGetAllRooms = async () => {
        try {
            const rooms = await getAllRoomNoPaged();
            setRooms(rooms);

            const mappedRooms = rooms.map(room => ({
                value: room.id,
                label: `${room.boardingHouseName} - ${room.roomNumber}`,
            }));
            setRoomSource(mappedRooms);
        } catch (error) {
            setUtilityOptionSource([]);
            setRoomSource([]);
        }
    };

    const loadUtilityOptionsForRoom = async (roomId, { preserveSelection = false } = {}) => {
        const room = rooms.find((item) => item.id === Number(roomId));

        if (!room?.boardingHouseId) {
            setUtilityOptionSource([]);
            if (!preserveSelection) {
                form.setFieldValue('utilityId', undefined);
            }
            return;
        }

        try {
            const utilities = await getUtilityByBoardingHouse(room.boardingHouseId);
            setUtilityOptionSource(formatUtilityOptions(utilities));

            if (!preserveSelection) {
                form.setFieldValue('utilityId', undefined);
            }
        } catch (error) {
            setUtilityOptionSource([]);
            if (!preserveSelection) {
                form.setFieldValue('utilityId', undefined);
            }
            message.error(error.response?.data?.message || 'Lỗi lấy danh sách dịch vụ theo nhà trọ');
        }
    };

    const handleGetRoomUtilities = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllRoomUtilitiesPaged({
                page: page - 1,
                size: pageSize
            });

            setRoomUtilitySource(response.content);
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.totalElements,
            });
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi lấy danh sách tiện ích!");
        } finally {
            setLoading(false);
        }
    };


    const handleAddRoomUtility = () => {
        setModalMode('create');
        setSelectedRoomUtility(null);
        setUtilityOptionSource([]);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateRoomUtility = async (formData) => {
        try {
            await createRoomUtility(formData);
            handleGetRoomUtilities();
        } catch (error) {
            message.error(
                `Lỗi khi tạo tiện ích: ${
                    error.response?.data?.message || error.message
                }`,
            );
            throw error;
        }
    };

    const handleEditRoomUtility = async (record) => {
        await loadUtilityOptionsForRoom(record.roomId, {preserveSelection: true});
        setSelectedRoomUtility(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateRoomUtility = async (formData) => {
        try {
            await updateRoomUtility(
                selectedRoomUtility.roomId,
                selectedRoomUtility.utilityId,
                formData,
            );
            handleGetRoomUtilities();
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật tiện ích: ${
                    error.response?.data?.message || error.message
                }`,
            );
            throw error;
        }
    };

    const handleDeleteRoomUtility = (record) => {
        setModalMode('delete');
        setSelectedRoomUtility(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteRoomUtility = async () => {
        await deleteRoomUtility(
            selectedRoomUtility.roomId,
            selectedRoomUtility.utilityId,
        );
        handleGetRoomUtilities();
    };

    const handleFormSubmit = async (formData) => {
        if (modalMode === 'create') {
            await handleCallCreateRoomUtility(formData);
        } else if (modalMode === 'edit') {
            await handleCallUpdateRoomUtility(formData);
        } else if (modalMode === 'delete') {
            await handleCallDeleteRoomUtility();
        }
    };

    const handleTableChange = (pagination) => {
        handleGetRoomUtilities(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Đăng ký sử dụng dịch vụ';
            case 'edit':
                return 'Chỉnh sửa đăng ký';
            case 'delete':
                return 'Xóa đăng ký';
            default:
                return 'Chi tiết đăng ký';
        }
    };

    return (
        <div className={cx('roomUtility-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm tiện ích" icon={<SearchOutlined/>}/>
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
                    <SmartButton title="Thêm" icon={<PlusOutlined/>} type="primary" onClick={handleAddRoomUtility}/>
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        showQuickJumper
                        pageSizeOptions={['6', '12', '24']}
                        onChange={(page, pageSize) => handleGetRoomUtilities(page, pageSize)}
                    />
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('roomUtility-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={roomUtilitySource}
                        loading={loading}
                        pagination={false}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                        {roomUtilitySource.map((roomUtility) => (
                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={roomUtility.id}>
                                {/*<RoomUtilityCard*/}
                                {/*    RoomUtility={roomUtility}*/}
                                {/*    onView={() => handleViewRoomUtility(roomUtility)}*/}
                                {/*    onEdit={() => handleEditRoomUtility(roomUtility)}*/}
                                {/*    onDelete={() => handleDeleteRoomUtility(roomUtility)}*/}
                                {/*/>*/}
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* Modal */}
            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={modalMode === 'delete' ? [] : roomUtilityModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedRoomUtility}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default RoomUtility;
