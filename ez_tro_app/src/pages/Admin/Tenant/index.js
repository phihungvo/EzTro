import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import styles from '~/pages/Admin/Tenant/Tenant.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    TableOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import SmartInput from '~/components/Layout/AdminLayout/components/SmartInput';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import PopupModal from '~/components/Layout/AdminLayout/components/PopupModal';
import {
    Form,
    message,
    Row,
    Col,
    Pagination,
    Segmented,
    Tag,
    DatePicker,
    Card,
    Space,
    Empty,
    Select,
    Spin,
    Statistic,
    ConfigProvider,
} from 'antd';
import FilterComponent from "~/components/Layout/AdminLayout/components/FilterComponent";
import {
    getAllTenants,
    filterTenants,
    createTenant,
    updateTenant,
    deleteTenant,
} from '~/service/admin/tenant';
import useDebounce from '~/hooks/useDebounce';
import { disablePastDates } from "~/utils/dateUtils";

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;

function Tenant() {
    const [tenantSource, setTenantSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [dateRange, setDateRange] = useState(null);
    const [genderFilter, setGenderFilter] = useState(null);
    const [occupationFilter, setOccupationFilter] = useState(null);
    const [hasActiveContractFilter, setHasActiveContractFilter] = useState(null);

    const genderStyles = {
        MALE: { color: 'blue', label: 'Nam' },
        FEMALE: { color: 'magenta', label: 'Nữ' },
        OTHER: { color: 'purple', label: 'Khác' },
    };

    const getGenderTag = (gender) => {
        if (!gender) return <Tag color="default">N/A</Tag>;
        const { color, label } = genderStyles[gender] || { color: 'default', label: gender };
        return <Tag color={color}>{label}</Tag>;
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setDateRange(null);
        setGenderFilter(null);
        setOccupationFilter(null);
        setHasActiveContractFilter(null);
        setPagination(prev => ({...prev, current: 1}));
        message.success('Đã reset bộ lọc!');
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
            render: (date) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
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
            render: (date) =>
                date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
        },
        {
            title: 'Thao tác',
            fixed: 'right',
            width: 170,
            align: 'center',
            render: (_, record) => (
                <>
                    <SmartButton
                        type="default"
                        icon={<EyeOutlined />}
                        buttonWidth={50}
                        onClick={() => navigate(`/admin/tenants/${record.id}`)}
                    />
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined />}
                        buttonWidth={50}
                        onClick={() => handleEditTenant(record)}
                        style={{ marginLeft: '8px' }}
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

    const tenantModalFields = [
        {
            label: 'Full Name',
            name: 'fullName',
            type: 'text',
            rules: [{ required: true, message: 'Full Name bắt buộc!' }],
        },
        {
            label: 'Phone Number',
            name: 'phoneNumber',
            type: 'number',
        },
        {
            label: 'Email',
            name: 'email',
            type: 'text',
            rules: [{ required: true, message: 'Email bắt buộc!' }],
        },
        {
            label: 'Password',
            name: 'password',
            type: 'number',
        },
        {
            label: 'Số căn cước',
            name: 'identityNumber',
            type: 'number',
            rules: [{ required: true, message: 'Số căn cước bắt buộc!' }],
        },
        // {
        //     label: 'Ngày cấp',
        //     name: 'issueDate',
        //     type: 'date',
        //     format: 'DD/MM/YYYY',
        //     placeholder: 'Chọn ngày cấp',
        //     disabledDate: disablePastDates,
        // },
        // {
        //     label: 'Nơi cấp',
        //     name: 'issuePlace',
        //     type: 'text',
        // },
        {
            label: 'Ngày sinh',
            name: 'dateOfBirth',
            type: 'date',
            format: 'DD/MM/YYYY',
            placeholder: 'Chọn ngày sinh',
            disabledDate: disablePastDates,
        },
        {
            label: 'Giới tính',
            name: 'gender',
            type: 'select',
            options: [
                { label: 'Nam', value: 'MALE' },
                { label: 'Nữ', value: 'FEMALE' },
                { label: 'Khác', value: 'OTHER' },
            ],
            rules: [{ required: true, message: 'Giới tính bắt buộc!' }],
        },
        {
            label: 'Nghề nghiệp',
            name: 'occupation',
            type: 'text',
        },
        // {
        //     label: 'Địa chỉ thường trú',
        //     name: 'permanentAddress',
        //     type: 'textarea',
        // },
        // {
        //     label: 'Thông tin xe',
        //     name: 'vehicleInfo',
        //     type: 'text',
        // },
        // {
        //     label: 'Người liên hệ khẩn cấp',
        //     name: 'emergencyContact',
        //     type: 'text',
        // },
        // {
        //     label: 'SĐT liên hệ khẩn cấp',
        //     name: 'emergencyPhone',
        //     type: 'text',
        // },
        {
            label: 'Ghi chú',
            name: 'note',
            type: 'textarea',
        },
    ];

    const handleFilterTenants = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1,
                pageSize: pagination.pageSize,
            };

            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }

            if (dateRange && dateRange.length === 2) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            if (genderFilter) {
                params.gender = genderFilter;
            }

            if (occupationFilter) {
                params.occupation = occupationFilter;
            }

            if (hasActiveContractFilter) {
                params.hasActiveContract = hasActiveContractFilter === 'YES';
            }

            const response = await filterTenants(params);

            if (response && Array.isArray(response.content)) {
                setTenantSource(response.content);
                setPagination({
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: response.totalElements,
                });
            } else {
                setTenantSource([]);
            }
        } catch (error) {
            console.error('Error filtering tenants:', error);
            message.error(`Lỗi khi lọc người thuê: ${error.response?.data?.message || error.message}`);
            setTenantSource([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPagination(prev => ({...prev, current: 1}));
        handleFilterTenants();
    }, [debouncedSearchTerm, dateRange, genderFilter, occupationFilter, hasActiveContractFilter]);

    useEffect(() => {
        handleFilterTenants();
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        handleFilterTenants();
    }, []);

    const handleAddTenant = () => {
        setModalMode('create');
        setSelectedTenant(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateTenant = async (formData) => {
        try {
            await createTenant(formData);
            handleFilterTenants();
            setIsModalOpen(false);
            message.success('Tạo người thuê thành công');
        } catch (error) {
            message.error(`Lỗi khi tạo người thuê: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditTenant = (record) => {
        setSelectedTenant(record);
        setModalMode('edit');
        const formValues = {
            ...record,
            dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : null,
            // issueDate: record.issueDate ? new Date(record.issueDate) : null,
        };
        form.setFieldsValue(formValues);
        setIsModalOpen(true);
    };

    const handleCallUpdateTenant = async (formData) => {
        try {
            // await updateTenant(selectedTenant.id, formData);
            handleFilterTenants();
            setIsModalOpen(false);
            message.success('Cập nhật người thuê thành công');
        } catch (error) {
            message.error(`Lỗi khi cập nhật người thuê: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteTenant = (record) => {
        setModalMode('delete');
        setSelectedTenant(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteTenant = async () => {
        try {
            // await deleteTenant(selectedTenant.id);
            handleFilterTenants();
            setIsModalOpen(false);
            message.success('Xóa người thuê thành công');
        } catch (error) {
            message.error(`Lỗi khi xóa người thuê: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleFormSubmit = (formData) => {
        const submitData = {
            ...formData,
            dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.format('YYYY-MM-DD') : null,
        };

        if (modalMode === 'create') {
            handleCallCreateTenant(submitData);
        } else if (modalMode === 'edit') {
            handleCallUpdateTenant(submitData);
        } else if (modalMode === 'delete') {
            handleCallDeleteTenant();
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        setPagination(prev => ({
            ...prev,
            current: pagination.current,
            pageSize: pagination.pageSize,
        }));
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm người thuê mới';
            case 'edit':
                return 'Chỉnh sửa người thuê';
            case 'delete':
                return 'Xóa người thuê';
            default:
                return 'Chi tiết người thuê';
        }
    };

    const handleViewModeChange = (value) => {
        setViewMode(value);
    };

    const handlePaginationChange = (page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize,
        }));
    };

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
                            options: [
                                { value: 'MALE', label: 'Nam' },
                                { value: 'FEMALE', label: 'Nữ' },
                                { value: 'OTHER', label: 'Khác' },
                            ],
                            allowClear: true,
                        },
                        {
                            type: 'select',
                            name: 'occupation',
                            placeholder: 'Chọn nghề nghiệp',
                            value: occupationFilter,
                            onChange: setOccupationFilter,
                            options: [
                                { value: 'STUDENT', label: 'Sinh viên' },
                                { value: 'EMPLOYEE', label: 'Nhân viên' },
                                { value: 'FREELANCER', label: 'Freelancer' },
                                { value: 'OTHER', label: 'Khác' },
                            ],
                            allowClear: true,
                        },
                        {
                            type: 'select',
                            name: 'hasActiveContract',
                            placeholder: 'Chọn trạng thái hợp đồng',
                            value: hasActiveContractFilter,
                            onChange: setHasActiveContractFilter,
                            options: [
                                { value: 'YES', label: 'Có hợp đồng hiệu lực' },
                                { value: 'NO', label: 'Không có hợp đồng hiệu lực' },
                            ],
                            allowClear: true,
                        },
                    ]}
                    onReset={handleResetFilters}
                    gridTemplate="230px 200px 1fr 1fr 1fr auto"
                />

                {/* Nội dung */}
                <div className={cx('tenant-container')}>
                    <div className={cx('pagination-wrapper')}>
                        <div className={cx('left-actions')}>
                            <div className={cx('view-mode-toggle')}>
                                <Segmented
                                    options={[
                                        {
                                            label: (
                                                <>
                                                    <TableOutlined />
                                                    Bảng
                                                </>
                                            ),
                                            value: 'table',
                                        },
                                        {
                                            label: (
                                                <>
                                                    <AppstoreOutlined />
                                                    Thẻ
                                                </>
                                            ),
                                            value: 'card',
                                        },
                                    ]}
                                    value={viewMode}
                                    onChange={handleViewModeChange}
                                />
                            </div>
                            <SmartButton
                                title="Thêm mới"
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={handleAddTenant}
                            />
                            <SmartButton
                                title="Excel"
                                icon={<CloudUploadOutlined />}
                                onClick={() => message.info('Tính năng xuất Excel đang phát triển')}
                            />
                        </div>
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handlePaginationChange}
                            showSizeChanger
                            showTotal={(total) => `Tổng ${total} người thuê`}
                            pageSizeOptions={['10', '20', '30']}
                        />
                    </div>

                    {viewMode === 'table' ? (
                        <SmartTable
                            columns={columns}
                            dataSources={tenantSource}
                            loading={loading}
                            pagination={false}
                            onTableChange={handleTableChange}
                        />
                    ) : (
                        <>
                            <Spin spinning={loading}>
                                {tenantSource.length === 0 ? (
                                    <Empty description="Không có người thuê nào phù hợp với bộ lọc" />
                                ) : (
                                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                                        {tenantSource.map((tenant) => (
                                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={tenant.id}>
                                                <Card
                                                    title={tenant.fullName}
                                                    extra={
                                                        <Space>
                                                            <SmartButton
                                                                type="primary"
                                                                icon={<EditOutlined />}
                                                                onClick={() => handleEditTenant(tenant)}
                                                            />
                                                            <SmartButton
                                                                type="danger"
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => handleDeleteTenant(tenant)}
                                                            />
                                                        </Space>
                                                    }
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
                            </Spin>
                            {/* Pagination bottom for card view */}
                            <div className={cx('pagination-wrapper')}>
                                <div className={cx('left-actions')}>
                                    <div className={cx('view-mode-toggle')}>
                                        <Segmented
                                            options={[
                                                {
                                                    label: (
                                                        <>
                                                            <TableOutlined />
                                                            Bảng
                                                        </>
                                                    ),
                                                    value: 'table',
                                                },
                                                {
                                                    label: (
                                                        <>
                                                            <AppstoreOutlined />
                                                            Thẻ
                                                        </>
                                                    ),
                                                    value: 'card',
                                                },
                                            ]}
                                            value={viewMode}
                                            onChange={handleViewModeChange}
                                        />
                                    </div>
                                </div>
                                <Pagination
                                    current={pagination.current}
                                    pageSize={pagination.pageSize}
                                    total={pagination.total}
                                    onChange={handlePaginationChange}
                                    showSizeChanger
                                    showQuickJumper
                                    pageSizeOptions={['10', '20', '30']}
                                />
                            </div>
                        </>
                    )}
                </div>

                <PopupModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    title={getModalTitle()}
                    fields={modalMode === 'delete' ? [] : tenantModalFields}
                    onSubmit={handleFormSubmit}
                    initialValues={selectedTenant}
                    isDeleteMode={modalMode === 'delete'}
                    formInstance={form}
                />
            </div>
        </ConfigProvider>
    );
}

export default Tenant;