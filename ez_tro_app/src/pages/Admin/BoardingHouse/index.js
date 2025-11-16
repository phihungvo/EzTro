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
import {Form, message, Row, Col, Pagination, Segmented} from 'antd';
import {exportExcelFile} from '~/service/admin/export_service';
import {
    getAllBoardingHouses,
    createBoardingHouse,
    updateBoardingHouse,
    deleteBoardingHouse
} from '~/service/admin/boarding_house';
import {getAllOwners} from "~/service/admin/user";

const cx = classNames.bind(styles);

function BoardingHouses() {
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [userOptionSource, setUserOptionSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
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
            title: 'Tên nhà trọ',
            dataIndex: 'address',
            key: 'address',
            align: 'center',
            width: 250,
        },
        {
            title: 'Số điện thoại liên hệ',
            dataIndex: 'contactPhone',
            key: 'contactPhone',
            align: 'center',
            width: 200,
        },
        {
            title: 'Số toà nhà',
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
            label: 'Số điện thoại liên hệ',
            name: 'contactPhone',
            type: 'text',
        },
        {
            label: 'Số toà nhà',
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
        handleGetBoardingHouses();
    }, []);

    const handleGetAllUsers = async () => {
        try {
            const response = await getAllOwners();
            const mappedUsers = response.map(usr => ({
                value: usr.id,
                label: usr.fullName,
            }));
            setUserOptionSource(mappedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUserOptionSource([]);
        }
    };

    const handleGetBoardingHouses = async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllBoardingHouses({page: page - 1, pageSize});

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

    const handleCallCreateBoardingHouse = async (formData) => {
        try {
            await createBoardingHouse(formData);
            handleGetBoardingHouses();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
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
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật khu nhà: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteBoardingHouses = (record) => {
        setModalMode('delete');
        setSelectedBoardingHouses(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteBoardingHouse = async () => {
        await deleteBoardingHouse(selectedBoardingHouses.id);
        handleGetBoardingHouses();
        setIsModalOpen(false);
    };

    const handleExportFile = async () => {
        try {
            const response = await exportExcelFile('boarding_house');
            if (
                !response.headers['content-type'].includes(
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                )
            ) {
                throw new Error('Định dạng file không hợp lệ');
            }
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `employee_${new Date()
                    .toISOString()
                    .replace(/[-:]/g, '')}.xlsx`,
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
                    <SmartButton title="Thêm" icon={<PlusOutlined/>} type="primary" onClick={handleAddBoardingHouses}/>
                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton
                        title="Excel"
                        icon={<CloudUploadOutlined/>}
                        onClick={handleExportFile}/>
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
