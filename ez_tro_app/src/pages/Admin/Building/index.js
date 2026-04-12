import React, {useMemo} from 'react';
import classNames from 'classnames/bind';
import {Col, Row, Segmented} from 'antd';
import {
    AppstoreOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    EditOutlined,
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
    TableOutlined,
} from '@ant-design/icons';
import styles from '~/pages/Admin/Building/Building.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import BuildingCard from '~/components/Layout/AdminLayout/components/BuildingCard';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import {useBuildingPage} from '~/pages/Admin/Building/useBuildingPage';

const cx = classNames.bind(styles);

function Building() {
    const {
        boardingHouseOptions,
        boardingHouseLoading,
        loading,
        saving,
        deleting,
        pagination,
        total,
        viewMode,
        modal,
        searchText,
        setSearchText,
        filteredBuildings,
        isAddDisabled,
        addButtonText,
        form,
        getModalTitle,
        handleOpenCreate,
        handleOpenEdit,
        handleOpenDelete,
        handleCloseModal,
        submitModal,
        handleTableChange,
        handlePaginationChange,
        changeViewMode,
    } = useBuildingPage();

    const columns = useMemo(() => [
        {
            title: 'Tên toà nhà',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            align: 'center',
        },
        {
            title: 'Tên khu nhà trọ',
            dataIndex: 'boardingHouseName',
            key: 'boardingHouseName',
            align: 'center',
            width: 250,
        },
        {
            title: 'Số tầng',
            dataIndex: 'totalFloors',
            key: 'totalFloors',
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
                        onClick={() => handleOpenEdit(record)}
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
    ], [handleOpenDelete, handleOpenEdit]);

    const buildingModalFields = useMemo(() => [
        {
            label: 'Tên tòa nhà',
            name: 'name',
            type: 'text',
            rules: [{required: true, message: 'Tên tòa nhà là bắt buộc!'}],
        },
        {
            label: 'Khu nhà trọ',
            name: 'boardingHouseId',
            type: 'select',
            options: boardingHouseOptions,
            disabled: boardingHouseLoading,
        },
        {
            label: 'Số tầng',
            name: 'totalFloors',
            type: 'number',
        },
        {
            label: 'Mô tả',
            name: 'description',
            type: 'textarea',
        },
    ], [boardingHouseLoading, boardingHouseOptions]);

    return (
        <div className={cx('building-wrapper')}>
            <div className={cx('sub_header')}>
                <SmartInput
                    size="large"
                    placeholder="Tìm kiếm tòa nhà"
                    icon={<SearchOutlined/>}
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />
                <div className={cx('features')}>
                    <Segmented
                        value={viewMode}
                        onChange={changeViewMode}
                        options={[
                            {label: 'Bảng', value: 'table', icon: <TableOutlined/>},
                            {label: 'Thẻ', value: 'card', icon: <AppstoreOutlined/>},
                        ]}
                        className={cx('view-toggle')}
                    />

                    <SmartButton
                        title={addButtonText}
                        icon={<PlusOutlined/>}
                        type="primary"
                        onClick={handleOpenCreate}
                        disabled={isAddDisabled}
                        tooltip={isAddDisabled ? 'Đã đạt giới hạn – nâng cấp gói để thêm' : undefined}
                    />

                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                    <AppPagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={total}
                        pageSizeOptions={['6', '12', '24']}
                        onChange={handlePaginationChange}
                        showTotal={(count, range) => `Đang xem ${range[0]}-${range[1]} trong ${count} tòa nhà`}
                    />
                </div>
            </div>

            <div className={cx('building-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={filteredBuildings}
                        loading={loading}
                        pagination={false}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                        {filteredBuildings.map((building) => (
                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={building.id}>
                                <BuildingCard
                                    building={building}
                                    onView={() => handleOpenEdit(building)}
                                    onEdit={() => handleOpenEdit(building)}
                                    onDelete={() => handleOpenDelete(building)}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            <PopupModal
                isModalOpen={modal.open}
                setIsModalOpen={handleCloseModal}
                title={getModalTitle()}
                fields={modal.mode === 'delete' ? [] : buildingModalFields}
                onSubmit={submitModal}
                initialValues={modal.selected}
                isDeleteMode={modal.mode === 'delete'}
                formInstance={form}
                submitLabel={saving ? 'Đang lưu...' : 'Xác nhận'}
                deleteConfirmLabel={deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            />
        </div>
    );
}

export default Building;
