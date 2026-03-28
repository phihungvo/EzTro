import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames/bind';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    AppstoreOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    TableOutlined,
} from '@ant-design/icons';
import {Col, ConfigProvider, Empty, message, Row, Segmented, Spin, Tag} from 'antd';

import styles from '~/pages/Admin/Room/Room.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import RoomCard from '~/components/Layout/AdminLayout/components/RoomCard';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import {deleteRoom, filterRooms} from '~/service/admin/room';
import {getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {useAuth} from '~/routes/AuthContext';
import useDebounce from '~/hooks/useDebounce';
import usePagination from '~/hooks/usePagination';

const cx = classNames.bind(styles);

const resolveBasePath = (pathname) => pathname.startsWith('/admin') ? '/admin/rooms' : '/owner/rooms';

function Room() {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = resolveBasePath(location.pathname);

    const [roomSource, setRoomSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('card');
    const [boardingHouseOptions, setBoardingHouseOptions] = useState([]);

    const {
        pagination,
        handleChange: handlePaginationChange,
        reset: resetPagination,
        setTotal: setPaginationTotal,
    } = usePagination({initialPageSize: 10});
    const currentPage = pagination.current;
    const currentPageSize = pagination.pageSize;

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [statusFilter, setStatusFilter] = useState(null);
    const [boardingHouseFilter, setBoardingHouseFilter] = useState(null);
    const [areaRange, setAreaRange] = useState([null, null]);
    const [priceRange, setPriceRange] = useState([null, null]);
    const [hasActiveContractFilter, setHasActiveContractFilter] = useState(null);
    const filterFingerprint = useMemo(() => (
        [
            debouncedSearch || '',
            statusFilter || '',
            boardingHouseFilter || '',
            areaRange?.[0] ?? '',
            areaRange?.[1] ?? '',
            priceRange?.[0] ?? '',
            priceRange?.[1] ?? '',
            hasActiveContractFilter ?? '',
        ].join('|')
    ), [debouncedSearch, statusFilter, boardingHouseFilter, areaRange, priceRange, hasActiveContractFilter]);
    const lastFilterFingerprintRef = useRef(filterFingerprint);

    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();
    const {user} = useAuth();
    const isOwner = user?.isOwner || false;

    const currentRooms = quota?.currentRooms ?? 0;
    const maxRooms = quota?.maxRooms ?? 0;
    const addButtonText = isOwner ? `Thêm (${currentRooms}/${maxRooms})` : 'Thêm';
    const isAddDisabled = isOwner && maxRooms > 0 && currentRooms >= maxRooms;

    const statusOptions = [
        {value: 'AVAILABLE', label: 'Trống'},
        {value: 'OCCUPIED', label: 'Đã cho thuê'},
        {value: 'MAINTENANCE', label: 'Đang bảo trì'},
    ];

    useEffect(() => {
        const fetchBoardingHouses = async () => {
            try {
                const response = await getAllBoardingHousesNoPaged();
                const options = Array.isArray(response)
                    ? response.map((item) => ({value: item.id, label: item.name}))
                    : [];
                setBoardingHouseOptions(options);
            } catch (error) {
                console.error('Lỗi tải danh sách khu nhà:', error);
            }
        };

        fetchBoardingHouses();
    }, []);

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1,
                pageSize: currentPageSize,
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
    }, [
        areaRange,
        boardingHouseFilter,
        debouncedSearch,
        hasActiveContractFilter,
        currentPage,
        currentPageSize,
        priceRange,
        statusFilter,
        setPaginationTotal,
    ]);

    useEffect(() => {
        const filtersChanged = lastFilterFingerprintRef.current !== filterFingerprint;
        if (filtersChanged) {
            lastFilterFingerprintRef.current = filterFingerprint;
            if (currentPage !== 1) {
                resetPagination();
                return;
            }
        }

        fetchRooms();
    }, [filterFingerprint, currentPage, currentPageSize, fetchRooms, resetPagination]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter(null);
        setBoardingHouseFilter(null);
        setAreaRange([null, null]);
        setPriceRange([null, null]);
        setHasActiveContractFilter(null);
        resetPagination();
        message.success('Đã reset bộ lọc');
    };

    const handleAddRoom = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số phòng theo gói. Vui lòng nâng cấp gói để thêm mới.');
            return;
        }
        navigate(`${basePath}/create-room`);
    };

    const handleEditRoom = (record) => {
        navigate(`${basePath}/${record.id}/edit`);
    };

    const handleDeleteRoom = (record) => {
        setSelectedRoom(record);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRoom) return;
        try {
            await deleteRoom(selectedRoom.id);
            invalidateQuota();
            setIsDeleteModalOpen(false);
            setSelectedRoom(null);
            message.success('Xóa phòng thành công');
            fetchRooms();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không thể xóa phòng');
        }
    };

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
            render: (price) => price ? `${Number(price).toLocaleString('vi-VN')} ₫` : 'Chưa xác định',
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

    return (
        <ConfigProvider>
            <div className={cx('room-wrapper')}>
                <FilterComponent
                    fields={[
                        {
                            type: 'search',
                            name: 'search',
                            placeholder: 'Tìm số phòng, tên khu, địa chỉ hoặc SĐT người thuê...',
                            value: searchTerm,
                            onChange: setSearchTerm,
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
                            tooltip={isAddDisabled ? 'Đạt giới hạn phòng - nâng cấp gói để thêm mới' : undefined}
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
                                        {roomSource.map((room) => (
                                            <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
                                                <RoomCard
                                                    room={room}
                                                    onView={() => handleEditRoom(room)}
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

                <PopupModal
                    isModalOpen={isDeleteModalOpen}
                    setIsModalOpen={setIsDeleteModalOpen}
                    title="Xóa phòng"
                    onSubmit={handleConfirmDelete}
                    initialValues={selectedRoom}
                    isDeleteMode
                    deleteMessage={(
                        <>
                            <p>
                                Bạn có chắc chắn muốn xóa phòng <b>{selectedRoom?.roomNumber}</b>?
                            </p>
                            <p>Phòng có dữ liệu vận hành hoặc hợp đồng liên quan sẽ không được phép xóa.</p>
                        </>
                    )}
                />
            </div>
        </ConfigProvider>
    );
}

export default Room;
