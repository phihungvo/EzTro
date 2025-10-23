import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import {useNavigate} from 'react-router-dom';
import styles from '~/pages/Admin/Tenant/Tenant.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import { Form, message, Tag } from 'antd';
import { getAllTenants } from '~/service/admin/tenant';

const cx = classNames.bind(styles);

function Tenant() {
    const [tenantSource, setTenantSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const genderStyles = {
        MALE: { color: 'blue', label: 'Nam' },
        FEMALE: { color: 'magenta', label: 'Nữ' },
        OTHER: { color: 'purple', label: 'Khác' },
    };

    const columns = [
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
            title: 'Sdt',
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
            render: (date) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: 150,
            align: 'center',
            render: (gender) => {
                if (!gender) return <Tag color="default">N/A</Tag>;
                const { color, label } = genderStyles[gender] || { color: 'default', label: gender };
                return <Tag color={color}>{label}</Tag>;
            },
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
            title: 'Thao tác',
            fixed: 'right',
            width: 170,
            render: (_, record) => (
                <>
                    <SmartButton
                        type="default"
                        icon={<EyeOutlined/>}
                        buttonWidth={50}
                        onClick={() => navigate(`/admin/tenants/${record.id}`)}
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
                        onClick={() => handleDeleteTenant(record)}
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
        handleGetTenants();
    }, []);

    const handleGetTenants = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await getAllTenants({ page: page - 1, pageSize });

            if (response && Array.isArray(response.content)) {
                const mappedTenants = response.content.map((tenant) => ({
                    ...tenant,
                }));
                setTenantSource(mappedTenants);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
            } else {
                setTenantSource([]);
                message.error('Dữ liệu vị trí không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách vị trí: ${error.response?.data?.message || error.message}`);
            setTenantSource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTenant = () => {
        setModalMode('create');
        setSelectedTenant(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateTenant = async (formData) => {
        try {
            // await createPosition(formData);
            handleGetTenants();
            setIsModalOpen(false);
            message.success('Tạo vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi tạo vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditTenant = (record) => {
        setSelectedTenant(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateTenant = async (formData) => {
        try {
            // await updatePosition(selectedTenant.id, formData);
            handleGetTenants();
            setIsModalOpen(false);
            message.success('Cập nhật vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi cập nhật vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteTenant = (record) => {
        setModalMode('delete');
        setSelectedTenant(record.id);
        setIsModalOpen(true);
    };

    const handleCallDeleteTenant = async () => {
        try {
            // await deletePosition(selectedTenant);
            handleGetTenants();
            setIsModalOpen(false);
            message.success('Xóa vị trí thành công');
        } catch (error) {
            message.error(`Lỗi khi xóa vị trí: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateTenant(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateTenant(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteTenant();
        }
    };

    const handleTableChange = (pagination) => {
        handleGetTenants(pagination.current, pagination.pageSize);
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
        <div className={cx('Tenant-wrapper')}>
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
                        onClick={handleAddTenant}
                    />
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined />} />
                    <SmartButton title="Excel" icon={<CloudUploadOutlined />} />
                </div>
            </div>
            <div className={cx('Tenant-container')}>
                <SmartTable
                    columns={columns}
                    dataSources={tenantSource}
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
                initialValues={selectedTenant}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Tenant;