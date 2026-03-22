import dayjs from 'dayjs';
import React, {useState, useEffect, useCallback} from 'react';
import classNames from 'classnames/bind';
import {useLocation, useNavigate} from 'react-router-dom';
// import moment from 'moment';
import styles from '~/pages/Admin/Contract/Contract.module.scss';
import SmartTable from '~/components/Layout/AdminLayout/components/SmartTable';
import ContractCard from '~/components/Layout/AdminLayout/components/ContractCard';
import ContractFileUploadModal from '~/components/Layout/AdminLayout/components/ContractFileUploadModal';
import ContractFileListModal from '~/components/Layout/AdminLayout/components/ContractFileListModal';
import AppPagination from '~/components/Layout/AdminLayout/components/AppPagination';
// import ContractEditor from '~/pages/Admin/Contract/components/ContractEditor';
import {
    PlusOutlined,
    CloudUploadOutlined,
    EditOutlined,
    DeleteOutlined,
    TableOutlined,
    AppstoreOutlined,
    UploadOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import {
    Form,
    message,
    Row,
    Col,
    Segmented,
    Tag,
    Empty,
    Spin,
    ConfigProvider,
    Modal,
} from 'antd';
import {
    filterContracts,
    createContract,
    updateContract,
    deleteContract,
} from '~/service/admin/contract';
import {getAllRoomAvailable, getRoomsByBoardingHouse} from "~/service/admin/room";
import {getAllTenantNoPaged} from "~/service/admin/tenant";
import useDebounce from '~/hooks/useDebounce';
import usePagination from '~/hooks/usePagination';
import {getAllBoardingHousesNoPaged} from "~/service/admin/boarding_house";
import FilterComponent from "~/components/Layout/AdminLayout/components/FilterComponent";

const cx = classNames.bind(styles);

function Contract() {
    const navigate = useNavigate();
    const location = useLocation();
    const contractBasePath = location.pathname.startsWith('/admin') ? '/admin/contracts' : '/owner/contracts';
    const [contractSource, setContractSource] = useState([]);
    const [roomOptions, setRoomOptions] = useState([]);
    const [roomCatalog, setRoomCatalog] = useState([]);
    const [tenantCatalog, setTenantCatalog] = useState([]);
    const [boardingHouseOptions, setBoardingHouseOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editorSubmitting, setEditorSubmitting] = useState(false);
    const {
        pagination,
        handleChange: handlePaginationChange,
        reset: resetPagination,
        setTotal: setPaginationTotal,
    } = usePagination({ initialPageSize: 10 });
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

    const getStatusTag = (status) => {
        const statusConfig = {
            'ACTIVE': {color: 'success', text: 'Đang hiệu lực'},
            'PENDING': {color: 'processing', text: 'Sắp hiệu lực'},
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

    const handleResetFilters = () => {
        setSearchTerm('');
        setDateRange(null);
        setStatusFilter('ALL');
        setBoardingHouseFilter(null);
        setRoomFilter(null);
        setRoomOptions([]);
        resetPagination();
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
        setRoomFilter(null);
    }, [boardingHouseFilter]);

    const fetchOptions = async () => {
        try {
            const boardingHouseResponse = await getAllBoardingHousesNoPaged();
            if (boardingHouseResponse && Array.isArray(boardingHouseResponse)) {
                const boardingHouses = boardingHouseResponse.map((bh) => ({
                    label: bh.name,
                    value: bh.id,
                }));
                setBoardingHouseOptions(boardingHouses);
            }

            const tenantResponse = await getAllTenantNoPaged();
            if (tenantResponse && Array.isArray(tenantResponse)) {
                setTenantCatalog(tenantResponse);
            }

        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleFilterContracts = useCallback(async () => {
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
                setPaginationTotal(response.totalElements || 0);
            } else {
                setContractSource([]);
                setPaginationTotal(0);
            }
        } catch (error) {
            console.error('Error filtering contracts:', error);
            message.error(`Lỗi khi lọc hợp đồng: ${error.response?.data?.message || error.message}`);
            setContractSource([]);
            setPaginationTotal(0);
        } finally {
            setLoading(false);
        }
    }, [
        pagination.current,
        pagination.pageSize,
        debouncedSearchTerm,
        dateRange,
        statusFilter,
        boardingHouseFilter,
        roomFilter,
        setPaginationTotal,
    ]);

    useEffect(() => {
        if (pagination.current !== 1) {
            resetPagination();
            return;
        }
        handleFilterContracts();
    }, [
        debouncedSearchTerm,
        dateRange,
        statusFilter,
        boardingHouseFilter,
        roomFilter,
        pagination.current,
        pagination.pageSize,
        handleFilterContracts,
        resetPagination,
    ]);

    const loadAllRoomsAvailability = async () => {
        try {
            const rooms = await getAllRoomAvailable();
            if (rooms && Array.isArray(rooms)) {
                setRoomCatalog(rooms);
            }
        } catch (error) {
            console.error("Error loading all rooms:", error);
            setRoomCatalog([]);
        }
    };

    const buildFallbackRoomFromContract = (contract) => ({
        id: contract.roomId,
        roomNumber: contract.roomNumber,
        boardingHouseName: contract.boardingHouseName,
        price: contract.rentPrice,
        floorNumber: null,
        maxOccupants: null,
    });

    const buildFallbackTenantFromContract = (contract) => ({
        id: contract.tenantId,
        fullName: contract.tenantFullName || contract.tenantName,
        phoneNumber: null,
        email: null,
        identityNumber: null,
        occupation: null,
    });

    const ensureEditorEntities = (contract) => {
        if (!contract) {
            return;
        }

        setRoomCatalog(prev => prev.some((item) => item.id === contract.roomId)
            ? prev
            : [...prev, buildFallbackRoomFromContract(contract)]);
        setTenantCatalog(prev => prev.some((item) => item.id === contract.tenantId)
            ? prev
            : [...prev, buildFallbackTenantFromContract(contract)]);
    };

    const handleAddContract = async () => {
        navigate(`${contractBasePath}/create-contract`);
    };

    const handleCallCreateContract = async (formData) => {
        setEditorSubmitting(true);
        try {
            await createContract(formData);
            await handleFilterContracts();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error(
                `Lỗi khi tạo hợp đồng: ${
                    error.response?.data?.message || error.message
                }`,
            );
        } finally {
            setEditorSubmitting(false);
        }
    };

    const handleEditContract = async (record) => {
        setSelectedContract(record);
        setModalMode('edit');
        await loadAllRoomsAvailability();
        ensureEditorEntities(record);
        const formValues = {
            ...record,
            startDate: record.startDate ? dayjs(record.startDate) : null,
            endDate: record.endDate ? dayjs(record.endDate) : null,
            depositReceivedAt: record.depositReceivedAt ? dayjs(record.depositReceivedAt) : null,
            paymentCycleMonths: record.paymentCycleMonths || 1,
        };
        form.setFieldsValue(formValues);
        setIsModalOpen(true);
    };

    const handleCallUpdateContract = async (formData) => {
        setEditorSubmitting(true);
        try {
            await updateContract(selectedContract.id, formData);
            await handleFilterContracts();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error(
                `Lỗi khi cập nhật hợp đồng: ${
                    error.response?.data?.message || error.message
                }`,
            );
        } finally {
            setEditorSubmitting(false);
        }
    };

    const handleDeleteContract = (record) => {
        Modal.confirm({
            title: 'Xóa hợp đồng',
            content: `Bạn có chắc muốn xóa hợp đồng ${record.contractCode || ''} của phòng ${record.roomNumber || ''}?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: {danger: true},
            onOk: async () => {
                try {
                    await deleteContract(record.id);
                    await handleFilterContracts();
                } catch (error) {
                    message.error(`Lỗi khi xóa hợp đồng: ${error.response?.data?.message || error.message}`);
                }
            },
        });
    };

    const handleUploadContract = (record) => {
        setSelectedContractForUpload(record);
        setIsUploadModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        const submitData = {
            ...formData,
            startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : null,
            endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : null,
            depositReceivedAt: formData.depositReceivedAt ? formData.depositReceivedAt.format('YYYY-MM-DD') : null,
        };

        if (modalMode === 'create') {
            await handleCallCreateContract(submitData);
        } else if (modalMode === 'edit') {
            await handleCallUpdateContract(submitData);
        }
    };

    const handleTableChange = (pagination) => {
        handlePaginationChange(pagination.current, pagination.pageSize);
    };

    const handleViewContract = async (record) => {
        setSelectedContract(record);
        setModalMode('view');
        await loadAllRoomsAvailability();
        ensureEditorEntities(record);
        form.setFieldsValue({
            ...record,
            startDate: record.startDate ? dayjs(record.startDate) : null,
            endDate: record.endDate ? dayjs(record.endDate) : null,
            depositReceivedAt: record.depositReceivedAt ? dayjs(record.depositReceivedAt) : null,
            paymentCycleMonths: record.paymentCycleMonths || 1,
        });
        setIsModalOpen(true);
    };

    const handleEditorClose = () => {
        setIsModalOpen(false);
        setSelectedContract(null);
        form.resetFields();
    };

    const handleViewModeChange = (value) => {
        setViewMode(value);
    };

    return (
        <ConfigProvider>
            <div className={cx('contract-wrapper')}>
                <FilterComponent
                    fields={[
                        {
                            type: 'search',
                            name: 'search',
                            placeholder: 'Tìm kiếm...',
                            value: searchTerm,
                            onChange: setSearchTerm,
                        },
                        {
                            type: 'dateRange',
                            name: 'dateRange',
                            placeholder: ['Từ ngày', 'Đến ngày'],
                            value: dateRange,
                            onChange: setDateRange,
                        },
                        {
                            type: 'select',
                            name: 'status',
                            placeholder: 'Lọc theo trạng thái',
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { value: 'ALL', label: 'Tất cả' },
                                { value: 'ACTIVE', label: 'Đang hiệu lực' },
                                { value: 'PENDING', label: 'Sắp hiệu lực' },
                                { value: 'EXPIRED', label: 'Đã hết hạn' },
                                { value: 'CANCELLED', label: 'Đã hủy' },
                            ],
                        },
                        {
                            type: 'select',
                            name: 'boardingHouse',
                            placeholder: 'Chọn khu nhà trọ',
                            value: boardingHouseFilter,
                            onChange: setBoardingHouseFilter,
                            options: boardingHouseOptions,
                            loading: roomsLoading,
                            allowClear: true,
                        },
                        {
                            type: 'select',
                            name: 'room',
                            placeholder: 'Chọn phòng',
                            value: roomFilter,
                            onChange: setRoomFilter,
                            options: roomOptions,
                            loading: roomsLoading,
                            disabled: !boardingHouseFilter,
                            allowClear: true,
                        },
                    ]}
                    onReset={handleResetFilters}
                    gridTemplate="230px 270px 1fr 1fr 1fr auto"
                />

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
                        <AppPagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handlePaginationChange}
                            showTotal={(total, range) => `Đang xem ${range[0]}-${range[1]} trong ${total} hợp đồng`}
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
                        </>
                    )}
                </div>

                {/*<ContractEditor*/}
                {/*    open={isModalOpen && modalMode !== 'delete'}*/}
                {/*    mode={modalMode}*/}
                {/*    form={form}*/}
                {/*    onClose={handleEditorClose}*/}
                {/*    onSubmit={handleFormSubmit}*/}
                {/*    onEditRequest={() => setModalMode('edit')}*/}
                {/*    submitting={editorSubmitting}*/}
                {/*    roomCatalog={roomCatalog}*/}
                {/*    tenantCatalog={tenantCatalog}*/}
                {/*    selectedContract={selectedContract}*/}
                {/*/>*/}

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
