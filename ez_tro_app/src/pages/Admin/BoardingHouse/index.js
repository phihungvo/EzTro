import React, {useCallback, useEffect, useMemo, useState} from 'react';
import classNames from 'classnames/bind';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    AppstoreOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    TableOutlined,
} from '@ant-design/icons';
import {Col, ConfigProvider, Empty, message, Row, Segmented, Spin} from 'antd';

import styles from '~/pages/Admin/BoardingHouse/BoardingHouse.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import BoardingHousesCard from '~/components/Layout/AdminLayout/components/BoardingHousesCard';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import {deleteBoardingHouse, getAllBoardingHouses} from '~/service/admin/boarding_house';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {useAuth} from '~/routes/AuthContext';
import usePagination from '~/hooks/usePagination';

const cx = classNames.bind(styles);

const resolveBasePath = (pathname) =>
    pathname.startsWith('/admin') ? '/admin/boarding-houses' : '/owner/boarding-houses';

function BoardingHouses() {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = resolveBasePath(location.pathname);

    const [boardingHouses, setBoardingHouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBoardingHouse, setSelectedBoardingHouse] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const {
        pagination,
        handleChange: handlePaginationChange,
        setTotal: setPaginationTotal,
    } = usePagination({initialPageSize: 10});
    const currentPage = pagination.current;
    const currentPageSize = pagination.pageSize;

    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();
    const {user} = useAuth();
    const isOwner = user?.isOwner || user?.role === 'OWNER';

    const current = quota?.currentBoardingHouses ?? 0;
    const max = quota?.maxBoardingHouses ?? 0;
    const addButtonText = isOwner ? `Thêm (${current}/${max})` : 'Thêm';
    const isAddDisabled = isOwner && max > 0 && current >= max;

    const fetchBoardingHouses = useCallback(async (page, pageSize) => {
        setLoading(true);
        try {
            const response = await getAllBoardingHouses({page: page - 1, pageSize});
            if (response?.content) {
                setBoardingHouses(response.content);
                setPaginationTotal(response.totalElements || 0);
                return;
            }

            setBoardingHouses([]);
            setPaginationTotal(0);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không thể tải danh sách khu trọ');
            setBoardingHouses([]);
            setPaginationTotal(0);
        } finally {
            setLoading(false);
        }
    }, [setPaginationTotal]);

    useEffect(() => {
        fetchBoardingHouses(currentPage, currentPageSize);
    }, [currentPage, currentPageSize, fetchBoardingHouses]);

    const filteredBoardingHouses = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return boardingHouses;

        return boardingHouses.filter((item) => [
            item.name,
            item.address,
            item.contactPhone,
            item.ownerName,
            item.ownerEmail,
        ].some((value) => String(value || '').toLowerCase().includes(keyword)));
    }, [boardingHouses, searchTerm]);

    const handleAddBoardingHouse = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số khu trọ theo gói hiện tại. Vui lòng nâng cấp gói.');
            return;
        }

        navigate(`${basePath}/create`);
    };

    const handleEditBoardingHouse = (record) => {
        navigate(`${basePath}/${record.id}/edit`);
    };

    const handleDeleteBoardingHouse = (record) => {
        setSelectedBoardingHouse(record);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedBoardingHouse) return;

        try {
            await deleteBoardingHouse(selectedBoardingHouse.id);
            invalidateQuota();
            setIsDeleteModalOpen(false);
            setSelectedBoardingHouse(null);
            message.success('Xóa khu trọ thành công');
            fetchBoardingHouses(currentPage, currentPageSize);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không thể xóa khu trọ');
        }
    };

    const columns = [
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
                        onClick={() => handleDeleteBoardingHouse(record)}
                        style={{marginLeft: 8}}
                    />
                </>
            ),
        },
    ];

    return (
        <ConfigProvider>
            <div className={cx('boardingHouses-wrapper')}>
                <div className={cx('sub_header')}>
                    <SmartInput
                        size="large"
                        placeholder="Tìm theo tên khu trọ, địa chỉ, SĐT hoặc chủ sở hữu"
                        icon={<SearchOutlined/>}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event?.target?.value || '')}
                    />

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
                            />
                        ) : (
                            <>
                                {filteredBoardingHouses.length === 0 ? (
                                    <Empty description="Không tìm thấy khu trọ phù hợp"/>
                                ) : (
                                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                                        {filteredBoardingHouses.map((boardingHouse) => (
                                            <Col xs={24} sm={12} md={12} lg={8} xl={6} key={boardingHouse.id}>
                                                <BoardingHousesCard
                                                    boardingHouse={boardingHouse}
                                                    onView={() => handleEditBoardingHouse(boardingHouse)}
                                                    onEdit={() => handleEditBoardingHouse(boardingHouse)}
                                                    onDelete={() => handleDeleteBoardingHouse(boardingHouse)}
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
                        total={pagination.total}
                        pageSizeOptions={['6', '12', '24']}
                        onChange={handlePaginationChange}
                        showTotal={(total, range) => `Đang xem ${range[0]}-${range[1]} trong ${total} khu trọ`}
                    />
                </div>

                <PopupModal
                    isModalOpen={isDeleteModalOpen}
                    setIsModalOpen={setIsDeleteModalOpen}
                    title="Xóa khu trọ"
                    onSubmit={handleConfirmDelete}
                    initialValues={selectedBoardingHouse}
                    isDeleteMode
                    deleteMessage={(
                        <>
                            <p>
                                Bạn có chắc muốn xóa khu trọ <b>{selectedBoardingHouse?.name}</b>?
                            </p>
                            <p>Khu trọ đã có tòa nhà, phòng hoặc dữ liệu vận hành sẽ không được phép xóa.</p>
                        </>
                    )}
                />
            </div>
        </ConfigProvider>
    );
}

export default BoardingHouses;
