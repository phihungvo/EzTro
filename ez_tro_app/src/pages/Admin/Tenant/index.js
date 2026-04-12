import React, {useMemo} from 'react';
import classNames from 'classnames/bind';
import {AppstoreOutlined, CloudUploadOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, TableOutlined} from '@ant-design/icons';
import {Card, Col, ConfigProvider, Empty, Row, Segmented, Space, Spin, message} from 'antd';
import styles from '~/pages/Admin/Tenant/Tenant.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import FilterComponent from '~/components/Layout/AdminLayout/components/FilterComponent';
import {useTenantPage} from '~/pages/Admin/Tenant/useTenantPage';

const cx = classNames.bind(styles);

function Tenant() {
    const {
        items,
        loading,
        deleting,
        pagination,
        total,
        viewMode,
        modal,
        searchTerm,
        dateRange,
        genderFilter,
        occupationFilter,
        hasActiveContractFilter,
        GENDER_OPTIONS,
        OCCUPATION_OPTIONS,
        addButtonText,
        isAddDisabled,
        getGenderTag,
        handleResetFilters,
        handleAddTenant,
        handleViewTenant,
        handleEditTenant,
        handleOpenDelete,
        handleCloseModal,
        submitDelete,
        handleTableChange,
        handleViewModeChange,
        setSearchTerm,
        setDateRange,
        setGenderFilter,
        setOccupationFilter,
        setHasActiveContractFilter,
    } = useTenantPage();

    const columns = useMemo(() => [
        {
            title: 'Họ tên người thuê',
            dataIndex: 'fullName',
            key: 'fullName',
            width: 200,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 150,
            align: 'center',
        },
        {
            title: 'SĐT',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 150,
            align: 'center',
        },
        {
            title: 'Số căn cước',
            dataIndex: 'identityNumber',
            key: 'identityNumber',
            align: 'center',
            width: 150,
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            width: 150,
            align: 'center',
            render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: 150,
            align: 'center',
            render: (gender) => getGenderTag(gender),
        },
        {
            title: 'Nghề nghiệp',
            dataIndex: 'occupation',
            key: 'occupation',
            width: 150,
            align: 'center',
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: 150,
            align: 'center',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            width: 200,
            render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
        },
        {
            title: 'Thao tác',
            fixed: 'right',
            width: 200,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <SmartButton
                        type="default"
                        icon={<EyeOutlined />}
                        buttonWidth={50}
                        onClick={() => handleViewTenant(record)}
                    />
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined />}
                        buttonWidth={50}
                        onClick={() => handleEditTenant(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={50}
                        onClick={() => handleOpenDelete(record)}
                    />
                </Space>
            ),
        },
    ], [getGenderTag, handleEditTenant, handleOpenDelete, handleViewTenant]);

    return (
        <ConfigProvider>
            <div className={cx('tenant-wrapper')}>
                <FilterComponent
                    fields={[
                        {
                            type: 'search',
                            name: 'search',
                            placeholder: 'Tìm kiếm theo tên, email, SĐT...',
                            value: searchTerm,
                            onChange: setSearchTerm,
                        },
                        {
                            type: 'dateRange',
                            name: 'dateRange',
                            placeholder: ['Từ ngày sinh', 'Đến ngày sinh'],
                            value: dateRange,
                            onChange: setDateRange,
                        },
                        {
                            type: 'select',
                            name: 'gender',
                            placeholder: 'Chọn giới tính',
                            value: genderFilter,
                            onChange: setGenderFilter,
                            options: GENDER_OPTIONS,
                            allowClear: true,
                        },
                        {
                            type: 'select',
                            name: 'occupation',
                            placeholder: 'Chọn nghề nghiệp',
                            value: occupationFilter,
                            onChange: setOccupationFilter,
                            options: OCCUPATION_OPTIONS,
                            allowClear: true,
                        },
                        {
                            type: 'select',
                            name: 'hasActiveContract',
                            placeholder: 'Chọn trạng thái hợp đồng',
                            value: hasActiveContractFilter,
                            onChange: setHasActiveContractFilter,
                            options: [
                                {value: 'YES', label: 'Có hợp đồng hiệu lực'},
                                {value: 'NO', label: 'Không có hợp đồng hiệu lực'},
                            ],
                            allowClear: true,
                        },
                    ]}
                    onReset={handleResetFilters}
                    gridTemplate="230px 200px 1fr 1fr 1fr auto"
                />

                <div className={cx('tenant-container')}>
                    <div className={cx('pagination-wrapper')}>
                        <div className={cx('left-actions')}>
                            <div className={cx('view-mode-toggle')}>
                                <Segmented
                                    options={[
                                        {label: (<><TableOutlined /> Bảng</>), value: 'table'},
                                        {label: (<><AppstoreOutlined /> Thẻ</>), value: 'card'},
                                    ]}
                                    value={viewMode}
                                    onChange={handleViewModeChange}
                                />
                            </div>
                            <SmartButton
                                title={addButtonText}
                                icon={<PlusOutlined/>}
                                type="primary"
                                onClick={handleAddTenant}
                                disabled={isAddDisabled}
                                tooltip={isAddDisabled ? 'Đã đạt giới hạn người thuê – nâng cấp gói để thêm' : undefined}
                            />
                            <SmartButton
                                title="Excel"
                                icon={<CloudUploadOutlined />}
                                onClick={() => message.info('Tính năng xuất Excel đang phát triển')}
                            />
                        </div>
                        <AppPagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={total}
                            onChange={handleTableChange}
                            showTotal={(count, range) => `Đang xem ${range[0]}-${range[1]} trong ${count} người thuê`}
                            pageSizeOptions={['10', '20', '30']}
                        />
                    </div>

                    <Spin spinning={loading}>
                        {viewMode === 'table' ? (
                            <SmartTable
                                columns={columns}
                                dataSources={items}
                                loading={loading}
                                pagination={false}
                                onTableChange={handleTableChange}
                            />
                        ) : (
                            <>
                                {items.length === 0 ? (
                                    <Empty description="Không có người thuê nào phù hợp với bộ lọc" />
                                ) : (
                                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                                        {items.map((tenant) => (
                                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={tenant.id}>
                                                <Card
                                                    title={tenant.fullName}
                                                    extra={(
                                                        <Space>
                                                            <SmartButton
                                                                type="primary"
                                                                icon={<EditOutlined />}
                                                                onClick={() => handleEditTenant(tenant)}
                                                            />
                                                            <SmartButton
                                                                type="danger"
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => handleOpenDelete(tenant)}
                                                            />
                                                        </Space>
                                                    )}
                                                >
                                                    <p><strong>Email:</strong> {tenant.email}</p>
                                                    <p><strong>SĐT:</strong> {tenant.phoneNumber}</p>
                                                    <p><strong>CCCD:</strong> {tenant.identityNumber}</p>
                                                    <p><strong>Giới tính:</strong> {getGenderTag(tenant.gender)}</p>
                                                    <p><strong>Nghề nghiệp:</strong> {tenant.occupation}</p>
                                                </Card>
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
                    title="Xóa người thuê"
                    fields={[]}
                    onSubmit={submitDelete}
                    initialValues={modal.selected}
                    isDeleteMode
                    deleteConfirmLabel={deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                    deleteMessage={(
                        <>
                            <p>
                                Bạn có chắc chắn muốn xóa người thuê <b>{modal.selected?.fullName}</b>?
                            </p>
                            <p>Hành động này sẽ xóa dữ liệu người thuê khỏi hệ thống.</p>
                        </>
                    )}
                />
            </div>
        </ConfigProvider>
    );
}

export default Tenant;
