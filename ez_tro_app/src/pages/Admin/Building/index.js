import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/Building/Building.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import BuildingCard from '~/components/Layout/AdminLayout/components/BuildingCard';
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
import { Form, message, Row, Col, Pagination, Segmented } from 'antd';
import {getAllBuildings, createBuilding, updateBuilding, deleteBuilding} from '~/service/admin/building';
import {deleteBoardingHouse, getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';

const cx = classNames.bind(styles);

function Building() {
    const [buildingSource, setBuildingSource] = useState([]);
    const [boardingHouseOptionSource, setBoardingHouseOptionSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const columns = [
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
                        icon={<EditOutlined />}
                        buttonWidth={40}
                        onClick={() => handleEditBuilding(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={40}
                        onClick={() => handleDeleteBuilding(record)}
                        style={{ marginLeft: '8px' }}
                    />
                </>
            ),
        },
    ];

    const buildingModalFields = [
        {
            label: 'Tên khu nhà',
            name: 'name',
            type: 'text',
            rules: [{ required: true, message: 'Tên khu nhà là bắt buộc!' }],
        },
        {
            label: 'Khu nhà trọ',
            name: 'boardingHouseId',
            type: 'select',
            options: boardingHouseOptionSource
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
    ];

    useEffect(() => {
        handleGetAllBoardingHouses();
        handleGetBuildings();
    }, []);

    const handleGetAllBoardingHouses = async () => {
        try {
            const response = await getAllBoardingHousesNoPaged();
            const mappedUsers = response.result.map(usr => ({
                value: usr.id,
                label: usr.name,
            }));
            setBoardingHouseOptionSource(mappedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            setBoardingHouseOptionSource([]);
        }
    };

    const handleGetBuildings = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllBuildings({ page: page - 1, pageSize });

            if (response && Array.isArray(response.content)) {
                setBuildingSource(response.content);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
                console.log('Building sources: ',response.content);
            } else {
                setBuildingSource([]);
                message.error('Dữ liệu khu nhà không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách khu nhà: ${error.response?.data?.message || error.message}`);
            setBuildingSource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBuilding = () => {
        setModalMode('create');
        setSelectedBuilding(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateBuilding = async (formData) => {
        try {
            await createBuilding(formData);
            handleGetBuildings();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleEditBuilding = (record) => {
        setSelectedBuilding(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateBuilding = async (formData) => {
        try {
            await updateBuilding(selectedBuilding.id, formData);
            handleGetBuildings();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteBuilding = (record) => {
        setModalMode('delete');
        setSelectedBuilding(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteBuilding = async () => {
        await deleteBuilding(selectedBuilding.id);
        handleGetBuildings();
        setIsModalOpen(false);
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateBuilding(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateBuilding(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteBuilding();
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        handleGetBuildings(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm toà nhà mới';
            case 'edit':
                return 'Chỉnh sửa toà nhà';
            case 'delete':
                return 'Xóa toà nhà';
            default:
                return 'Chi tiết toà nhà';
        }
    };

    const handleViewBuilding = (record) => {
        setSelectedBuilding(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <div className={cx('building-wrapper')}>
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
                    <SmartButton title="Thêm" icon={<PlusOutlined />} type="primary" onClick={handleAddBuilding} />
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined />} />
                    <SmartButton title="Excel" icon={<CloudUploadOutlined />} />
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('building-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={buildingSource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {buildingSource.map((building) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={building.id}>
                                    <BuildingCard
                                        building={building}
                                        onView={() => handleViewBuilding(building)}
                                        onEdit={() => handleEditBuilding(building)}
                                        onDelete={() => handleDeleteBuilding(building)}
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
                                onChange={(page, pageSize) => handleGetBuildings(page, pageSize)}
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
                fields={modalMode === 'delete' ? [] : buildingModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedBuilding}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Building;
