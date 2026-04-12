import React, {useMemo} from 'react';
import classNames from 'classnames/bind';
import {Col, ConfigProvider, Empty, Row, Segmented, Spin} from 'antd';
import {message} from 'antd';
import {
    AppstoreOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    TableOutlined,
} from '@ant-design/icons';
import styles from '~/pages/Admin/BoardingHouse/BoardingHouse.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import BoardingHousesCard from '~/components/Layout/AdminLayout/components/BoardingHousesCard';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import {useBoardingHousePage} from '~/pages/Admin/BoardingHouse/useBoardingHousePage';

const cx = classNames.bind(styles);

function BoardingHouses() {
    const {
        loading,
        deleting,
        pagination,
        total,
        viewMode,
        searchTerm,
        modal,
        filteredBoardingHouses,
        isAddDisabled,
        addButtonText,
        handleAddBoardingHouse,
        handleEditBoardingHouse,
        handleOpenDelete,
        handleCloseModal,
        submitDelete,
        handlePaginationChange,
        handleTableChange,
        changeViewMode,
        changeSearchTerm,
    } = useBoardingHousePage();

    const columns = useMemo(() => [
        {
            title: 'Tên khu trọ',
            dataIndex: 'name',
            key: 'name',
            width: 220,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: 260,
            align: 'center',
        },
        {
            title: 'SĐT liên hệ',
            dataIndex: 'contactPhone',
            key: 'contactPhone',
            width: 170,
            align: 'center',
        },
        {
            title: 'Số tòa nhà',
            dataIndex: 'totalBuildings',
            key: 'totalBuildings',
            width: 140,
            align: 'center',
        },
        {
            title: 'Số phòng',
            dataIndex: 'totalRooms',
            key: 'totalRooms',
            width: 140,
            align: 'center',
        },
        {
            title: 'Chủ sở hữu',
            dataIndex: 'ownerName',
            key: 'ownerName',
            width: 180,
            align: 'center',
            render: (value) => value || 'Chưa xác định',
        },
        {
            title: 'Email chủ sở hữu',
            dataIndex: 'ownerEmail',
            key: 'ownerEmail',
            width: 220,
            align: 'center',
            render: (value) => value || 'Chưa có',
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
                        onClick={() => handleEditBoardingHouse(record)}
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
    ], [handleEditBoardingHouse, handleOpenDelete]);

    return (
        <ConfigProvider>
            <div className={cx('boardingHouses-wrapper')}>
                <div className={cx('sub_header')}>
                    <SmartInput
                        size="large"
                        placeholder="Tìm theo tên khu trọ, địa chỉ, SĐT hoặc chủ sở hữu"
                        icon={<SearchOutlined/>}
                        value={searchTerm}
                        onChange={(event) => changeSearchTerm(event?.target?.value || '')}
                    />

                    <div className={cx('features')}>
                        <Segmented
                            value={viewMode}
                            onChange={changeViewMode}
                            options={[
                                {label: (<><TableOutlined/> Bảng</>), value: 'table'},
                                {label: (<><AppstoreOutlined/> Thẻ</>), value: 'card'},
                            ]}
                        />
                        <SmartButton
                            title={addButtonText}
                            icon={<PlusOutlined/>}
                            type="primary"
                            onClick={handleAddBoardingHouse}
                            disabled={isAddDisabled}
                            tooltip={isAddDisabled ? 'Đã đạt giới hạn khu trọ, cần nâng cấp gói để thêm mới' : undefined}
                        />
                        <SmartButton
                            title="Excel"
                            icon={<CloudUploadOutlined/>}
                            onClick={() => message.info('Tính năng xuất Excel đang được hoàn thiện')}
                        />
                    </div>
                </div>

                <div className={cx('boardingHouses-container')}>
                    <Spin spinning={loading}>
                        {viewMode === 'table' ? (
                            <SmartTable
                                columns={columns}
                                dataSources={filteredBoardingHouses}
                                loading={loading}
                                pagination={false}
                                onTableChange={handleTableChange}
                            />
                        ) : (
                            <>
                                {filteredBoardingHouses.length === 0 ? (
                                    <Empty
                                        description="Không có khu trọ nào"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ) : (
                                    <Row gutter={[16, 16]}>
                                        {filteredBoardingHouses.map((boardingHouse) => (
                                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={boardingHouse.id}>
                                                <BoardingHousesCard
                                                    boardingHouse={boardingHouse}
                                                    onView={() => handleEditBoardingHouse(boardingHouse)}
                                                    onEdit={() => handleEditBoardingHouse(boardingHouse)}
                                                    onDelete={() => handleOpenDelete(boardingHouse)}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </>
                        )}
                    </Spin>
                </div>

                <div className={cx('pagination-wrapper')}>
                    <AppPagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={total}
                        onChange={handlePaginationChange}
                    />
                </div>

                <PopupModal
                    isModalOpen={modal.open}
                    setIsModalOpen={handleCloseModal}
                    title="Xóa khu trọ"
                    fields={[]}
                    onSubmit={submitDelete}
                    initialValues={modal.selected}
                    isDeleteMode
                    deleteConfirmLabel={deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                    deleteMessage={
                        modal.selected ? (
                            <>
                                <p>
                                    Bạn có chắc chắn muốn xóa{' '}
                                    <b>
                                        <i>{modal.selected.name}</i>
                                    </b>{' '}
                                    ?
                                </p>
                                <p>Hành động này không thể hoàn tác.</p>
                            </>
                        ) : null
                    }
                />
            </div>
        </ConfigProvider>
    );
}

export default BoardingHouses;
