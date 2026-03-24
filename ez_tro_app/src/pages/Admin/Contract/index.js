import React, {useState, useEffect, useCallback} from 'react';
import classNames from 'classnames/bind';
import {useLocation, useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
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
    EyeOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import {
    message,
    Row,
    Col,
    Segmented,
    Tag,
    Empty,
    Spin,
    ConfigProvider,
    Modal,
    Button,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Checkbox,
} from 'antd';
import {
    filterContracts,
    deleteContract,
    getContractById,
    backfillContractFoundation,
    createContractAmendment,
    createContractBillingRule,
    deactivateContractBillingRule,
    createDepositTransaction,
    reviseContractAmendment,
    reviseContractBillingRule,
    finalizeContractSettlement,
    terminateContract,
    renewContract,
    markContractViolated,
    transferContractRoom,
} from '~/service/admin/contract';
import {getAllRoomAvailableByBoardingHouse, getRoomsByBoardingHouse} from "~/service/admin/room";
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
    const [boardingHouseOptions, setBoardingHouseOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const {
        pagination,
        handleChange: handlePaginationChange,
        reset: resetPagination,
        setTotal: setPaginationTotal,
    } = usePagination({ initialPageSize: 10 });
    const [viewMode, setViewMode] = useState('table');

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedContractForUpload, setSelectedContractForUpload] = useState(null);

    const [isFileListModalOpen, setIsFileListModalOpen] = useState(false);
    const [selectedContractForViewFiles, setSelectedContractForViewFiles] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedContractDetail, setSelectedContractDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [backfilling, setBackfilling] = useState(false);
    const [operationModalType, setOperationModalType] = useState(null);
    const [operationLoading, setOperationLoading] = useState(false);
    const [operationContext, setOperationContext] = useState(null);
    const [transferRoomOptions, setTransferRoomOptions] = useState([]);
    const [transferRoomsLoading, setTransferRoomsLoading] = useState(false);
    const [operationForm] = Form.useForm();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [dateRange, setDateRange] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [boardingHouseFilter, setBoardingHouseFilter] = useState(null);
    const [roomFilter, setRoomFilter] = useState(null);
    const [roomsLoading, setRoomsLoading] = useState(false);

    const formatCurrency = (value) => (
        value != null
            ? Number(value).toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})
            : 'N/A'
    );

    const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A');
    const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : 'N/A');
    const renderEffectivePeriod = (from, to) => (
        <div className={cx('effective-period')}>
            <span className={cx('effective-date')}>{from || 'Chưa xác định'}</span>
            <span className={cx('effective-arrow')}>→</span>
            <span className={cx('effective-date', {muted: !to})}>{to || 'Không thời hạn'}</span>
        </div>
    );
    const utilityOptions = (selectedContractDetail?.utilities || []).map((utility) => ({
        label: utility.name,
        value: utility.utilityId,
    }));

    const getBillingCycleLabel = (value) => ({
        DAILY: 'Hàng ngày',
        WEEKLY: 'Hàng tuần',
        MONTHLY: 'Hàng tháng',
    }[value] || value || 'N/A');

    const getCalculationTypeLabel = (value) => ({
        FIXED: 'Cố định',
        USAGE_BASED: 'Theo tiêu thụ',
        PER_PERSON: 'Theo người',
        PER_VEHICLE: 'Theo phương tiện',
    }[value] || value || 'N/A');

    const getAmendmentTypeLabel = (value) => ({
        PRICE_CHANGE: 'Điều chỉnh giá',
        ADD_OCCUPANT: 'Thêm người ở',
        REMOVE_OCCUPANT: 'Giảm người ở',
        SERVICE_OVERRIDE: 'Điều chỉnh dịch vụ',
        PAYMENT_TERM_CHANGE: 'Điều chỉnh kỳ thanh toán',
        PENALTY_POLICY_CHANGE: 'Điều chỉnh chính sách phạt',
        NOTICE_PERIOD_CHANGE: 'Điều chỉnh thời hạn báo trước',
    }[value] || value || 'N/A');

    const getDepositTransactionTypeLabel = (value) => ({
        COLLECT: 'Thu cọc',
        ADJUST_IN: 'Điều chỉnh tăng',
        ADJUST_OUT: 'Điều chỉnh giảm',
        DEDUCT_FOR_DAMAGE: 'Khấu trừ hư hại',
        DEDUCT_FOR_UNPAID_INVOICE: 'Khấu trừ công nợ',
        TRANSFER_OUT: 'Chuyển ra',
        TRANSFER_IN: 'Chuyển vào',
        REFUND: 'Hoàn cọc',
    }[value] || value || 'N/A');

    const getReferenceTypeLabel = (value) => ({
        INVOICE: 'Hóa đơn',
        MAINTENANCE: 'Bảo trì',
        CONTRACT_TRANSFER: 'Chuyển hợp đồng',
        SETTLEMENT: 'Tất toán',
        MANUAL_ADJUSTMENT: 'Điều chỉnh tay',
    }[value] || value || 'N/A');

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

    const getLifecycleStateLabel = (value) => ({
        DRAFT: 'Bản nháp',
        PENDING: 'Sắp hiệu lực',
        ACTIVE: 'Đang hiệu lực',
        EXPIRING: 'Sắp hết hạn',
        TERMINATION_PENDING: 'Chờ chấm dứt',
        TERMINATED: 'Đã kết thúc',
        VIOLATED: 'Đã ghi nhận vi phạm',
        RENEWED: 'Vừa gia hạn',
    }[value] || value || 'N/A');

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
                        type="default"
                        icon={<EyeOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleViewContract(record)}
                    />
                    <SmartButton
                        type="primary"
                        icon={<EditOutlined/>}
                        buttonWidth={40}
                        onClick={() => handleEditContract(record)}
                        style={{marginLeft: '8px'}}
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

    const handleAddContract = async () => {
        navigate(`${contractBasePath}/create-contract`);
    };

    const handleEditContract = async (record) => {
        navigate(`${contractBasePath}/${record.id}/edit`);
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

    const handleTableChange = (pagination) => {
        handlePaginationChange(pagination.current, pagination.pageSize);
    };

    const handleViewContract = async (record) => {
        setDetailLoading(true);
        setDetailModalOpen(true);
        try {
            await loadContractDetail(record.id);
        } catch (error) {
            setDetailModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const loadContractDetail = async (contractId) => {
        const detail = await getContractById(contractId);
        setSelectedContractDetail(detail);
        return detail;
    };

    const handleViewModeChange = (value) => {
        setViewMode(value);
    };

    const handleBackfillFoundation = async () => {
        setBackfilling(true);
        try {
            await backfillContractFoundation();
            await handleFilterContracts();
        } finally {
            setBackfilling(false);
        }
    };

    const openOperationModal = async (type, record = null) => {
        if (!selectedContractDetail?.id) {
            return;
        }

        if (type === 'billing-rule' && utilityOptions.length === 0) {
            message.warning('Hợp đồng chưa có utility để tạo billing rule');
            return;
        }

        operationForm.resetFields();
        setOperationContext(record);
        if (type === 'terminate') {
            operationForm.setFieldsValue({
                terminationDate: dayjs(),
            });
        }
        if (type === 'renew') {
            if (!selectedContractDetail.endDate) {
                message.warning('Chỉ gia hạn được hợp đồng có ngày kết thúc.');
                return;
            }
            const effectiveFrom = dayjs(selectedContractDetail.endDate).add(1, 'day');
            operationForm.setFieldsValue({
                effectiveFrom,
                newEndDate: effectiveFrom.add(Number(selectedContractDetail.paymentCycleMonths || 1), 'month').subtract(1, 'day'),
                newRentPrice: selectedContractDetail.rentPrice,
                newDepositAmount: selectedContractDetail.deposit,
                paymentCycleMonths: selectedContractDetail.paymentCycleMonths || 1,
                monthlyPaymentDay: selectedContractDetail.monthlyPaymentDay,
                autoRenew: selectedContractDetail.autoRenew ?? false,
            });
        }
        if (type === 'violate') {
            operationForm.setFieldsValue({
                reason: '',
                evidence: '',
            });
        }
        if (type === 'transfer-room') {
            operationForm.setFieldsValue({
                transferDate: dayjs(),
                transferDeposit: true,
                newRentPrice: selectedContractDetail.rentPrice,
                newDepositAmount: selectedContractDetail.deposit,
            });
            setTransferRoomsLoading(true);
            try {
                const rooms = await getAllRoomAvailableByBoardingHouse(selectedContractDetail.boardingHouseId);
                setTransferRoomOptions(
                    (rooms || [])
                        .filter((room) => room.id !== selectedContractDetail.roomId)
                        .map((room) => ({
                            label: `${room.roomNumber} - ${room.price ? formatCurrency(room.price) : 'N/A'}`,
                            value: room.id,
                        }))
                );
            } finally {
                setTransferRoomsLoading(false);
            }
        }
        if (record) {
            if (type === 'billing-rule-revise') {
                operationForm.setFieldsValue({
                    utilityId: record.utilityId,
                    cycle: record.cycle,
                    unitPrice: record.unitPrice,
                    calculationType: record.calculationType,
                    effectiveFrom: record.effectiveFrom ? dayjs(record.effectiveFrom) : null,
                    effectiveTo: record.effectiveTo ? dayjs(record.effectiveTo) : null,
                    note: record.note,
                });
            }

            if (type === 'amendment-revise') {
                operationForm.setFieldsValue({
                    amendmentType: record.amendmentType,
                    effectiveFrom: record.effectiveFrom ? dayjs(record.effectiveFrom) : null,
                    effectiveTo: record.effectiveTo ? dayjs(record.effectiveTo) : null,
                    note: record.note,
                    dataJson: record.dataJson,
                });
            }
        }
        setOperationModalType(type);
    };

    const closeOperationModal = () => {
        setOperationModalType(null);
        setOperationContext(null);
        setTransferRoomOptions([]);
        operationForm.resetFields();
    };

    const handleDeactivateBillingRule = (billingRuleId) => {
        Modal.confirm({
            title: 'Ngừng áp dụng billing rule',
            content: 'Billing rule sẽ được deactivate và vẫn giữ lịch sử audit.',
            okText: 'Ngừng áp dụng',
            cancelText: 'Hủy',
            onOk: async () => {
                await deactivateContractBillingRule(selectedContractDetail.id, billingRuleId);
                await loadContractDetail(selectedContractDetail.id);
                await handleFilterContracts();
            },
        });
    };

    const handleFinalizeSettlement = () => {
        if (!selectedContractDetail?.id) {
            return;
        }

        Modal.confirm({
            title: 'Chốt tất toán hợp đồng',
            content: 'Hệ thống sẽ khấu trừ công nợ còn mở từ tiền cọc, hoàn phần dư và chuyển hợp đồng sang đã hủy.',
            okText: 'Chốt tất toán',
            cancelText: 'Hủy',
            okButtonProps: {danger: true},
            onOk: async () => {
                await finalizeContractSettlement(selectedContractDetail.id);
                await loadContractDetail(selectedContractDetail.id);
                await handleFilterContracts();
            },
        });
    };

    const formatDateOnly = (value) => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        if (typeof value.format === 'function') return value.format('YYYY-MM-DD');
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
    };

    const formatIsoDateTime = (value) => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        if (typeof value.toISOString === 'function') return value.toISOString();
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed.toISOString() : null;
    };

    const handleSubmitOperation = async (values) => {
        if (!selectedContractDetail?.id) {
            return;
        }

        setOperationLoading(true);
        try {
            if (operationModalType === 'amendment') {
                const amendmentPayload = {
                    amendmentType: values.amendmentType,
                    effectiveFrom: formatDateOnly(values.effectiveFrom),
                    effectiveTo: formatDateOnly(values.effectiveTo),
                    price: values.price ?? null,
                    depositAmount: values.depositAmount ?? null,
                    paymentCycleMonths: values.paymentCycleMonths ?? null,
                    monthlyPaymentDay: values.monthlyPaymentDay ?? null,
                    dataJson: values.dataJson || null,
                    note: values.note || null,
                };
                if (!amendmentPayload.effectiveFrom) {
                    message.error('Vui lòng chọn ngày hiệu lực');
                    return;
                }
                await createContractAmendment(selectedContractDetail.id, amendmentPayload);
            }

            if (operationModalType === 'amendment-revise') {
                const amendmentPayload = {
                    amendmentType: values.amendmentType,
                    effectiveFrom: formatDateOnly(values.effectiveFrom),
                    effectiveTo: formatDateOnly(values.effectiveTo),
                    price: values.price ?? null,
                    depositAmount: values.depositAmount ?? null,
                    paymentCycleMonths: values.paymentCycleMonths ?? null,
                    monthlyPaymentDay: values.monthlyPaymentDay ?? null,
                    dataJson: values.dataJson || null,
                    note: values.note || null,
                };
                if (!amendmentPayload.effectiveFrom) {
                    message.error('Vui lòng chọn ngày hiệu lực');
                    return;
                }
                await reviseContractAmendment(selectedContractDetail.id, operationContext.id, amendmentPayload);
            }

            if (operationModalType === 'billing-rule') {
                const billingRulePayload = {
                    utilityId: values.utilityId,
                    cycle: values.cycle,
                    unitPrice: values.unitPrice,
                    calculationType: values.calculationType,
                    effectiveFrom: formatDateOnly(values.effectiveFrom),
                    effectiveTo: formatDateOnly(values.effectiveTo),
                    note: values.note || null,
                };
                if (!billingRulePayload.effectiveFrom) {
                    message.error('Vui lòng chọn ngày hiệu lực');
                    return;
                }
                await createContractBillingRule(selectedContractDetail.id, billingRulePayload);
            }

            if (operationModalType === 'billing-rule-revise') {
                const billingRulePayload = {
                    utilityId: values.utilityId,
                    cycle: values.cycle,
                    unitPrice: values.unitPrice,
                    calculationType: values.calculationType,
                    effectiveFrom: formatDateOnly(values.effectiveFrom),
                    effectiveTo: formatDateOnly(values.effectiveTo),
                    note: values.note || null,
                };
                if (!billingRulePayload.effectiveFrom) {
                    message.error('Vui lòng chọn ngày hiệu lực');
                    return;
                }
                await reviseContractBillingRule(selectedContractDetail.id, operationContext.id, billingRulePayload);
            }

            if (operationModalType === 'deposit-transaction') {
                await createDepositTransaction(selectedContractDetail.id, {
                    transactionType: values.transactionType,
                    amount: values.amount,
                    currency: values.currency || 'VND',
                    referenceType: values.referenceType || null,
                    referenceId: values.referenceId || null,
                    note: values.note || null,
                    occurredAt: formatIsoDateTime(values.occurredAt),
                });
            }

            if (operationModalType === 'terminate') {
                await terminateContract(selectedContractDetail.id, {
                    terminationDate: formatDateOnly(values.terminationDate),
                    note: values.note || null,
                });
            }

            if (operationModalType === 'renew') {
                const effectiveFrom = formatDateOnly(values.effectiveFrom);
                const newEndDate = formatDateOnly(values.newEndDate);
                if (!effectiveFrom || !newEndDate) {
                    message.error('Vui lòng chọn ngày hiệu lực và ngày kết thúc mới');
                    return;
                }
                await renewContract(selectedContractDetail.id, {
                    effectiveFrom,
                    newEndDate,
                    newRentPrice: values.newRentPrice ?? null,
                    newDepositAmount: values.newDepositAmount ?? null,
                    paymentCycleMonths: values.paymentCycleMonths ?? null,
                    monthlyPaymentDay: values.monthlyPaymentDay ?? null,
                    autoRenew: values.autoRenew ?? false,
                    note: values.note || null,
                });
            }

            if (operationModalType === 'violate') {
                await markContractViolated(selectedContractDetail.id, {
                    reason: values.reason,
                    evidence: values.evidence || null,
                });
            }

            if (operationModalType === 'transfer-room') {
                const transferDate = formatDateOnly(values.transferDate);
                if (!transferDate) {
                    message.error('Vui lòng chọn ngày chuyển');
                    return;
                }
                await transferContractRoom(selectedContractDetail.id, {
                    targetRoomId: values.targetRoomId,
                    transferDate,
                    transferDeposit: values.transferDeposit ?? false,
                    newRentPrice: values.newRentPrice ?? null,
                    newDepositAmount: values.newDepositAmount ?? null,
                    note: values.note || null,
                });
                setDetailModalOpen(false);
                setSelectedContractDetail(null);
            }

            if (operationModalType !== 'transfer-room') {
                await loadContractDetail(selectedContractDetail.id);
            }
            await handleFilterContracts();
            closeOperationModal();
        } finally {
            setOperationLoading(false);
        }
    };

    const renderOperationModalContent = () => {
        if (operationModalType === 'amendment' || operationModalType === 'amendment-revise') {
            return (
                <>
                    <Form.Item
                        name="amendmentType"
                        label="Loại phụ lục"
                        rules={[{required: true, message: 'Chọn loại phụ lục'}]}
                    >
                        <Select
                            options={[
                                {value: 'PRICE_CHANGE', label: 'Điều chỉnh giá'},
                                {value: 'ADD_OCCUPANT', label: 'Thêm người ở'},
                                {value: 'REMOVE_OCCUPANT', label: 'Giảm người ở'},
                                {value: 'SERVICE_OVERRIDE', label: 'Điều chỉnh dịch vụ'},
                                {value: 'PAYMENT_TERM_CHANGE', label: 'Điều chỉnh kỳ thanh toán'},
                                {value: 'PENALTY_POLICY_CHANGE', label: 'Điều chỉnh phạt'},
                                {value: 'NOTICE_PERIOD_CHANGE', label: 'Điều chỉnh thời hạn báo trước'},
                            ]}
                        />
                    </Form.Item>
                    <div className={cx('operation-grid')}>
                        <Form.Item
                            name="effectiveFrom"
                            label="Hiệu lực từ"
                            rules={[{required: true, message: 'Chọn ngày hiệu lực'}]}
                        >
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                        <Form.Item name="effectiveTo" label="Hiệu lực đến">
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <div className={cx('operation-grid')}>
                        <Form.Item name="price" label="Giá thuê mới">
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                        <Form.Item name="depositAmount" label="Tiền cọc mới">
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                    </div>
                    <div className={cx('operation-grid')}>
                        <Form.Item name="paymentCycleMonths" label="Chu kỳ thanh toán">
                            <InputNumber style={{width: '100%'}} min={1} />
                        </Form.Item>
                        <Form.Item name="monthlyPaymentDay" label="Ngày thu hàng tháng">
                            <InputNumber style={{width: '100%'}} min={1} max={28} />
                        </Form.Item>
                    </div>
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="dataJson" label="Payload JSON">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </>
            );
        }

        if (operationModalType === 'billing-rule' || operationModalType === 'billing-rule-revise') {
            return (
                <>
                    <div className={cx('operation-grid')}>
                        <Form.Item
                            name="utilityId"
                            label="Tiện ích"
                            rules={[{required: true, message: 'Chọn tiện ích'}]}
                        >
                            <Select options={utilityOptions} />
                        </Form.Item>
                        <Form.Item
                            name="cycle"
                            label="Chu kỳ"
                            initialValue="MONTHLY"
                            rules={[{required: true, message: 'Chọn chu kỳ'}]}
                        >
                            <Select options={[
                                {value: 'DAILY', label: 'Hàng ngày'},
                                {value: 'WEEKLY', label: 'Hàng tuần'},
                                {value: 'MONTHLY', label: 'Hàng tháng'},
                            ]} />
                        </Form.Item>
                    </div>
                    <div className={cx('operation-grid')}>
                        <Form.Item
                            name="unitPrice"
                            label="Đơn giá"
                            rules={[{required: true, message: 'Nhập đơn giá'}]}
                        >
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                        <Form.Item
                            name="calculationType"
                            label="Loại tính"
                            initialValue="FIXED"
                            rules={[{required: true, message: 'Chọn loại tính'}]}
                        >
                            <Select options={[
                                {value: 'FIXED', label: 'Cố định'},
                                {value: 'USAGE_BASED', label: 'Theo tiêu thụ'},
                                {value: 'PER_PERSON', label: 'Theo người'},
                                {value: 'PER_VEHICLE', label: 'Theo phương tiện'},
                            ]} />
                        </Form.Item>
                    </div>
                    <div className={cx('operation-grid')}>
                        <Form.Item
                            name="effectiveFrom"
                            label="Hiệu lực từ"
                            rules={[{required: true, message: 'Chọn ngày hiệu lực'}]}
                        >
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                        <Form.Item name="effectiveTo" label="Hiệu lực đến">
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </>
            );
        }

        if (operationModalType === 'terminate') {
            return (
                <>
                    <Form.Item
                        name="terminationDate"
                        label="Ngày chấm dứt"
                        rules={[{required: true, message: 'Chọn ngày chấm dứt'}]}
                    >
                        <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="note" label="Lý do / ghi chú">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </>
            );
        }

        if (operationModalType === 'renew') {
            return (
                <>
                    <div className={cx('operation-grid')}>
                        <Form.Item
                            name="effectiveFrom"
                            label="Hiệu lực từ"
                            rules={[{required: true, message: 'Chọn ngày hiệu lực'}]}
                        >
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                        <Form.Item
                            name="newEndDate"
                            label="Ngày kết thúc mới"
                            rules={[{required: true, message: 'Chọn ngày kết thúc mới'}]}
                        >
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <div className={cx('operation-grid')}>
                        <Form.Item name="newRentPrice" label="Giá thuê mới">
                            <InputNumber style={{width: '100%'}} min={1} />
                        </Form.Item>
                        <Form.Item name="newDepositAmount" label="Tiền cọc mới">
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                    </div>
                    <div className={cx('operation-grid')}>
                        <Form.Item name="paymentCycleMonths" label="Chu kỳ thanh toán (tháng)">
                            <InputNumber style={{width: '100%'}} min={1} max={12} />
                        </Form.Item>
                        <Form.Item name="monthlyPaymentDay" label="Ngày thu hàng tháng">
                            <InputNumber style={{width: '100%'}} min={1} max={28} />
                        </Form.Item>
                    </div>
                    <Form.Item name="autoRenew" valuePropName="checked">
                        <Checkbox>Duy trì tự gia hạn sau đợt renew này</Checkbox>
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú gia hạn">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </>
            );
        }

        if (operationModalType === 'violate') {
            return (
                <>
                    <Form.Item
                        name="reason"
                        label="Lý do vi phạm"
                        rules={[{required: true, message: 'Nhập lý do vi phạm'}]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="evidence" label="Bằng chứng / ghi chú">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </>
            );
        }

        if (operationModalType === 'transfer-room') {
            return (
                <>
                    <div className={cx('operation-grid')}>
                        <Form.Item
                            name="targetRoomId"
                            label="Phòng đích"
                            rules={[{required: true, message: 'Chọn phòng đích'}]}
                        >
                            <Select
                                loading={transferRoomsLoading}
                                options={transferRoomOptions}
                                placeholder="Chọn phòng trống"
                            />
                        </Form.Item>
                        <Form.Item
                            name="transferDate"
                            label="Ngày chuyển"
                            rules={[{required: true, message: 'Chọn ngày chuyển'}]}
                        >
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <div className={cx('operation-grid')}>
                        <Form.Item name="newRentPrice" label="Giá thuê hợp đồng mới">
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                        <Form.Item name="newDepositAmount" label="Tiền cọc hợp đồng mới">
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                    </div>
                    <Form.Item name="transferDeposit" valuePropName="checked">
                        <Checkbox>Chuyển số dư tiền cọc sang hợp đồng mới</Checkbox>
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú chuyển phòng">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </>
            );
        }

        return (
            <>
                    <div className={cx('operation-grid')}>
                        <Form.Item
                            name="transactionType"
                            label="Loại giao dịch"
                        rules={[{required: true, message: 'Chọn loại giao dịch'}]}
                    >
                        <Select options={[
                            {value: 'COLLECT', label: 'Thu cọc'},
                            {value: 'ADJUST_IN', label: 'Điều chỉnh tăng'},
                            {value: 'ADJUST_OUT', label: 'Điều chỉnh giảm'},
                            {value: 'DEDUCT_FOR_DAMAGE', label: 'Khấu trừ hư hại'},
                            {value: 'DEDUCT_FOR_UNPAID_INVOICE', label: 'Khấu trừ hóa đơn'},
                            {value: 'TRANSFER_OUT', label: 'Chuyển ra'},
                            {value: 'TRANSFER_IN', label: 'Chuyển vào'},
                            {value: 'REFUND', label: 'Hoàn cọc'},
                        ]} />
                    </Form.Item>
                    <Form.Item
                        name="amount"
                        label="Số tiền"
                        rules={[{required: true, message: 'Nhập số tiền'}]}
                    >
                        <InputNumber style={{width: '100%'}} min={1} />
                    </Form.Item>
                </div>
                <div className={cx('operation-grid')}>
                    <Form.Item name="occurredAt" label="Thời điểm ghi nhận">
                        <DatePicker showTime style={{width: '100%'}} format="DD/MM/YYYY HH:mm" />
                    </Form.Item>
                    <Form.Item name="currency" label="Tiền tệ" initialValue="VND">
                        <Input />
                    </Form.Item>
                </div>
                <div className={cx('operation-grid')}>
                    <Form.Item name="referenceType" label="Loại tham chiếu">
                        <Select allowClear options={[
                            {value: 'INVOICE', label: 'Hóa đơn'},
                            {value: 'MAINTENANCE', label: 'Bảo trì'},
                            {value: 'CONTRACT_TRANSFER', label: 'Chuyển hợp đồng'},
                            {value: 'SETTLEMENT', label: 'Tất toán'},
                            {value: 'MANUAL_ADJUSTMENT', label: 'Điều chỉnh tay'},
                        ]} />
                    </Form.Item>
                    <Form.Item name="referenceId" label="Mã tham chiếu">
                        <Input />
                    </Form.Item>
                </div>
                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </>
        );
    };

    const getOperationModalTitle = () => {
        if (operationModalType === 'amendment') {
            return 'Tạo phụ lục hợp đồng';
        }
        if (operationModalType === 'amendment-revise') {
            return 'Điều chỉnh phụ lục hợp đồng';
        }
        if (operationModalType === 'billing-rule') {
            return 'Tạo quy tắc tính phí';
        }
        if (operationModalType === 'billing-rule-revise') {
            return 'Cập nhật quy tắc tính phí';
        }
        if (operationModalType === 'terminate') {
            return 'Chấm dứt hợp đồng';
        }
        if (operationModalType === 'renew') {
            return 'Gia hạn hợp đồng';
        }
        if (operationModalType === 'violate') {
            return 'Đánh dấu vi phạm';
        }
        if (operationModalType === 'transfer-room') {
            return 'Chuyển phòng';
        }
        return 'Ghi nhận giao dịch tiền cọc';
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
                                title={backfilling ? "Đang backfill..." : "Backfill"}
                                icon={<SyncOutlined/>}
                                type="default"
                                onClick={handleBackfillFoundation}
                                disabled={backfilling}
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

                <Modal
                    open={detailModalOpen}
                    onCancel={() => {
                        setDetailModalOpen(false);
                        setSelectedContractDetail(null);
                    }}
                    footer={null}
                    width={980}
                    title={selectedContractDetail ? `Chi tiết hợp đồng ${selectedContractDetail.contractCode}` : 'Chi tiết hợp đồng'}
                >
                    {detailLoading ? (
                        <div style={{display: 'flex', justifyContent: 'center', padding: '48px 0'}}>
                            <Spin />
                        </div>
                    ) : !selectedContractDetail ? (
                        <Empty description="Không có dữ liệu hợp đồng" />
                    ) : (
                        <div className={cx('detail-modal')}>
                            <div className={cx('detail-grid')}>
                                <div className={cx('detail-card')}>
                                    <div className={cx('detail-section-header')}>
                                        <div className={cx('detail-title')}>Thông tin chung</div>
                                        <div className={cx('header-actions')}>
                                            <Button size="small" onClick={() => openOperationModal('renew')}>
                                                Gia hạn
                                            </Button>
                                            <Button size="small" danger onClick={() => openOperationModal('violate')}>
                                                Đánh dấu vi phạm
                                            </Button>
                                            <Button size="small" onClick={() => openOperationModal('terminate')}>
                                                Chấm dứt
                                            </Button>
                                            <Button size="small" type="primary" onClick={() => openOperationModal('transfer-room')}>
                                                Chuyển phòng
                                            </Button>
                                        </div>
                                    </div>
                                    <div className={cx('detail-item')}><strong>Phòng:</strong> {selectedContractDetail.roomNumber}</div>
                                    <div className={cx('detail-item')}><strong>Người thuê:</strong> {selectedContractDetail.tenantFullName || 'N/A'}</div>
                                    <div className={cx('detail-item')}><strong>Tổ chức:</strong> {selectedContractDetail.organizationName || 'Chưa gán'}</div>
                                    <div className={cx('detail-item')}><strong>Trạng thái:</strong> {getStatusTag(selectedContractDetail.status)}</div>
                                    <div className={cx('detail-item')}><strong>Ngày bắt đầu:</strong> {formatDate(selectedContractDetail.startDate)}</div>
                                    <div className={cx('detail-item')}><strong>Ngày kết thúc:</strong> {selectedContractDetail.endDate ? formatDate(selectedContractDetail.endDate) : 'Vô thời hạn'}</div>
                                    <div className={cx('detail-item')}><strong>Tự gia hạn:</strong> {selectedContractDetail.autoRenew ? 'Bật' : 'Tắt'}</div>
                                    <div className={cx('detail-item')}><strong>Lifecycle gần nhất:</strong> {getLifecycleStateLabel(selectedContractDetail.latestLifecycleState)}</div>
                                    <div className={cx('detail-item')}><strong>Giá thuê hiện tại:</strong> {formatCurrency(selectedContractDetail.rentPrice)}</div>
                                    <div className={cx('detail-item')}><strong>Tiền cọc hiện tại:</strong> {formatCurrency(selectedContractDetail.deposit)}</div>
                                </div>

                                <div className={cx('detail-card')}>
                                    <div className={cx('detail-title')}>Lịch sử phiên bản</div>
                                    {(selectedContractDetail.versions || []).length === 0 ? (
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có phiên bản" />
                                    ) : (
                                        <div className={cx('timeline-list')}>
                                            {selectedContractDetail.versions.map((version) => (
                                                <div key={version.id} className={cx('timeline-item')}>
                                                    <div className={cx('timeline-heading')}>
                                                        <span>Phiên bản #{version.versionNumber}</span>
                                                        <Tag color="blue">{getBillingCycleLabel(version.billingCycle)}</Tag>
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Giá thuê: {formatCurrency(version.price)}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Tiền cọc: {formatCurrency(version.depositAmount)}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Hiệu lực: {renderEffectivePeriod(version.effectiveFrom, version.effectiveTo)}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Ngày thu: {version.monthlyPaymentDay || '--'} mỗi kỳ
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={cx('detail-grid')}>
                                <div className={cx('detail-card')}>
                                    <div className={cx('detail-title')}>Tổng hợp tiền cọc</div>
                                    <div className={cx('detail-item')}>
                                        Thu vào: {formatCurrency(selectedContractDetail.depositSummary?.totalCollected)}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        Khấu trừ: {formatCurrency(selectedContractDetail.depositSummary?.totalDeducted)}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        Đã hoàn: {formatCurrency(selectedContractDetail.depositSummary?.totalRefunded)}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        Số dư hiện tại: {formatCurrency(selectedContractDetail.depositSummary?.currentBalance)}
                                    </div>
                                </div>

                                <div className={cx('detail-card')}>
                                    <div className={cx('detail-section-header')}>
                                        <div className={cx('detail-title')}>Xem trước tất toán</div>
                                        <Button
                                            size="small"
                                            danger
                                            onClick={handleFinalizeSettlement}
                                            disabled={(selectedContractDetail.settlementPreview?.estimatedAdditionalCharge || 0) > 0}
                                        >
                                            Chốt tất toán
                                        </Button>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        Hóa đơn mở: {selectedContractDetail.settlementPreview?.openBillCount ?? 0}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        Tổng đã thanh toán: {formatCurrency(selectedContractDetail.settlementPreview?.paidBillsTotal)}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        Tổng còn thu: {formatCurrency(selectedContractDetail.settlementPreview?.unpaidBillsTotal)}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        Dự kiến hoàn cọc: {formatCurrency(selectedContractDetail.settlementPreview?.estimatedRefundAmount)}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        Dự kiến thu thêm: {formatCurrency(selectedContractDetail.settlementPreview?.estimatedAdditionalCharge)}
                                    </div>
                                </div>
                            </div>

                            <div className={cx('detail-card', 'detail-full')}>
                                <div className={cx('detail-title')}>Lịch sử trạng thái</div>
                                {(selectedContractDetail.stateTransitions || []).length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử trạng thái" />
                                ) : (
                                    <div className={cx('timeline-list')}>
                                        {selectedContractDetail.stateTransitions.map((item) => (
                                            <div key={item.id} className={cx('timeline-item')}>
                                                <div className={cx('timeline-heading')}>
                                                    <span>{item.fromState || 'INIT'} → {item.toState}</span>
                                                    <span>{formatDateTime(item.changedAt)}</span>
                                                </div>
                                                <div className={cx('detail-item')}>
                                                    Lý do: {item.reason || 'N/A'}
                                                </div>
                                                <div className={cx('detail-item')}>
                                                    Người thực hiện: {item.changedByName || 'System'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={cx('detail-grid')}>
                                <div className={cx('detail-card')}>
                                    <div className={cx('detail-section-header')}>
                                        <div className={cx('detail-title')}>Quy tắc tính phí</div>
                                        <Button size="small" type="primary" onClick={() => openOperationModal('billing-rule')}>
                                            Thêm quy tắc
                                        </Button>
                                    </div>
                                    {(selectedContractDetail.billingRules || []).length === 0 ? (
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có quy tắc tính phí" />
                                    ) : (
                                        <div className={cx('timeline-list')}>
                                            {selectedContractDetail.billingRules.map((rule) => (
                                                <div key={rule.id} className={cx('timeline-item')}>
                                                    <div className={cx('timeline-heading')}>
                                                        <span>{rule.utilityName || 'Tiện ích chưa xác định'}</span>
                                                        <Tag color={rule.active ? 'green' : 'default'}>
                                                            {getBillingCycleLabel(rule.cycle)}
                                                        </Tag>
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Đơn giá: {formatCurrency(rule.unitPrice)}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Loại tính: {getCalculationTypeLabel(rule.calculationType)}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Hiệu lực: {renderEffectivePeriod(rule.effectiveFrom, rule.effectiveTo)}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Ghi chú: {rule.note || 'N/A'}
                                                    </div>
                                                    {rule.active && (
                                                        <div className={cx('timeline-actions')}>
                                                            <Button
                                                                size="small"
                                                                onClick={() => openOperationModal('billing-rule-revise', rule)}
                                                            >
                                                                Điều chỉnh
                                                            </Button>
                                                            <Button size="small" danger onClick={() => handleDeactivateBillingRule(rule.id)}>
                                                                Ngừng áp dụng
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className={cx('detail-card')}>
                                    <div className={cx('detail-section-header')}>
                                        <div className={cx('detail-title')}>Sổ cái tiền cọc</div>
                                        <Button size="small" type="primary" onClick={() => openOperationModal('deposit-transaction')}>
                                            Thêm giao dịch
                                        </Button>
                                    </div>
                                    {(selectedContractDetail.depositTransactions || []).length === 0 ? (
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có giao dịch tiền cọc" />
                                    ) : (
                                        <div className={cx('timeline-list')}>
                                            {selectedContractDetail.depositTransactions.map((transaction) => (
                                                <div key={transaction.id} className={cx('timeline-item')}>
                                                    <div className={cx('timeline-heading')}>
                                                        <span>{getDepositTransactionTypeLabel(transaction.transactionType)}</span>
                                                        <Tag color="gold">{formatCurrency(transaction.amount)}</Tag>
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Thời điểm: {formatDateTime(transaction.occurredAt)}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Tham chiếu: {getReferenceTypeLabel(transaction.referenceType)}
                                                        {transaction.referenceId ? ` / ${transaction.referenceId}` : ''}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Người tạo: {transaction.createdByName || 'System'}
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        Ghi chú: {transaction.note || 'N/A'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={cx('detail-card', 'detail-full')}>
                                <div className={cx('detail-section-header')}>
                                    <div className={cx('detail-title')}>Phụ lục hợp đồng</div>
                                    <Button size="small" type="primary" onClick={() => openOperationModal('amendment')}>
                                        Thêm phụ lục
                                    </Button>
                                </div>
                                {(selectedContractDetail.amendments || []).length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có phụ lục" />
                                ) : (
                                    <div className={cx('timeline-list')}>
                                        {selectedContractDetail.amendments.map((amendment) => (
                                                <div key={amendment.id} className={cx('timeline-item')}>
                                                <div className={cx('timeline-heading')}>
                                                    <span>{getAmendmentTypeLabel(amendment.amendmentType)}</span>
                                                    {renderEffectivePeriod(amendment.effectiveFrom, amendment.effectiveTo)}
                                                </div>
                                                <div className={cx('detail-item')}>
                                                    Tạo lúc: {formatDateTime(amendment.createdAt)}
                                                </div>
                                                <div className={cx('detail-item')}>
                                                    Ghi chú: {amendment.note || 'N/A'}
                                                </div>
                                                <div className={cx('detail-item')}>
                                                    Dữ liệu: {amendment.dataJson || 'N/A'}
                                                </div>
                                                <div className={cx('timeline-actions')}>
                                                    <Button size="small" onClick={() => openOperationModal('amendment-revise', amendment)}>
                                                        Điều chỉnh
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

                <Modal
                    open={Boolean(operationModalType)}
                    title={getOperationModalTitle()}
                    onCancel={closeOperationModal}
                    onOk={() => operationForm.submit()}
                    confirmLoading={operationLoading}
                    destroyOnClose
                    width={680}
                >
                    <Form form={operationForm} layout="vertical" onFinish={handleSubmitOperation}>
                        {renderOperationModalContent()}
                    </Form>
                </Modal>
            </div>
        </ConfigProvider>
    );
}

export default Contract;
