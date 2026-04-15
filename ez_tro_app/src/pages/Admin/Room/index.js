import React, {useMemo} from 'react';
import classNames from 'classnames/bind';
import {Col, ConfigProvider, Empty, Row, Segmented, Spin, Tag} from 'antd';
import {
    AppstoreOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    TableOutlined,
} from '@ant-design/icons';
import styles from '~/pages/Admin/Room/Room.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import RoomCard from '~/components/Layout/AdminLayout/components/RoomCard';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import {useRoomPage} from '~/pages/Admin/Room/useRoomPage';

const cx = classNames.bind(styles);

function Room() {
    const {
        items,
        boardingHouseOptions,
        boardingHouseLoading,
        loading,
        deleting,
        pagination,
        total,
        viewMode,
        modal,
        searchTerm,
        statusFilter,
        boardingHouseFilter,
        areaRange,
        priceRange,
        hasActiveContractFilter,
        STATUS_OPTIONS,
        addButtonText,
        isAddDisabled,
        handleResetFilters,
        handleAddRoom,
        handleEditRoom,
        handleOpenDelete,
        handleCloseModal,
        submitDelete,
        handlePaginationChange,
        handleViewModeChange,
        setSearchTerm,
        setStatusFilter,
        setBoardingHouseFilter,
        setAreaRange,
        setPriceRange,
        setHasActiveContractFilter,
    } = useRoomPage();

    const columns = useMemo(() => [
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
                        onClick={() => handleOpenDelete(record)}
                        style={{marginLeft: 8}}
                    />
                </>
            ),
        },
    ], [handleEditRoom, handleOpenDelete]);

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
                            options: STATUS_OPTIONS,
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
                            loading: boardingHouseLoading,
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
                            onChange={handleViewModeChange}
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
                        total={total}
                        onChange={handlePaginationChange}
                        pageSizeOptions={['6', '12', '24', '48']}
                        showTotal={(count, range) => `Đang xem ${range[0]}-${range[1]} trong ${count} phòng`}
                    />
                </div>

                <div className={cx('room-container')}>
                    <Spin spinning={loading}>
                        {viewMode === 'table' ? (
                            <SmartTable
                                columns={columns}
                                dataSources={items}
                                loading={loading}
                                pagination={false}
                            />
                        ) : (
                            <>
                                {items.length === 0 ? (
                                    <Empty description="Không tìm thấy phòng nào phù hợp"/>
                                ) : (
                                    <Row gutter={[16, 16]}>
                                        {items.map((room) => (
                                            <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
                                                <RoomCard
                                                    room={room}
                                                    onView={() => handleEditRoom(room)}
                                                    onEdit={() => handleEditRoom(room)}
                                                    onDelete={() => handleOpenDelete(room)}
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
                    isModalOpen={modal.open}
                    setIsModalOpen={handleCloseModal}
                    title="Xóa phòng"
                    onSubmit={submitDelete}
                    initialValues={modal.selected}
                    isDeleteMode
                    deleteConfirmLabel={deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                    deleteMessage={(
                        <>
                            <p>
                                Bạn có chắc chắn muốn xóa phòng <b>{modal.selected?.roomNumber}</b>?
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
