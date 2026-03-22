import React, {useState, useEffect} from 'react';
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
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
import {Form, message, Row, Col, Segmented} from 'antd';
import {
    createBuilding,
    updateBuilding,
    deleteBuilding,
    getAllBuildingsByRole,
} from '~/service/admin/building';
import {getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {useAuth} from "~/routes/AuthContext";
import usePagination from '~/hooks/usePagination';

const cx = classNames.bind(styles);

function Building() {
    const [buildingSource, setBuildingSource] = useState([]);
    const [boardingHouseOptionSource, setBoardingHouseOptionSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const {
        pagination,
        handleChange: handlePaginationChange,
        setTotal: setPaginationTotal,
    } = usePagination({ initialPageSize: 10 });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    const {data: quota} = useOwnerQuota();
    const invalidateQuota = useInvalidateQuota();

    const { user } = useAuth();
    const isOwner = user?.isOwner || false;

    const current = quota?.currentBuildings ?? 0;
    const max = quota?.maxBuildings ?? 0;
    const addButtonText = isOwner ? `Thêm (${current}/${max})` : 'Thêm';
    const isAddDisabled = isOwner && current >= max;

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
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEditBuilding(record)}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDeleteBuilding(record)}
                        style={{marginLeft: '8px'}}
                    />
                </>
            ),
        },
    ];

    const buildingModalFields = [
        {
            label: 'Tên tòa nhà',
            name: 'name',
            type: 'text',
            rules: [{required: true, message: 'Tên tòa nhà là bắt buộc!'}],
        },
        {
            label: 'Khu nhà trọ',
            name: 'boardingHouseId',
            type: 'select',
            options: boardingHouseOptionSource,
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
    }, []);

    const handleGetAllBoardingHouses = async () => {
        try {
            const response = await getAllBoardingHousesNoPaged();
            const mapped = response.map((item) => ({
                value: item.id,
                label: item.name,
            }));
            setBoardingHouseOptionSource(mapped);
        } catch (error) {
            console.error('Error fetching boarding houses:', error);
            setBoardingHouseOptionSource([]);
        }
    };

    const handleGetBuildings = async (page = pagination.current, pageSize = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await getAllBuildingsByRole({page: page - 1, pageSize});
            if (response?.content) {
                setBuildingSource(response.content);
                setPaginationTotal(response.totalElements || 0);
            } else {
                setBuildingSource([]);
                setPaginationTotal(0);
                message.error('Dữ liệu tòa nhà không hợp lệ');
            }
        } catch (error) {
            message.error(`Lỗi khi lấy danh sách tòa nhà: ${error.response?.data?.message || error.message}`);
            setBuildingSource([]);
            setPaginationTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetBuildings();
    }, [pagination.current, pagination.pageSize]);

    const handleAddBuilding = () => {
        if (isAddDisabled) {
            message.warning('Bạn đã đạt giới hạn số tòa nhà theo gói hiện tại. Vui lòng nâng cấp gói!');
            return;
        }
        setModalMode('create');
        setSelectedBuilding(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateBuilding = async (formData) => {
        try {
            await createBuilding(formData);
            invalidateQuota();           // Refetch quota ngay
            handleGetBuildings();        // Refetch danh sách building
            setIsModalOpen(false);
            message.success('Thêm tòa nhà thành công!');
        } catch (error) {
            message.error(`Lỗi khi tạo tòa nhà: ${error.response?.data?.message || error.message}`);
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
            message.success('Cập nhật tòa nhà thành công!');
        } catch (error) {
            message.error(`Lỗi khi cập nhật tòa nhà: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteBuilding = (record) => {
        setModalMode('delete');
        setSelectedBuilding(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteBuilding = async () => {
        try {
            await deleteBuilding(selectedBuilding.id);
            invalidateQuota();           // Refetch quota sau khi xóa
            handleGetBuildings();
            setIsModalOpen(false);
            message.success('Xóa tòa nhà thành công!');
        } catch (error) {
            message.error(`Lỗi khi xóa tòa nhà: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'create') {
            handleCallCreateBuilding(formData);
        } else if (modalMode === 'edit') {
            handleCallUpdateBuilding(formData);
        } else if (modalMode === 'delete') {
            handleCallDeleteBuilding();
        }
    };

    const handleTableChange = (newPagination) => {
        handlePaginationChange(newPagination.current, newPagination.pageSize);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create':
                return 'Thêm tòa nhà mới';
            case 'edit':
                return 'Chỉnh sửa tòa nhà';
            case 'delete':
                return 'Xóa tòa nhà';
            default:
                return 'Chi tiết tòa nhà';
        }
    };

    return (
        <div className={cx('building-wrapper')}>
            {/* Header */}
            <div className={cx('sub_header')}>
                <SmartInput size="large" placeholder="Tìm kiếm tòa nhà" icon={<SearchOutlined/>}/>
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
                        onClick={handleAddBuilding}
                        disabled={isAddDisabled}
                        tooltip={isAddDisabled ? 'Đã đạt giới hạn – nâng cấp gói để thêm' : undefined}
                    />

                    <SmartButton title="Bộ lọc" icon={<FilterOutlined/>}/>
                    <SmartButton title="Excel" icon={<CloudUploadOutlined/>}/>
                    <AppPagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        pageSizeOptions={['6', '12', '24']}
                        onChange={handlePaginationChange}
                        showTotal={(total, range) => `Đang xem ${range[0]}-${range[1]} trong ${total} tòa nhà`}
                    />
                </div>
            </div>

            {/* Nội dung */}
            <div className={cx('building-container')}>
                {viewMode === 'table' ? (
                    <SmartTable
                        columns={columns}
                        dataSources={buildingSource}
                        loading={loading}
                        pagination={false}
                        onTableChange={handleTableChange}
                    />
                ) : (
                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                        {buildingSource.map((building) => (
                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={building.id}>
                                <BuildingCard
                                    building={building}
                                    // onView={() => handleViewBuilding(building)}
                                    onEdit={() => handleEditBuilding(building)}
                                    onDelete={() => handleDeleteBuilding(building)}
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
