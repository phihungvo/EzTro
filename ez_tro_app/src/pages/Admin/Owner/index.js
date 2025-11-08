import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from '~/pages/Admin/Owner/Owner.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
// import OwnerCard from '~/components/Layout/AdminLayout/components/OwnerCard';
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
import {Form, message, Row, Col, Pagination, Segmented, Tag} from 'antd';
import {
    getAllOwners
    // createOwner,
    // updateOwner,
    // deleteOwner,
    // getAllOwnersByRole
} from '~/service/admin/owner';
import {getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';

const cx = classNames.bind(styles);

function Owner() {
    const [ownerSource, setOwnerSource] = useState([]);
    const [boardingHouseOptionSource, setBoardingHouseOptionSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'Tên chủ trọ',
            dataIndex: 'fullName',
            key: 'fullName',
            width: 250,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 250,
            align: 'center',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            align: 'center',
            width: 180,
            render: (text) => text || '—',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            align: 'center',
            width: 200,
            render: (text) => text || '—',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
            align: 'center',
            render: (dateArr) => {
                if (!dateArr) return '—';
                const [y, m, d, h, mi] = dateArr;
                return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y} ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'enabled',
            key: 'enabled',
            align: 'center',
            width: 150,
            render: (value) => (
                <Tag style={{color: value ? 'green' : 'red'}}>
                    {value ? 'Hoạt động' : 'Bị khoá'}
                </Tag>
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
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEditOwner(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDeleteOwner(record)}
                        style={{marginLeft: '8px'}}
                    />
                </>
            ),
        },
    ];

    const ownerModalFields = [
        {
            label: 'Tên chủ trọ',
            name: 'name',
            type: 'text',
            rules: [{required: true, message: 'Tên chủ trọ là bắt buộc!'}],
        },
        {
            label: 'chủ trọ trọ',
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
        handleGetOwners();
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

    const handleGetOwners = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllOwners({page: page - 1, pageSize});

            if (response && Array.isArray(response.content)) {
                setOwnerSource(response.content);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.totalElements,
                });
            } else {
                setOwnerSource([]);
                message.error('Dữ liệu chủ trọ không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách chủ trọ: ${error.response?.data?.message || error.message}`);
            setOwnerSource([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOwner = () => {
        setModalMode('create');
        setSelectedOwner(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateOwner = async (formData) => {
        try {
            // await createOwner(formData);
            handleGetOwners();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo chủ trọ: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleEditOwner = (record) => {
        setSelectedOwner(record);
        setModalMode('edit');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCallUpdateOwner = async (formData) => {
        try {
            // await updateOwner(selectedOwner.id, formData);
            handleGetOwners();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật chủ trọ: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteOwner = (record) => {
        setModalMode('delete');
        setSelectedOwner(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteOwner = async () => {
        // await deleteOwner(selectedOwner.id);
        handleGetOwners();
        setIsModalOpen(false);
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateOwner(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateOwner(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteOwner();
        }
        setIsModalOpen(false);
    };

    const handleTableChange = (pagination) => {
        handleGetOwners(pagination.current, pagination.pageSize);
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

    const handleViewOwner = (record) => {
        setSelectedOwner(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <div className={cx('owner-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm chủ trọ" icon={<SearchOutlined/>}/>
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
                    <SmartButton title="Thêm" icon={<PlusOutlined/>} type="primary" onClick={handleAddOwner}/>
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('owner-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={ownerSource}
                        loading={loading}
                        pagination={pagination}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <>
                        <Row gutter={[16, 16]} className={cx('card-grid')}>
                            {ownerSource.map((Owner) => (
                                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={Owner.id}>
                                    {/*<OwnerCard*/}
                                    {/*    Owner={Owner}*/}
                                    {/*    onView={() => handleViewOwner(Owner)}*/}
                                    {/*    onEdit={() => handleEditOwner(Owner)}*/}
                                    {/*    onDelete={() => handleDeleteOwner(Owner)}*/}
                                    {/*/>*/}
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
                                onChange={(page, pageSize) => handleGetOwners(page, pageSize)}
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
                fields={modalMode === 'delete' ? [] : ownerModalFields}
                onSubmit={handleFormSubmit}
                initialValues={selectedOwner}
                isDeleteMode={modalMode === 'delete'}
                formInstance={form}
            />
        </div>
    );
}

export default Owner;
