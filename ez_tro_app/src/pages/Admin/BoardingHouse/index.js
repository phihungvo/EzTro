import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/BoardingHouse/BoardingHouse.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import BoardingHousesCard from '~/components/Layout/AdminLayout/components/BoardingHousesCard';
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
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import {Form, message, Row, Col, Segmented} from 'antd';
import {exportExcelFile} from '~/service/admin/export_service';
import {
    getAllBoardingHouses,
    createBoardingHouse,
    updateBoardingHouse,
    deleteBoardingHouse,
} from '~/service/admin/boarding_house';
import {getAllOwners} from '~/service/admin/user';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {useAuth} from "~/routes/AuthContext";
import usePagination from '~/hooks/usePagination';

const cx = classNames.bind(styles);

function BoardingHouses() {
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [userOptionSource, setUserOptionSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const {
        pagination,
        handleChange: handlePaginationChange,
        setTotal: setPaginationTotal,
    } = usePagination({ initialPageSize: 10 });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBoardingHouses, setSelectedBoardingHouses] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();

    const { user } = useAuth();
    const isOwner = user?.isOwner || false;

    // Tính current/max cho boarding house
    const current = quota?.currentBoardingHouses ?? 0;
    const max = quota?.maxBoardingHouses ?? 0;
    const addButtonText = isOwner ? `Thêm (${current}/${max})` : 'Thêm';
    const isAddDisabled = isOwner && current >= max;

    const columns = [
        {
            title: 'Tên khu nhà',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            align: 'center',
            width: 250,
        },
        {
            title: 'SĐT liên hệ',
            dataIndex: 'contactPhone',
            key: 'contactPhone',
            align: 'center',
            width: 200,
        },
        {
            title: 'Số tòa nhà',
            dataIndex: 'totalBuildings',
            key: 'totalBuildings',
            width: 150,
            align: 'center',
        },
        {
            title: 'Số phòng',
            dataIndex: 'totalRooms',
            key: 'totalRooms',
            width: 150,
            align: 'center',
        },
        {
            title: 'Tên chủ nhà',
            dataIndex: 'ownerName',
            key: 'ownerName',
            width: 150,
            align: 'center',
        },
        {
            title: 'Email chủ nhà',
            dataIndex: 'ownerEmail',
            key: 'ownerEmail',
            width: 200,
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
                        onClick={() => handleEditBoardingHouses(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDeleteBoardingHouses(record)}
                        style={{marginLeft: '8px'}}
                    />
                </>
            ),
        },
    ];

    const boardingHousesModalFields = [
        {
            label: 'Tên khu nhà',
            name: 'name',
            type: 'text',
            rules: [{required: true, message: 'Tên khu nhà là bắt buộc!'}],
        },
        {
            label: 'Chủ nhà',
            name: 'ownerId',
            type: 'select',
            options: userOptionSource,
        },
        {
            label: 'Địa chỉ',
            name: 'address',
            type: 'text',
        },
        {
            label: 'SĐT liên hệ',
            name: 'contactPhone',
            type: 'text',
        },
        {
            label: 'Số tòa nhà',
            name: 'totalBuildings',
            type: 'number',
        },
        {
            label: 'Số phòng',
            name: 'totalRooms',
            type: 'number',
        },
        {
            label: 'Mô tả',
            name: 'description',
            type: 'textarea',
        },
    ];

    useEffect(() => {
        handleGetAllUsers();
    }, []);

    const handleGetAllUsers = async () => {
        try {
            const response = await getAllOwners();
            const mapped = response.map((usr) => ({
                value: usr.id,
                label: usr.fullName,
            }));
            setUserOptionSource(mapped);
        } catch (error) {
            console.error('Error fetching owners:', error);
            setUserOptionSource([]);
        }
    };

    const handleGetBoardingHouses = async (page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllBoardingHouses({page: page - 1, pageSize});
            if (response?.content) {
                setBoardingHouses(response.content);
                setPaginationTotal(response.totalElements || 0);
            } else {
                setBoardingHouses([]);
                setPaginationTotal(0);
                message.error('Dữ liệu khu nhà không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách khu nhà: ${error.response?.data?.message || error.message}`);
            setBoardingHouses([]);
            setPaginationTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetBoardingHouses();
    }, [pagination.current, pagination.pageSize]);

    const handleAddBoardingHouses = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số khu nhà trọ theo gói hiện tại. Vui lòng nâng cấp gói!');
            return;
        }
        setModalMode('create');
        setSelectedBoardingHouses(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateBoardingHouse = async (formData) => {
        try {
            await createBoardingHouse(formData);
            invalidateQuota();
            handleGetBoardingHouses();
            setIsModalOpen(false);
            message.success('Thêm khu nhà thành công!');
        } catch (error) {
            message.error(`Lỗi khi tạo khu nhà: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditBoardingHouses = (record) => {
        setSelectedBoardingHouses(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateBoardingHouse = async (formData) => {
        try {
            await updateBoardingHouse(selectedBoardingHouses.id, formData);
            handleGetBoardingHouses();
            setIsModalOpen(false);
            message.success('Cập nhật khu nhà thành công!');
        } catch (error) {
            message.error(`Lỗi khi cập nhật khu nhà: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteBoardingHouses = (record) => {
        setModalMode('delete');
        setSelectedBoardingHouses(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteBoardingHouse = async () => {
        try {
            await deleteBoardingHouse(selectedBoardingHouses.id);
            invalidateQuota();
            handleGetBoardingHouses();
            setIsModalOpen(false);
            message.success('Xóa khu nhà thành công!');
        } catch (error) {
            message.error(`Lỗi khi xóa khu nhà: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleExportFile = async () => {
        try {
            const response = await exportExcelFile('boarding_house');
            if (
                !response.headers['content-type'].includes(
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
            ) {
                throw new Error('Định dạng file không hợp lệ');
            }
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `boarding_house_${new Date().toISOString().replace(/[-:]/g, '')}.xlsx`
            );
            link.click();
            window.URL.revokeObjectURL(url);
            message.success('Tải file Excel thành công!');
        } catch (error) {
            console.error('Lỗi khi xuất file Excel:', error);
            message.error('Không thể tải file Excel');
        }
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateBoardingHouse(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateBoardingHouse(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteBoardingHouse();
        }
    };

    const handleTableChange = (newPagination) => {
        handlePaginationChange(newPagination.current, newPagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm khu nhà mới';
            case 'edit':
                return 'Chỉnh sửa khu nhà';
            case 'delete':
                return 'Xóa khu nhà';
            default:
                return 'Chi tiết khu nhà';
        }
    };

    return (
        <div className={cx('boardingHouses-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm khu nhà" icon={<SearchOutlined/>}/>
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

                    <SmartButton
                        title={addButtonText}
                        icon={<PlusOutlined/>}
                        type="primary"
                        onClick={handleAddBoardingHouses}
                        disabled={isAddDisabled}
                        tooltip={isAddDisabled ? 'Đã đạt giới hạn khu nhà trọ – nâng cấp gói để thêm' : undefined}
                    />

                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>} onClick={handleExportFile}/>
                    <AppPagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        pageSizeOptions={['6', '12', '24']}
                        onChange={handlePaginationChange}
                        showTotal={(total, range) => `Đang xem ${range[0]}-${range[1]} trong ${total} khu nhà`}
                    />
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('boardingHouses-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={boardingHouses}
                        loading={loading}
                        pagination={false}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                        {boardingHouses.map((boardingHouse) => (
                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={boardingHouse.id}>
                                <BoardingHousesCard
                                    boardingHouse={boardingHouse}
                                    // onView={() => handleViewBoardingHouses(boardingHouse)}
                                    onEdit={() => handleEditBoardingHouses(boardingHouse)}
                                    onDelete={() => handleDeleteBoardingHouses(boardingHouse)}
                                />
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
                fields={modalMode === 'delete' ? [] : boardingHousesModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedBoardingHouses}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default BoardingHouses;
