import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/Amenity/Amenity.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import AmenityCard from '~/components/Layout/AdminLayout/components/AmenityCard';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
    TableOutlined,
    AppstoreOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import {Form, message, Row, Col, Pagination, Segmented, Tag} from 'antd';
import {getAllAmenities, createAmenity, updateAmenity, deleteAmenity} from '~/service/admin/amenity';
import {deleteBoardingHouse, getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';

const cx = classNames.bind(styles);

function Amenity() {
    const [amenitySource, setAmenitySource] = useState([]);
    const [boardingHouseOptionSource, setBoardingHouseOptionSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const getStatusTag = (status) => {
        const statusConfig = {
            'FIXED': {color: 'blue', text: 'Cố định'},
            'PER_PERSON': {color: 'green', text: 'Theo người'},
            'PER_VEHICLE': {color: 'orange', text: 'Theo phương tiện'},
            'USAGE_BASED': {color: 'purple', text: 'Theo tiêu thụ'},
        };
        const config = statusConfig[status] || {color: 'default', text: status};
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Tên dịch vụ',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 250,
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 250,
            align: 'center',
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
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
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 150,
            align: 'center',
            render: (isActive) => (
                isActive ?
                    <CheckOutlined style={{ color: 'green', fontSize: '18px' }} /> :
                    <CloseOutlined style={{ color: 'red', fontSize: '18px' }} />
            ),
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
                        onClick={() => handleEditAmenity(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={40}
                        onClick={() => handleDeleteAmenity(record)}
                        style={{ marginLeft: '8px' }}
                    />
                </>
            ),
        },
    ];

    const amenityModalFields = [
        {
            label: 'Tên Dịch Vụ',
            name: 'name',
            type: 'text',
            rules: [{ required: true, message: 'Tên dịch vụ là bắt buộc!' }],
        },
        {
            label: 'Đơn Vị Tính',
            name: 'unit',
            type: 'text',
        },
        {
            label: 'Đơn Giá (VND)',
            name: 'price',
            type: 'number',
        },
        {
            label: 'Cách Tính Phí',
            name: 'type',
            type: 'select',
            options: [
                {value: 'FIXED', label: 'Cố định'},
                {value: 'PER_PERSON', label: 'Theo người'},
                {value: 'PER_VEHICLE', label: 'Theo phương tiện'},
                {value: 'USAGE_BASED', label: 'Theo tiêu thụ'},
            ]
        },
        {
            label: 'Áp dụng cho Khu Nhà',
            name: 'boardingHouseId',
            type: 'select',
            multiple: true,
            options: boardingHouseOptionSource
        },
        // {
        //     label: 'Áp dụng cho Phòng',
        //     name: 'totalFloors',
        //     type: 'number',
        // },
        {
            label: 'Mô Tả',
            name: 'description',
            type: 'textarea',
        },
    ];

    useEffect(() => {
        handleGetAllBoardingHouses();
        handleGetAmenities();
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

    const handleGetAmenities = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllAmenities({ page: page - 1, pageSize });

            if (response && Array.isArray(response.content)) {
                setAmenitySource(response.content);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
                console.log('Amenity sources: ',response.content);
            } else {
                setAmenitySource([]);
                message.error('Dữ liệu khu nhà không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách khu nhà: ${error.response?.data?.message || error.message}`);
            setAmenitySource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAmenity = () => {
        setModalMode('create');
        setSelectedAmenity(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateAmenity = async (formData) => {
        try {
            // await createAmenity(formData);
            handleGetAmenities();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleEditAmenity = (record) => {
        setSelectedAmenity(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateAmenity = async (formData) => {
        try {
            // await updateAmenity(selectedAmenity.id, formData);
            handleGetAmenities();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteAmenity = (record) => {
        setModalMode('delete');
        setSelectedAmenity(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteAmenity = async () => {
        // await deleteAmenity(selectedAmenity.id);
        handleGetAmenities();
        setIsModalOpen(false);
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateAmenity(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateAmenity(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteAmenity();
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        handleGetAmenities(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm dịch vụ mới';
            case 'edit':
                return 'Chỉnh sửa dịch vụ';
            case 'delete':
                return 'Xóa dịch vụ';
            default:
                return 'Chi tiết dịch vụ';
        }
    };

    const handleViewAmenity = (record) => {
        setSelectedAmenity(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <div className={cx('amenity-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm dịch vụ" icon={<SearchOutlined />} />
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
                    <SmartButton title="Thêm" icon={<PlusOutlined />} type="primary" onClick={handleAddAmenity} />
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined />} />
                    <SmartButton title="Excel" icon={<CloudUploadOutlined />} />
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('amenity-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={amenitySource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {amenitySource.map((amenity) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={amenity.id}>
                                    <AmenityCard
                                        amenity={amenity}
                                        onView={() => handleViewAmenity(amenity)}
                                        onEdit={() => handleEditAmenity(amenity)}
                                        onDelete={() => handleDeleteAmenity(amenity)}
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
                                onChange={(page, pageSize) => handleGetAmenities(page, pageSize)}
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
                fields={modalMode === 'delete' ? [] : amenityModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedAmenity}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Amenity;
