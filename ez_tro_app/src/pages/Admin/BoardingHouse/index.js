import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/BoardingHouse/BoardingHouse.module.scss';
import SmartTable from '~/components/Layout/components/SmartTable';
import BoardingHousesCard from 'src/components/Layout/components/BoardingHousesCard';
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
import SmartInput from '~/components/Layout/components/SmartInput';
import SmartButton from '~/components/Layout/components/SmartButton';
import PopupModal from '~/components/Layout/components/PopupModal';
import { Form, message, Row, Col, Pagination, Segmented } from 'antd';
import { getAllBoardingHouses } from '~/service/admin/boarding_house';

const cx = classNames.bind(styles);

function BoardingHouses() {
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBoardingHouses, setSelectedBoardingHouses] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

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
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            align: 'center',
        },
        {
            title: 'Tên nhà trọ',
            dataIndex: 'address',
            key: 'address',
            align: 'center',
            width: 250,
        },
        {
            title: 'Số phòng',
            dataIndex: 'totalRooms',
            key: 'totalRooms',
            width: 150,
            align: 'center',
        },
        {
            title: 'Số phòng',
            dataIndex: 'ownerName',
            key: 'ownerName',
            width: 150,
            align: 'center',
        },
        {
            title: 'Số phòng',
            dataIndex: 'ownerEmail',
            key: 'ownerEmail',
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
                        icon={<EditOutlined />}
                        buttonWidth={40}
                        onClick={() => handleEditBoardingHouses(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={40}
                        onClick={() => handleDeleteBoardingHouses(record)}
                        style={{ marginLeft: '8px' }}
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
            rules: [{ required: true, message: 'Tên khu nhà là bắt buộc!' }],
        },
        {
            label: 'Mô tả',
            name: 'description',
            type: 'text',
        },
        {
            label: 'Số tầng',
            name: 'totalFloors',
            type: 'number',
        },
    ];

    useEffect(() => {
        handleGetBoardingHouses();
    }, []);

    const handleGetBoardingHouses = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllBoardingHouses({ page: page - 1, pageSize });

            if (response && Array.isArray(response.content)) {
                setBoardingHouses(response.content);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
            } else {
                setBoardingHouses([]);
                message.error('Dữ liệu khu nhà không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách khu nhà: ${error.response?.data?.message || error.message}`);
            setBoardingHouses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBoardingHouses = () => {
        setModalMode('create');
        setSelectedBoardingHouses(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditBoardingHouses = (record) => {
        setSelectedBoardingHouses(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDeleteBoardingHouses = (record) => {
        setModalMode('delete');
        setSelectedBoardingHouses(record.id);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            message.success('Tạo khu nhà thành công (demo)');
        } else if (modalMode === 'edit') {
            message.success('Cập nhật khu nhà thành công (demo)');
        } else if (modalMode === 'delete') {
            message.success('Xóa khu nhà thành công (demo)');
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        handleGetBoardingHouses(pagination.current, pagination.pageSize);
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

    const handleViewBoardingHouses = (record) => {
        setSelectedBoardingHouses(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <div className={cx('boardingHouses-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm khu nhà" icon={<SearchOutlined />} />
                <div className={cx('features')}>
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: 'Bảng', value: 'table', icon: <TableOutlined /> },
                            { label: 'Thẻ', value: 'card', icon: <AppstoreOutlined /> },
                        ]}
                        className={cx('view-toggle')}
                    />
                    <SmartButton title="Thêm" icon={<PlusOutlined />} type="primary" onClick={handleAddBoardingHouses} />
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined />} />
                    <SmartButton title="Excel" icon={<CloudUploadOutlined />} />
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('boardingHouses-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={boardingHouses}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {boardingHouses.map((boardingHouse) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={boardingHouse.id}>
                                    <BoardingHousesCard
                                        boardingHouse={boardingHouse}
                                        onView={() => handleViewBoardingHouses(boardingHouse)}
                                        onEdit={() => handleEditBoardingHouses(boardingHouse)}
                                        onDelete={() => handleDeleteBoardingHouses(boardingHouse)}
                                    />
                                </Col>
                            ))}
                        </Row>

                        {/* ✅ Pagination riêng cho chế độ card */}
                        <div className={cx('pagination-wrapper')}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                showSizeChanger
                                showQuickJumper
                                pageSizeOptions={['6', '12', '24']}
                                onChange={(page, pageSize) => handleGetBoardingHouses(page, pageSize)}
                            />
                        </div>
                    </>
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
