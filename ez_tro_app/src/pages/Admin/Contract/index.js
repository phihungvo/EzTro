import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import moment from 'moment';
import styles from '~/pages/Admin/Contract/Contract.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import ContractCard from '~/components/Layout/AdminLayout/components/ContractCard';
import ContractFileUploadModal from '~/components/Layout/AdminLayout/components/ContractFileUploadModal';
import ContractFileListModal from '~/components/Layout/AdminLayout/components/ContractFileListModal';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
    TableOutlined,
    AppstoreOutlined,
    CloseCircleOutlined,
    UploadOutlined,
    FileTextOutlined,
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
import {
    getAllContracts,
    filterContracts,
    createContract,
    updateContract,
    deleteContract,
} from '~/service/admin/contract';
import {getAllRoomNoPaged, getRoomsByBoardingHouse} from "~/service/admin/room";
import {getAllTenantNoPaged} from "~/service/admin/tenant";
import useDebounce from '~/hooks/useDebounce';
import dayjs from 'dayjs';
import {getAllBoardingHousesNoPaged} from "~/service/admin/boarding_house";

const cx = classNames.bind(styles);
const {RangePicker} = DatePicker;

function Contract() {
    const [contractSource, setContractSource] = useState([]);
    const [roomOptions, setRoomOptions] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [boardingHouseOptions, setBoardingHouseOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modalMode, setModalMode] = useState('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();

    // State cho modal upload file
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedContractForUpload, setSelectedContractForUpload] = useState(null);

    const [isFileListModalOpen, setIsFileListModalOpen] = useState(false);
    const [selectedContractForViewFiles, setSelectedContractForViewFiles] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [dateRange, setDateRange] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [boardingHouseFilter, setBoardingHouseFilter] = useState(null);
    const [roomFilter, setRoomFilter] = useState(null);
    const [roomsLoading, setRoomsLoading] = useState(false);

    const [statistics, setStatistics] = useState({
        active: 0,
        expired: 0,
        cancelled: 0,
    });

    const disabledWhenEdit = modalMode === 'edit';

    const getStatusTag = (status) => {
        const statusConfig = {
            'ACTIVE': {color: 'success', text: 'Đang hiệu lực'},
            'CANCELLED': {color: 'warning', text: 'Đã chấm dứt'},
            'EXPIRED': {color: 'error', text: 'Hết hạn'},
        };
        const config = statusConfig[status] || {color: 'default', text: status};
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const handleViewFileList = (contract) => {
        setSelectedContractForViewFiles(contract);
        setIsFileListModalOpen(true);
    };

    const calculateStatistics = (data) => {
        const stats = {
            active: 0,
            expired: 0,
            cancelled: 0,
        };

        data.forEach(item => {
            switch (item.status) {
                case 'ACTIVE':
                    stats.active++;
                    break;
                case 'EXPIRED':
                    stats.expired++;
                    break;
                case 'CANCELLED':
                    stats.cancelled++;
                    break;
                default:
                    break;
            }
        });

        setStatistics(stats);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setDateRange(null);
        setStatusFilter('ALL');
        setBoardingHouseFilter(null);
        setRoomFilter(null);
        setRoomOptions([]);
        setPagination(prev => ({...prev, current: 1}));
        message.success('Đã reset bộ lọc!');
    };

    const columns = [
        {
            title: 'Mã hợp đồng',
            dataIndex: 'contractCode',
            key: 'contractCode',
            width: 150,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Mã phòng',
            dataIndex: 'roomId',
            key: 'roomId',
            width: 100,
            fixed: 'left',
            align: 'center',
        },
        {
            title: 'Số phòng',
            dataIndex: 'roomNumber',
            key: 'roomNumber',
            width: 100,
            align: 'center',
        },
        {
            title: 'Người thuê',
            dataIndex: 'tenantFullName',
            key: 'tenantFullName',
            width: 150,
            align: 'center',
        },
        {
            title: 'Thời hạn hợp đồng',
            dataIndex: 'contractDuration',
            key: 'contractDuration',
            width: 250,
            align: 'center',
            render: (_, record) => {
                const start = record.startDate ? new Date(record.startDate).toLocaleDateString('vi-VN') : 'N/A';
                const end = record.endDate ? new Date(record.endDate).toLocaleDateString('vi-VN') : 'N/A';
                return (
                    <div className={cx('date-range')}>
                        <span className={cx('date-start')}>{start}</span>
                        <span className={cx('date-arrow')}>→</span>
                        <span className={cx('date-end')}>{end}</span>
                    </div>
                );
            }
        },
        {
            title: 'Trạng thái hợp đồng',
            dataIndex: 'status',
            key: 'status',
            width: 180,
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Tiền cọc (VNĐ)',
            dataIndex: 'deposit',
            key: 'deposit',
            width: 150,
            align: 'center',
            render: (value) =>
                value != null ? (
                    <span className={cx('salary-value')}>
                        {value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                    </span>
                ) : 'N/A',
        },
        {
            title: 'Giá thuê (VNĐ/tháng)',
            dataIndex: 'rentPrice',
            key: 'rentPrice',
            width: 200,
            align: 'center',
            render: (value) =>
                value != null ? (
                    <span className={cx('salary-value')}>
                        {value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                    </span>
                ) : 'N/A',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            width: 200,
            render: (date) =>
                date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'center',
            width: 200,
            render: (date) =>
                date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
        },
        {
            title: 'Số file',
            dataIndex: 'fileCount',
            key: 'fileCount',
            width: 120,
            align: 'center',
            render: (fileCount, record) => (
                <div
                    className={cx('file-count-wrapper')}
                    onClick={() => handleViewFileList(record)}
                    title="Click để xem danh sách file"
                >
                    <FileTextOutlined className={cx('file-icon')}/>
                    <span className={cx('file-number')}>
                        {fileCount || 0}
                    </span>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            fixed: 'right',
            width: 160,
            align: 'center',
            render: (_, record) => (
                <>
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEditContract(record)}
                    />
                    <SmartButton
                        type="success"
                        icon={<UploadOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleUploadContract(record)}
                        style={{marginLeft: '8px'}}
                    />
                    <SmartButton
                        type="danger"
                        icon={<DeleteOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleDeleteContract(record)}
                        style={{marginLeft: '8px'}}
                    />
                </>
            ),
        },
    ];

    const contractModalFields = [
        {
            label: 'Phòng trọ',
            name: 'roomId',
            type: 'select',
            options: roomOptions,
            disabled: disabledWhenEdit
        },
        {
            label: 'Người thuê',
            name: 'tenantId',
            type: 'select',
            options: tenantOptions,
            disabled: disabledWhenEdit
        },
        {
            label: 'Ngày bắt đầu',
            name: 'startDate',
            type: 'date',
            render: () => (
                <DatePicker format="DD/MM/YYYY" style={{width: '100%'}}/>
            ),
        },
        {
            label: 'Ngày kết thúc',
            name: 'endDate',
            type: 'date',
            render: () => (
                <DatePicker format="DD/MM/YYYY" style={{width: '100%'}}/>
            ),
        },
        {
            label: 'Tiền cọc (VNĐ)',
            name: 'deposit',
            type: 'number',
        },
        {
            label: 'Giá thuê (VNĐ/tháng)',
            name: 'rentPrice',
            type: 'number',
        },
        {
            label: 'Trạng thái hợp đồng',
            name: 'status',
            type: 'select',
            options: [
                {label: 'Đang hiệu lực', value: 'ACTIVE'},
                {label: 'Đã hết hạn', value: 'EXPIRED'},
                {label: 'Đã hủy', value: 'CANCELLED'},
            ],
        },
        {
            label: 'Ghi chú',
            name: 'note',
            type: 'textarea',
        },
    ];

    const loadRoomsForBoardingHouse = async (boardingHouseId) => {
        if (!boardingHouseId) {
            setRoomOptions([]);
            return;
        }
        setRoomsLoading(true);
        try {
            const rooms = await getRoomsByBoardingHouse(boardingHouseId);
            if (rooms && Array.isArray(rooms)) {
                const roomOpts = rooms.map((room) => ({
                    label: `${room.id} - ${room.roomNumber || 'N/A'}`,
                    value: room.id,
                }));
                setRoomOptions(roomOpts);
            } else {
                setRoomOptions([]);
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            setRoomOptions([]);
        } finally {
            setRoomsLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        loadRoomsForBoardingHouse(boardingHouseFilter);
        // Clear room filter when boarding house changes to avoid invalid selection
        setRoomFilter(null);
    }, [boardingHouseFilter]);

    const fetchOptions = async () => {
        try {
            // Fetch boarding houses first
            const boardingHouseResponse = await getAllBoardingHousesNoPaged();
            if (boardingHouseResponse && Array.isArray(boardingHouseResponse)) {
                const boardingHouses = boardingHouseResponse.map((bh) => ({
                    label: bh.name,
                    value: bh.id,
                }));
                setBoardingHouseOptions(boardingHouses);
            }

            // Fetch tenants (unchanged)
            const tenantResponse = await getAllTenantNoPaged();
            if (tenantResponse && Array.isArray(tenantResponse)) {
                const tenants = tenantResponse.map((tenant) => ({
                    label: `${tenant.userId} - ${tenant.fullName}`,
                    value: tenant.id,
                }));
                setTenantOptions(tenants);
            }

            // Note: Rooms are now loaded dynamically via loadRoomsForBoardingHouse
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleFilterContracts = async () => {
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

            if (statusFilter !== 'ALL') {
                params.status = statusFilter;
            }

            // New params
            if (boardingHouseFilter) {
                params.boardingHouseId = boardingHouseFilter;
            }

            if (roomFilter) {
                params.roomId = roomFilter;
            }

            const response = await filterContracts(params);

            if (response && Array.isArray(response.content)) {
                setContractSource(response.content);
                setPagination({
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: response.totalElements,
                });
                calculateStatistics(response.content);
            } else {
                setContractSource([]);
                setStatistics({active: 0, expired: 0, cancelled: 0});
            }
        } catch (error) {
            console.error('Error filtering contracts:', error);
            message.error(`Lỗi khi lọc hợp đồng: ${error.response?.data?.message || error.message}`);
            setContractSource([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPagination(prev => ({...prev, current: 1}));
        handleFilterContracts();
    }, [debouncedSearchTerm, dateRange, statusFilter, boardingHouseFilter, roomFilter]);

    useEffect(() => {
        handleFilterContracts();
    }, [pagination.current, pagination.pageSize]);

    const handleAddContract = () => {
        setModalMode('create');
        setSelectedContract(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallCreateContract = async (formData) => {
        try {
            await createContract(formData);
            handleFilterContracts();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi tạo hợp đồng: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleEditContract = (record) => {
        setSelectedContract(record);
        setModalMode('edit');
        const formValues = {
            ...record,
            startDate: record.startDate ? moment(record.startDate) : null,
            endDate: record.endDate ? moment(record.endDate) : null,
        };
        form.setFieldsValue(formValues);
        setIsModalOpen(true);
    };

    const handleCallUpdateContract = async (formData) => {
        try {
            await updateContract(selectedContract.id, formData);
            handleFilterContracts();
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật hợp đồng: ${
                    error.response?.data?.message || error.message
                }`,
            );
        }
    };

    const handleDeleteContract = (record) => {
        setModalMode('delete');
        setSelectedContract(record);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCallDeleteContract = async () => {
        try {
            await deleteContract(selectedContract.id);
            handleFilterContracts();
            setIsModalOpen(false);
        } catch (error) {
            message.error(`Lỗi khi xóa hợp đồng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleUploadContract = (record) => {
        setSelectedContractForUpload(record);
        setIsUploadModalOpen(true);
    };

    const handleFormSubmit = (formData) => {
        const submitData = {
            ...formData,
            startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : null,
            endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : null,
        };

        if (modalMode === 'create') {
            handleCallCreateContract(submitData);
        } else if (modalMode === 'edit') {
            handleCallUpdateContract(submitData);
        } else if (modalMode === 'delete') {
            handleCallDeleteContract();
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
                return 'Thêm hợp đồng mới';
            case 'edit':
                return 'Chỉnh sửa hợp đồng';
            case 'delete':
                return 'Xóa hợp đồng';
            default:
                return 'Chi tiết hợp đồng';
        }
    };

    const handleViewContract = (record) => {
        setSelectedContract(record);
        setModalMode('view');
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handlePaginationChange = (page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize,
        }));
    };

    const handleViewModeChange = (value) => {
        setViewMode(value);
    };

    return (
        <ConfigProvider>
            <div className={cx('contract-wrapper')}>
                <div className={cx('filter-section')}>
                    <Space direction="vertical" size="middle" className={cx('filter-space')}>
                        <div className={cx('filter-inputs')}>
                            <SmartInput
                                size="large"
                                placeholder="Tìm kiếm..."
                                icon={<SearchOutlined/>}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cx('search-input')}
                                inputWidth={230}
                            />
                            <RangePicker
                                size="large"
                                placeholder={['Từ ngày', 'Đến ngày']}
                                format="DD/MM/YYYY"
                                onChange={(dates) => setDateRange(dates)}
                                className={cx('date-picker')}
                                style={{ width: 270 }}
                            />
                            <Select
                                size="large"
                                placeholder="Lọc theo trạng thái"
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value)}
                                className={cx('status-select')}
                                options={[
                                    {value: 'ALL', label: 'Tất cả'},
                                    {value: 'ACTIVE', label: 'Đang hiệu lực'},
                                    {value: 'EXPIRED', label: 'Đã hết hạn'},
                                    {value: 'CANCELLED', label: 'Đã hủy'},
                                ]}
                            />
                            <Select
                                size="large"
                                placeholder="Chọn khu nhà trọ"
                                value={boardingHouseFilter}
                                onChange={(value) => setBoardingHouseFilter(value)}
                                className={cx('boarding-house-select')}
                                allowClear
                                options={boardingHouseOptions}
                                loading={roomsLoading}
                            />
                            <Select
                                size="large"
                                placeholder="Chọn phòng"
                                value={roomFilter}
                                onChange={(value) => setRoomFilter(value)}
                                className={cx('room-select')}
                                allowClear
                                options={roomOptions}
                                loading={roomsLoading}
                                disabled={!boardingHouseFilter}
                            />

                            <SmartButton
                                title="Reset"
                                type="default"
                                icon={<CloseCircleOutlined/>}
                                onClick={handleResetFilters}
                            />
                        </div>
                    </Space>
                </div>

                {/* Nội dung */}
                <div className={cx('contract-container')}>
                    <div className={cx('pagination-wrapper')}>
                        <div className={cx('left-actions')}>
                            <div className={cx('view-mode-toggle')}>
                                <Segmented
                                    options={[
                                        {
                                            label: (
                                                <>
                                                    <TableOutlined/>
                                                    Bảng
                                                </>
                                            ),
                                            value: 'table',
                                        },
                                        {
                                            label: (
                                                <>
                                                    <AppstoreOutlined/>
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
                                icon={<PlusOutlined/>}
                                type="primary"
                                onClick={handleAddContract}
                            />
                            <SmartButton
                                title="Excel"
                                icon={<CloudUploadOutlined/>}
                                onClick={() => message.info('Tính năng xuất Excel đang phát triển')}
                            />
                        </div>
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handlePaginationChange}
                            showSizeChanger
                            showTotal={(total) => `Tổng ${total} hợp đồng`}
                            pageSizeOptions={['10', '20', '30']}
                        />
                    </div>

                    {viewMode === 'table' ? (
                        <SmartTable
                            columns={columns}
                            dataSources={contractSource}
                            loading={loading}
                            pagination={false}
                            onTableChange={handleTableChange}
                        />
                    ) : (
                        <>
                            <Spin spinning={loading}>
                                {contractSource.length === 0 ? (
                                    <Empty description="Không có hợp đồng nào phù hợp với bộ lọc"/>
                                ) : (
                                    <Row gutter={[16, 16]} className={cx('card-grid')}>
                                        {contractSource.map((contract) => (
                                            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={contract.id}>
                                                <ContractCard
                                                    contract={contract}
                                                    onView={() => handleViewContract(contract)}
                                                    onEdit={() => handleEditContract(contract)}
                                                    onDelete={() => handleDeleteContract(contract)}
                                                />
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
                                                            <TableOutlined/>
                                                            Bảng
                                                        </>
                                                    ),
                                                    value: 'table',
                                                },
                                                {
                                                    label: (
                                                        <>
                                                            <AppstoreOutlined/>
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
                    fields={modalMode === 'delete' ? [] : contractModalFields}
                    onSubmit={handleFormSubmit}
                    initialValues={selectedContract}
                    isDeleteMode={modalMode === 'delete'}
                    formInstance={form}
                />

                <ContractFileUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    contractId={selectedContractForUpload?.id}
                    tenantName={selectedContractForUpload?.tenantFullName || 'N/A'}
                    onSuccess={() => {
                        handleFilterContracts();
                    }}
                />

                <ContractFileListModal
                    isOpen={isFileListModalOpen}
                    onClose={() => setIsFileListModalOpen(false)}
                    contract={selectedContractForViewFiles}
                />
            </div>
        </ConfigProvider>
    );
}

export default Contract;