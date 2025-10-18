import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/AdminDashboard/Building/Building.module.scss';
import SmartTable from '~/components/Layout/components/SmartTable';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/components/SmartInput';
import SmartButton from '~/components/Layout/components/SmartButton';
import PopupModal from '~/components/Layout/components/PopupModal';
import { Form, message, Tag } from 'antd';
import { getAllBuildings } from '~/service/admin/building';

const cx = classNames.bind(styles);

function Building() {
    const [buildingSource, setBuildingSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'Tên toà nhà',
            dataIndex: 'name',
            key: 'name',
            width: 150,
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
            title: 'Số phòng',
            dataIndex: 'totalFloors',
            key: 'totalFloors',
            width: 150,
            align: 'center',
        },
        {
            title: 'Thao tác',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined />}
                        buttonWidth={50}
                        onClick={() => handleEditBuilding(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined />}
                        buttonWidth={50}
                        onClick={() => handleDeletePosition(record)}
                        style={{ marginLeft: '8px' }}
                    />
                </>
            ),
        },
    ];

    const userModalFields = [
        {
            label: 'Chức vụ',
            name: 'title',
            type: 'text',
            rules: [{ required: true, message: 'Chức vụ bắt buộc!' }],
        },
        {
            label: 'Mô tả chi tiết',
            name: 'description',
            type: 'text',
        },
        {
            label: 'Lương cơ bản',
            name: 'baseSalary',
            type: 'number',
            rules: [{ type: 'number', min: 0, message: 'Lương cơ bản phải lớn hơn 0!' }],
        },
        {
            label: 'Loại công việc',
            name: 'positionType',
            type: 'select',
            options: [
                'INTERN',
                'JUNIOR',
                'MID',
                'SENIOR',
                'LEADER',
                'MANAGER',
                'DIRECTOR',
                'EXECUTIVE',
            ],
            rules: [{ required: true, message: 'Loại công việc bắt buộc!' }],
        },
    ];

    useEffect(() => {
        handleGetBuildings();
    }, []);

    const handleGetBuildings = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            // const response = employeeId
            //     ? await getAllByEmployeePaged(employeeId, { page: page - 1, pageSize })
            //     : await getAllPositions({ page: page - 1, pageSize });
            
            const response = await getAllBuildings({ page: page - 1, pageSize });

            if (response && Array.isArray(response.content)) {
                const mappedBuildings = response.content.map((building) => ({
                    ...building,
                }));
                setBuildingSource(mappedBuildings);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
            } else {
                setBuildingSource([]);
                message.error('Dữ liệu vị trí không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách vị trí: ${error.response?.data?.message || error.message}`);
            setBuildingSource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBuilding = () => {
        setModalMode('create');
        setSelectedPosition(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateBuilding = async (formData) => {
        try {
            // await createPosition(formData);
            handleGetBuildings();
            setIsModalOpen(false);
            message.success('Tạo vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi tạo vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditBuilding = (record) => {
        setSelectedPosition(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdatePosition = async (formData) => {
        try {
            // await updatePosition(selectedPosition.id, formData);
            handleGetBuildings();
            setIsModalOpen(false);
            message.success('Cập nhật vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi cập nhật vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeletePosition = (record) => {
        setModalMode('delete');
        setSelectedPosition(record.id);
        setIsModalOpen(true);
    };

    const handleCallDeletePosition = async () => {
        try {
            // await deletePosition(selectedPosition);
            handleGetBuildings();
            setIsModalOpen(false);
            message.success('Xóa vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi xóa vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateBuilding(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdatePosition(formData);
        } else if (modalMode === 'delete') {
            handleCallDeletePosition();
        }
    };

    const handleTableChange = (pagination) => {
        handleGetBuildings(pagination.current, pagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm vị trí mới';
            case 'edit':
                return 'Chỉnh sửa vị trí';
            case 'delete':
                return 'Xóa vị trí';
            default:
                return 'Chi tiết vị trí';
        }
    };

    return (
        <div className={cx('trailer-wrapper')}>
            <div className={cx('sub_header')}>
                <SmartInput
                    size="large"
                    placeholder="Tìm kiếm"
                    icon={<SearchOutlined />}
                />
                <div className={cx('features')}>
                    <SmartButton
                        title="Thêm"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={handleAddBuilding}
                    />
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined />} />
                    <SmartButton title="Excel" icon={<CloudUploadOutlined />} />
                </div>
            </div>
            <div className={cx('trailer-container')}>
                <SmartTable
                    columns={columns}
                    dataSources={buildingSource}
                    loading={loading}
                    pagination={pagination}
                    onTableChange={handleTableChange}
                />
            </div>

            <PopupModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title={getModalTitle()}
                fields={modalMode === 'delete' ? [] : userModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedPosition}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Building;