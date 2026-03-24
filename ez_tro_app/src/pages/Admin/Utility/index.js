import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/Utility/Utility.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import UtilityCard from '~/components/Layout/AdminLayout/components/UtilityCard';
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
import {getAllUtilities, createUtility, updateUtility, deleteUtility} from '~/service/admin/utility';
import {getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';

const cx = classNames.bind(styles);

function Utility() {
    const [utilitySource, setUtilitySource] = useState([]);
    const [boardingHouseOptionSource, setBoardingHouseOptionSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUtility, setSelectedUtility] = useState(null);
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
            title: 'Tên tiện ích',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Loại tiện ích',
            dataIndex: 'type',
            key: 'type',
            width: 200,
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Giá áp dụng',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 200,
            align: 'center',
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unit',
            key: 'unit',
            width: 180,
            align: 'center',
        },
        {
            title: 'Nhà trọ áp dụng',
            dataIndex: 'boardingHouseName',
            key: 'boardingHouseName',
            align: 'center',
            width: 250,
        },
        {
            title: 'Khu tòa/Block',
            dataIndex: 'buildingName', // <-- sửa đúng dữ liệu trả về nếu có
            key: 'buildingName',
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
                        onClick={() => handleEditUtility(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={40}
                        onClick={() => handleDeleteUtility(record)}
                        style={{ marginLeft: '8px' }}
                    />
                </>
            ),
        },
    ];

    const utilityModalFields = [
        {
            label: 'Tên tiện ích',
            name: 'name',
            type: 'text',
            rules: [{ required: true, message: 'Tên tiện ích là bắt buộc!' }],
            placeholder: 'VD: Điện, Nước, Internet...',
        },
        {
            label: 'Áp dụng cho nhà trọ',
            name: 'boardingHouseId',
            type: 'select',
            options: boardingHouseOptionSource
        },
        {
            label: 'Đơn vị tính',
            name: 'unit',
            type: 'text',
            placeholder: 'VD: kWh, m³, chiếc...',
        },
        {
            label: 'Đơn giá (VND)',
            name: 'unitPrice',
            type: 'number',
            placeholder: '3.500',
        },
        {
            label: 'Cách tính phí',
            name: 'type',
            type: 'select',
            options: [
                {value: 'FIXED', label: 'Cố định'},
                {value: 'PER_PERSON', label: 'Theo số người'},
                {value: 'PER_VEHICLE', label: 'Theo số phương tiện'},
                {value: 'USAGE_BASED', label: 'Theo mức tiêu thụ'},
            ]
        },
        {
            label: 'Trạng thái hoạt động',
            name: 'isActive',
            type: 'yesno',
        },
        {
            label: 'Mô tả',
            name: 'description',
            type: 'textarea',
            placeholder: 'Nhập mô tả tiện ích...',
        },
    ];

    useEffect(() => {
        handleGetAllBoardingHouses();
        handleGetUtilities();
    }, []);

    const handleGetAllBoardingHouses = async () => {
        try {
            const response = await getAllBoardingHousesNoPaged();
            const mappedUsers = response.map(usr => ({
                value: usr.id,
                label: usr.name,
            }));
            setBoardingHouseOptionSource(mappedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            setBoardingHouseOptionSource([]);
        }
    };

    const handleGetUtilities = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllUtilities({ page: page - 1, pageSize });

            if (response && Array.isArray(response.content)) {
                setUtilitySource(response.content);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
                console.log('Utility sources: ',response.content);
            } else {
                setUtilitySource([]);
                message.error('Dữ liệu tiện ích không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách tiện ích: ${error.response?.data?.message || error.message}`);
            setUtilitySource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUtility = () => {
        setModalMode('create');
        setSelectedUtility(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateUtility = async (formData) => {
        try {
            await createUtility(formData);
            handleGetUtilities();
        } catch (error) {
            message.error(
                `Lỗi khi tạo tiện ích: ${
                    error.response?.data?.message || error.message
                }`,
            );
            throw error;
        }
    };

    const handleEditUtility = (record) => {
        setSelectedUtility(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateUtility = async (formData) => {
        try {
            await updateUtility(selectedUtility.id, formData);
            handleGetUtilities();
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật tiện ích: ${
                    error.response?.data?.message || error.message
                }`,
            );
            throw error;
        }
    };

    const handleDeleteUtility = (record) => {
        setModalMode('delete');
        setSelectedUtility(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteUtility = async () => {
        await deleteUtility(selectedUtility.id);
        handleGetUtilities();
    };

    const handleFormSubmit = async (formData) => {
        formData.isActive = formData.isActive === 'Yes';

        if (modalMode === 'create') {
            await handleCallCreateUtility(formData);
        } else if (modalMode === 'edit') {
            await handleCallUpdateUtility(formData);
        } else if (modalMode === 'delete') {
            await handleCallDeleteUtility();
        }
    };

    const handleTableChange = (pagination) => {
        handleGetUtilities(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm tiện ích mới';
            case 'edit':
                return 'Chỉnh sửa tiện ích';
            case 'delete':
                return 'Xóa tiện ích';
            default:
                return 'Chi tiết tiện ích';
        }
    };

    const handleViewUtility = (record) => {
        setSelectedUtility(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <div className={cx('utility-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm tiện ích" icon={<SearchOutlined />} />
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
                    <SmartButton title="Thêm" icon={<PlusOutlined />} type="primary" onClick={handleAddUtility} />
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined />} />
                    <SmartButton title="Excel" icon={<CloudUploadOutlined />} />
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        showQuickJumper
                        pageSizeOptions={['6', '12', '24']}
                        onChange={(page, pageSize) => handleGetUtilities(page, pageSize)}
                    />
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('utility-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={utilitySource}
                        loading={loading}
                        pagination={false}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                        {utilitySource.map((utility) => (
                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={utility.id}>
                                <UtilityCard
                                    utility={utility}
                                    onView={() => handleViewUtility(utility)}
                                    onEdit={() => handleEditUtility(utility)}
                                    onDelete={() => handleDeleteUtility(utility)}
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
                fields={modalMode === 'delete' ? [] : utilityModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedUtility}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Utility;
