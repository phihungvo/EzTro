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
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import {Form, message, Row, Col, Segmented, Spin, Empty, ConfigProvider, Tag} from 'antd';
import FilterComponent from "~/components/Layout/AdminLayout/components/FilterComponent";
import {
    filterRooms,
    createRoom,
    updateRoom,
    deleteRoom,
} from '~/service/admin/room';
import {
    getAllBoardingHousesNoPaged,
    getUtilityByBoardingHouse,
} from '~/service/admin/boarding_house';
import {getByBoardingHouse} from '~/service/admin/building';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {useAuth} from "~/routes/AuthContext";
import useDebounce from '~/hooks/useDebounce';
import usePagination from '~/hooks/usePagination';

const cx = classNames.bind(styles);

function Room() {
    const [roomSource, setRoomSource] = useState([]);
    const [utilityOption, setUtilityOption] = useState([]);
    const [buildingOption, setBuildingOption] = useState([]);
    const [boardingHouseOption, setBoardingHouseOption] = useState([]);
    const [loading, setLoading] = useState(false);
    const {
        pagination,
        handleChange: handlePaginationChange,
        reset: resetPagination,
        setTotal: setPaginationTotal,
    } = usePagination({ initialPageSize: 10 });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [viewMode, setViewMode] = useState('card');
    const [form] = Form.useForm();

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [statusFilter, setStatusFilter] = useState(null);
    const [boardingHouseFilter, setBoardingHouseFilter] = useState(null);
    const [areaRange, setAreaRange] = useState([null, null]); // [min, max]
    const [priceRange, setPriceRange] = useState([null, null]); // [min, max]
    const [hasActiveContractFilter, setHasActiveContractFilter] = useState(null);

    // Options cho filter
    const [boardingHouseOptions, setBoardingHouseOptions] = useState([]);

    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();
    const {user} = useAuth();
    const isOwner = user?.isOwner || false;

    const currentRooms = quota?.currentRooms ?? 0;
    const maxRooms = quota?.maxRooms ?? 0;
    const addButtonText = isOwner ? `Thêm (${currentRooms}/${maxRooms})` : 'Thêm';
    const isAddDisabled = isOwner && currentRooms >= maxRooms;

    // Trạng thái phòng
    const statusOptions = [
        {value: 'AVAILABLE', label: 'Trống'},
        {value: 'OCCUPIED', label: 'Đã cho thuê'},
        {value: 'MAINTENANCE', label: 'Đang bảo trì'},
    ];

    // Fetch options cho khu nhà trọ
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await getAllBoardingHousesNoPaged();
                setBoardingHouseOption(res.map(bh => ({value: bh.id, label: bh.name})));
            } catch (err) {
                console.error('Lỗi tải danh sách khu nhà:', err);
            }
        };
        fetchOptions();
    }, []);

    // Hàm lấy dữ liệu phòng (sử dụng filterRooms thống nhất)
    const fetchRooms = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1,
                pageSize: pagination.pageSize,
            };

            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter) params.status = statusFilter;
            if (boardingHouseFilter) params.boardingHouseId = boardingHouseFilter;
            if (areaRange[0] !== null) params.minArea = areaRange[0];
            if (areaRange[1] !== null) params.maxArea = areaRange[1];
            if (priceRange[0] !== null) params.minPrice = priceRange[0];
            if (priceRange[1] !== null) params.maxPrice = priceRange[1];
            if (hasActiveContractFilter !== null) {
                params.hasActiveContract = hasActiveContractFilter === 'YES';
            }
            if (debouncedSearch) {
                const phoneRegex = /^[\d\s\-+()]{9,15}$/;
                if (phoneRegex.test(debouncedSearch)) {
                    // Có thể gửi thêm param phone riêng nếu backend hỗ trợ
                    // params.phone = debouncedSearch.replace(/\D/g, ''); // loại bỏ ký tự không phải số
                    // Hoặc giữ nguyên search như hiện tại
                }
                params.search = debouncedSearch;
            }

            const response = await filterRooms(params);

            if (response && Array.isArray(response.content)) {
                setRoomSource(response.content);
                setPaginationTotal(response.totalElements || 0);
            } else {
                setRoomSource([]);
                setPaginationTotal(0);
            }
        } catch (error) {
            message.error('Lỗi tải danh sách phòng');
            setRoomSource([]);
            setPaginationTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // Reset tất cả filter
    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter(null);
        setBoardingHouseFilter(null);
        setAreaRange([null, null]);
        setPriceRange([null, null]);
        setHasActiveContractFilter(null);
        resetPagination();
        message.success('Đã reset bộ lọc!');
    };

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

            setUtilityOption(utilitiesResponse.map((u) => ({label: u.name, value: u.id})));
            setBuildingOption(buildingsResponse.map((b) => ({label: b.name, value: b.id})));

            form.setFieldsValue({utilityIds: [], buildingId: null});
        } catch (error) {
            message.error('Không thể tải tiện ích và tòa nhà cho khu này');
            setUtilityOption([]);
            setBuildingOption([]);
        } finally {
            setLoading(false);
        }
    };

    // Tự động gọi API khi filter thay đổi
    useEffect(() => {
        if (pagination.current !== 1) {
            resetPagination();
            return;
        }
        fetchRooms();
    }, [
        debouncedSearch,
        statusFilter,
        boardingHouseFilter,
        areaRange,
        priceRange,
        hasActiveContractFilter,
        pagination.current,
        pagination.pageSize,
        resetPagination,
    ]);

    // Xử lý thêm phòng
    const handleAddRoom = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số phòng theo gói. Vui lòng nâng cấp!');
            return;
        }
        setModalMode('create');
        setSelectedRoom(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateRoom = async (values) => {
        try {
            await createRoom(values);
            invalidateQuota();
            fetchRooms();
            setIsModalOpen(false);
            message.success('Thêm phòng thành công!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi tạo phòng');
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

    const handleCallUpdateRoom = async (values) => {
        try {
            await updateRoom(selectedRoom.id, values);
            fetchRooms();
            setIsModalOpen(false);
            message.success('Cập nhật phòng thành công!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật phòng');
        }
    };

    const handleDeleteRoom = (record) => {
        setModalMode('delete');
        setSelectedRoom(record);
        setIsModalOpen(true);
    };

    const handleCallDeleteRoom = async () => {
        try {
            await deleteRoom(selectedRoom.id);
            invalidateQuota();
            fetchRooms();
            setIsModalOpen(false);
            message.success('Xóa phòng thành công!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi xóa phòng');
        }
    };

    const handleFormSubmit = (values) => {
        if (modalMode === 'create') {
            handleCallCreateRoom(values);
        } else if (modalMode === 'edit') {
            handleCallUpdateRoom(values);
        } else if (modalMode === 'delete') {
            handleCallDeleteRoom();
        }
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm phòng mới';
            case 'edit':
                return 'Chỉnh sửa phòng';
            case 'delete':
                return 'Xóa phòng';
            default:
                return 'Chi tiết phòng';
        }
    };

    // Columns cho bảng
    const columns = [
        {
            title: 'Số phòng',
            dataIndex: 'roomNumber',
            key: 'roomNumber',
            width: 120,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Diện tích (m²)',
            dataIndex: 'area',
            key: 'area',
            width: 120,
            align: 'center',
        },
        {
            title: 'Khu nhà trọ',
            dataIndex: 'boardingHouseName',
            key: 'boardingHouseName',
            width: 220,
            align: 'center',
        },
        {
            title: 'Giá thuê',
            dataIndex: 'price',
            key: 'price',
            width: 140,
            align: 'center',
            render: (price) => price ? `${price.toLocaleString('vi-VN')} ₫` : 'Chưa xác định',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            align: 'center',
            render: (status) => {
                const map = {
                    AVAILABLE: {color: 'success', text: 'Trống'},
                    OCCUPIED: {color: 'warning', text: 'Đã thuê'},
                    MAINTENANCE: {color: 'error', text: 'Bảo trì'},
                };
                const info = map[status] || {color: 'default', text: status || 'N/A'};
                return <Tag color={info.color}>{info.text}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
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
                        style={{marginLeft: 8}}
                    />
                </>
            ),
        },
    ];

    // Fields cho modal (giữ nguyên logic cũ của bạn, chỉ ví dụ)
    const roomModalFields = [
        {
            label: 'Khu nhà',
            name: modalMode === 'edit' ? 'boardingHouseName' : 'boardingHouseId',
            type: modalMode === 'edit' ? 'text' : 'select',
            options: boardingHouseOption,
            disabled: modalMode === 'edit',
            onChange: modalMode === 'create' ? handleBoardingHouseChange : undefined,
            rules: modalMode === 'create' ? [{required: true, message: 'Chọn khu nhà!'}] : [],
        },
        {
            label: 'Tòa nhà',
            name: modalMode === 'edit' ? 'buildingName' : 'buildingId',
            type: modalMode === 'edit' ? 'text' : 'select',
            options: buildingOption,
            disabled: modalMode === 'edit',
            rules: modalMode === 'create' ? [{required: true, message: 'Chọn tòa nhà!'}] : [],
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
            label: 'Điều hòa',
            name: 'hasAirConditioner',
            type: 'checkbox',
        },
        {
            label: 'Phòng tắm riêng',
            name: 'hasBathroom',
            type: 'checkbox',
        },
        {
            label: 'Bếp',
            name: 'hasKitchen',
            type: 'checkbox',
        },
    ];

    return (
        <ConfigProvider>
            <div className={cx('room-wrapper')}>
                {/* Bộ lọc */}
                <FilterComponent
                    fields={[
                        {
                            type: 'search',
                            name: 'search',
                            placeholder: 'Tìm số phòng, tên khu, địa chỉ, hoặc SĐT người thuê...',
                            value: searchTerm,
                            onChange: setSearchTerm,
                            tooltip: 'Có thể nhập số điện thoại để tìm phòng đang thuê bởi người đó (ví dụ: 0912345678)',
                        },
                        {
                            type: 'select',
                            name: 'status',
                            placeholder: 'Trạng thái phòng',
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: statusOptions,
                            allowClear: true,
                        },
                        {
                            type: 'select',
                            name: 'boardingHouseId',
                            placeholder: 'Khu nhà trọ',
                            value: boardingHouseFilter,
                            onChange: setBoardingHouseFilter,
                            options: boardingHouseOptions,
                            allowClear: true,
                        },
                        {
                            type: 'rangeInput',
                            name: 'areaRange',
                            label: 'Diện tích (m²)',
                            minPlaceholder: 'Từ',
                            maxPlaceholder: 'Đến',
                            value: areaRange,
                            onChange: setAreaRange,
                        },
                        {
                            type: 'rangeInput',
                            name: 'priceRange',
                            label: 'Giá thuê (₫)',
                            minPlaceholder: 'Từ',
                            maxPlaceholder: 'Đến',
                            value: priceRange,
                            onChange: setPriceRange,
                        },
                        {
                            type: 'select',
                            name: 'hasActiveContract',
                            placeholder: 'Có hợp đồng hiệu lực',
                            value: hasActiveContractFilter,
                            onChange: setHasActiveContractFilter,
                            options: [
                                {value: 'YES', label: 'Có'},
                                {value: 'NO', label: 'Không'},
                            ],
                            allowClear: true,
                        },
                    ]}
                    onReset={handleResetFilters}
                    gridTemplate="repeat(6, minmax(180px, 1fr)) 100px"
                />

                {/* Actions */}
                <div className={cx('sub_header')}>
                    <div className={cx('features')}>
                        <Segmented
                            value={viewMode}
                            onChange={setViewMode}
                            options={[
                                {label: (<><TableOutlined/> Bảng</>), value: 'table'},
                                {label: (<><AppstoreOutlined/> Thẻ</>), value: 'card'},
                            ]}
                        />
                        <SmartButton
                            title={addButtonText}
                            icon={<PlusOutlined/>}
                            type="primary"
                            onClick={handleAddRoom}
                            disabled={isAddDisabled}
                            tooltip={isAddDisabled ? 'Đạt giới hạn phòng – nâng cấp gói' : undefined}
                        />
                        <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                    </div>
                    <AppPagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={handlePaginationChange}
                        pageSizeOptions={['6', '12', '24', '48']}
                        showTotal={(total, range) => `Đang xem ${range[0]}-${range[1]} trong ${total} phòng`}
                    />
                </div>

                {/* Nội dung */}
                <div className={cx('room-container')}>
                    <Spin spinning={loading}>
                        {viewMode === 'table' ? (
                            <SmartTable
                                columns={columns}
                                dataSources={roomSource}
                                loading={loading}
                                pagination={false}
                            />
                        ) : (
                            <>
                                {roomSource.length === 0 ? (
                                    <Empty description="Không tìm thấy phòng nào phù hợp"/>
                                ) : (
                                    <Row gutter={[16, 16]}>
                                        {roomSource.map(room => (
                                            <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
                                                <RoomCard
                                                    room={room}
                                                    onEdit={() => handleEditRoom(room)}
                                                    onDelete={() => handleDeleteRoom(room)}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </>
                        )}
                    </Spin>

                </div>

                {/* Modal */}
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
        </ConfigProvider>
    );
}

export default Room;
