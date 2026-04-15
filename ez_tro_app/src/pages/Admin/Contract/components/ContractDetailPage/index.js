import React, {useCallback, useMemo, useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import dayjs from 'dayjs';
import {
    Button,
    Checkbox,
    DatePicker,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Spin,
    Tag,
    message,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    FileTextOutlined,
    HistoryOutlined,
    InfoCircleOutlined,
    MoneyCollectOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    SettingOutlined,
    SwapOutlined,
    UploadOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
} from '@ant-design/icons';

import styles from './ContractDetailPage.module.scss';

import SectionCard from '~/pages/Admin/Contract/components/SectionCard/SectionCard';
import ContractFileUploadModal from '~/components/Layout/AdminLayout/components/ContractFileUploadModal';
import ContractFileListModal from '~/components/Layout/AdminLayout/components/ContractFileListModal';
import {resolveBasePath} from '~/pages/Admin/Contract/components/shared/constants';

import {getAllRoomAvailableByBoardingHouse} from '~/service/admin/room';
import {
    createContractAmendment,
    createContractBillingRule,
    createDepositTransaction,
    deactivateContractBillingRule,
    finalizeContractSettlement,
    getContractById,
    markContractViolated,
    renewContract,
    reviseContractAmendment,
    reviseContractBillingRule,
    terminateContract,
    transferContractRoom,
} from '~/service/admin/contract';

const cx = classNames.bind(styles);

const formatCurrency = (value) => (
    value != null
        ? Number(value).toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})
        : 'N/A'
);

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : 'N/A');

const renderEffectivePeriod = (from, to) => (
    <div className={cx('effectivePeriod')}>
        <span className={cx('effectiveDate')}>{from || 'Chưa xác định'}</span>
        <span className={cx('effectiveArrow')}>→</span>
        <span className={cx('effectiveDate', {muted: !to})}>{to || 'Không thời hạn'}</span>
    </div>
);

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

const getStatusTag = (status) => {
    const statusConfig = {
        ACTIVE: {color: 'success', text: 'Đang hiệu lực'},
        PENDING: {color: 'processing', text: 'Sắp hiệu lực'},
        CANCELLED: {color: 'warning', text: 'Đã chấm dứt'},
        EXPIRED: {color: 'error', text: 'Hết hạn'},
    };
    const config = statusConfig[status] || {color: 'default', text: status || 'N/A'};
    return <Tag color={config.color}>{config.text}</Tag>;
};

const InfoItem = ({label, value, highlight, gold, wide}) => (
    <div className={cx('kvItem', {kvItemWide: wide})}>
        <div className={cx('kvLabel')}>{label}</div>
        <div className={cx(highlight ? 'kvValueHighlight' : gold ? 'kvValueGold' : 'kvValue')}>
            {value}
        </div>
    </div>
);

export default function ContractDetailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();
    const basePath = resolveBasePath(location.pathname);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [contractDetail, setContractDetail] = useState(null);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isFileListModalOpen, setIsFileListModalOpen] = useState(false);

    const [operationModalType, setOperationModalType] = useState(null);
    const [operationLoading, setOperationLoading] = useState(false);
    const [operationContext, setOperationContext] = useState(null);
    const [transferRoomOptions, setTransferRoomOptions] = useState([]);
    const [transferRoomsLoading, setTransferRoomsLoading] = useState(false);
    const [operationForm] = Form.useForm();

    const utilityOptions = useMemo(
        () => (contractDetail?.utilities || []).map((utility) => ({
            label: utility.name,
            value: utility.utilityId,
        })),
        [contractDetail?.utilities],
    );

    const loadContractDetail = useCallback(async (contractId) => {
        const detail = await getContractById(contractId);
        setContractDetail(detail);
        return detail;
    }, []);

    useEffect(() => {
        let cancelled = false;
        if (!id) {
            setContractDetail(null);
            setLoading(false);
            return undefined;
        }

        (async () => {
            setLoading(true);
            try {
                const detail = await getContractById(id);
                if (!cancelled) setContractDetail(detail);
            } catch (error) {
                if (!cancelled) setContractDetail(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [id]);

    const handleRefresh = async () => {
        if (!id) return;
        setRefreshing(true);
        try {
            await loadContractDetail(id);
        } finally {
            setRefreshing(false);
        }
    };

    const closeOperationModal = () => {
        setOperationModalType(null);
        setOperationContext(null);
        setTransferRoomOptions([]);
        operationForm.resetFields();
    };

    const openOperationModal = async (type, record = null) => {
        if (!contractDetail?.id) return;

        if (type === 'billing-rule' && utilityOptions.length === 0) {
            message.warning('Hợp đồng chưa có tiện ích để tạo quy tắc tính phí');
            return;
        }

        operationForm.resetFields();
        setOperationContext(record);

        if (type === 'terminate') {
            operationForm.setFieldsValue({terminationDate: dayjs()});
        }

        if (type === 'renew') {
            if (!contractDetail.endDate) {
                message.warning('Chỉ gia hạn được hợp đồng có ngày kết thúc.');
                return;
            }
            const effectiveFrom = dayjs(contractDetail.endDate).add(1, 'day');
            operationForm.setFieldsValue({
                effectiveFrom,
                newEndDate: effectiveFrom
                    .add(Number(contractDetail.paymentCycleMonths || 1), 'month')
                    .subtract(1, 'day'),
                newRentPrice: contractDetail.rentPrice,
                newDepositAmount: contractDetail.deposit,
                paymentCycleMonths: contractDetail.paymentCycleMonths || 1,
                monthlyPaymentDay: contractDetail.monthlyPaymentDay,
                autoRenew: contractDetail.autoRenew ?? false,
            });
        }

        if (type === 'violate') {
            operationForm.setFieldsValue({reason: '', evidence: ''});
        }

        if (type === 'transfer-room') {
            operationForm.setFieldsValue({
                transferDate: dayjs(),
                transferDeposit: true,
                newRentPrice: contractDetail.rentPrice,
                newDepositAmount: contractDetail.deposit,
            });

            setTransferRoomsLoading(true);
            try {
                const rooms = await getAllRoomAvailableByBoardingHouse(contractDetail.boardingHouseId);
                setTransferRoomOptions(
                    (rooms || [])
                        .filter((room) => room.id !== contractDetail.roomId)
                        .map((room) => ({
                            label: `${room.roomNumber} - ${room.price ? formatCurrency(room.price) : 'N/A'}`,
                            value: room.id,
                        })),
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

    const handleDeactivateBillingRule = (billingRuleId) => {
        if (!contractDetail?.id) return;

        Modal.confirm({
            title: 'Ngừng áp dụng quy tắc',
            content: 'Quy tắc sẽ được ngừng áp dụng và vẫn giữ lịch sử audit.',
            okText: 'Ngừng áp dụng',
            cancelText: 'Hủy',
            onOk: async () => {
                await deactivateContractBillingRule(contractDetail.id, billingRuleId);
                await loadContractDetail(contractDetail.id);
            },
        });
    };

    const handleFinalizeSettlement = () => {
        if (!contractDetail?.id) return;

        Modal.confirm({
            title: 'Chốt tất toán hợp đồng',
            content: 'Hệ thống sẽ khấu trừ công nợ còn mở từ tiền cọc, hoàn phần dư và chuyển hợp đồng sang đã chấm dứt.',
            okText: 'Chốt tất toán',
            cancelText: 'Hủy',
            okButtonProps: {danger: true},
            onOk: async () => {
                await finalizeContractSettlement(contractDetail.id);
                await loadContractDetail(contractDetail.id);
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
        if (!contractDetail?.id) return;

        setOperationLoading(true);
        try {
            if (operationModalType === 'amendment') {
                const payload = {
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
                if (!payload.effectiveFrom) { message.error('Vui lòng chọn ngày hiệu lực'); return; }
                await createContractAmendment(contractDetail.id, payload);
            }

            if (operationModalType === 'amendment-revise') {
                const payload = {
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
                if (!payload.effectiveFrom) { message.error('Vui lòng chọn ngày hiệu lực'); return; }
                await reviseContractAmendment(contractDetail.id, operationContext.id, payload);
            }

            if (operationModalType === 'billing-rule') {
                const payload = {
                    utilityId: values.utilityId,
                    cycle: values.cycle,
                    unitPrice: values.unitPrice,
                    calculationType: values.calculationType,
                    effectiveFrom: formatDateOnly(values.effectiveFrom),
                    effectiveTo: formatDateOnly(values.effectiveTo),
                    note: values.note || null,
                };
                if (!payload.effectiveFrom) { message.error('Vui lòng chọn ngày hiệu lực'); return; }
                await createContractBillingRule(contractDetail.id, payload);
            }

            if (operationModalType === 'billing-rule-revise') {
                const payload = {
                    utilityId: values.utilityId,
                    cycle: values.cycle,
                    unitPrice: values.unitPrice,
                    calculationType: values.calculationType,
                    effectiveFrom: formatDateOnly(values.effectiveFrom),
                    effectiveTo: formatDateOnly(values.effectiveTo),
                    note: values.note || null,
                };
                if (!payload.effectiveFrom) { message.error('Vui lòng chọn ngày hiệu lực'); return; }
                await reviseContractBillingRule(contractDetail.id, operationContext.id, payload);
            }

            if (operationModalType === 'deposit-transaction') {
                await createDepositTransaction(contractDetail.id, {
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
                await terminateContract(contractDetail.id, {
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
                await renewContract(contractDetail.id, {
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
                await markContractViolated(contractDetail.id, {
                    reason: values.reason,
                    evidence: values.evidence || null,
                });
            }

            if (operationModalType === 'transfer-room') {
                const transferDate = formatDateOnly(values.transferDate);
                if (!transferDate) { message.error('Vui lòng chọn ngày chuyển'); return; }
                await transferContractRoom(contractDetail.id, {
                    targetRoomId: values.targetRoomId,
                    transferDate,
                    transferDeposit: values.transferDeposit ?? false,
                    newRentPrice: values.newRentPrice ?? null,
                    newDepositAmount: values.newDepositAmount ?? null,
                    note: values.note || null,
                });
                closeOperationModal();
                navigate(basePath);
                return;
            }

            await loadContractDetail(contractDetail.id);
            closeOperationModal();
        } catch (error) {
            // Các service đã tự hiển thị message lỗi; chỉ cần chặn throw để tránh hiện "Uncaught runtime errors"
        } finally {
            setOperationLoading(false);
        }
    };

    const renderOperationModalContent = () => {
        if (operationModalType === 'amendment' || operationModalType === 'amendment-revise') {
            return (
                <>
                    <Form.Item name="amendmentType" label="Loại phụ lục" rules={[{required: true, message: 'Chọn loại phụ lục'}]}>
                        <Select options={[
                            {value: 'PRICE_CHANGE', label: 'Điều chỉnh giá'},
                            {value: 'ADD_OCCUPANT', label: 'Thêm người ở'},
                            {value: 'REMOVE_OCCUPANT', label: 'Giảm người ở'},
                            {value: 'SERVICE_OVERRIDE', label: 'Điều chỉnh dịch vụ'},
                            {value: 'PAYMENT_TERM_CHANGE', label: 'Điều chỉnh kỳ thanh toán'},
                            {value: 'PENALTY_POLICY_CHANGE', label: 'Điều chỉnh phạt'},
                            {value: 'NOTICE_PERIOD_CHANGE', label: 'Điều chỉnh thời hạn báo trước'},
                        ]} />
                    </Form.Item>
                    <div className={cx('operationGrid')}>
                        <Form.Item name="effectiveFrom" label="Hiệu lực từ" rules={[{required: true, message: 'Chọn ngày hiệu lực'}]}>
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                        <Form.Item name="effectiveTo" label="Hiệu lực đến">
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <div className={cx('operationGrid')}>
                        <Form.Item name="price" label="Giá thuê mới">
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                        <Form.Item name="depositAmount" label="Tiền cọc mới">
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                    </div>
                    <div className={cx('operationGrid')}>
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
                    <Form.Item name="dataJson" label="Dữ liệu JSON">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </>
            );
        }

        if (operationModalType === 'billing-rule' || operationModalType === 'billing-rule-revise') {
            return (
                <>
                    <div className={cx('operationGrid')}>
                        <Form.Item name="utilityId" label="Tiện ích" rules={[{required: true, message: 'Chọn tiện ích'}]}>
                            <Select options={utilityOptions} />
                        </Form.Item>
                        <Form.Item name="cycle" label="Chu kỳ" initialValue="MONTHLY" rules={[{required: true, message: 'Chọn chu kỳ'}]}>
                            <Select options={[
                                {value: 'DAILY', label: 'Hàng ngày'},
                                {value: 'WEEKLY', label: 'Hàng tuần'},
                                {value: 'MONTHLY', label: 'Hàng tháng'},
                            ]} />
                        </Form.Item>
                    </div>
                    <div className={cx('operationGrid')}>
                        <Form.Item name="unitPrice" label="Đơn giá" rules={[{required: true, message: 'Nhập đơn giá'}]}>
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                        <Form.Item name="calculationType" label="Loại tính" initialValue="FIXED" rules={[{required: true, message: 'Chọn loại tính'}]}>
                            <Select options={[
                                {value: 'FIXED', label: 'Cố định'},
                                {value: 'USAGE_BASED', label: 'Theo tiêu thụ'},
                                {value: 'PER_PERSON', label: 'Theo người'},
                                {value: 'PER_VEHICLE', label: 'Theo phương tiện'},
                            ]} />
                        </Form.Item>
                    </div>
                    <div className={cx('operationGrid')}>
                        <Form.Item name="effectiveFrom" label="Hiệu lực từ" rules={[{required: true, message: 'Chọn ngày hiệu lực'}]}>
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
                    <Form.Item name="terminationDate" label="Ngày chấm dứt" rules={[{required: true, message: 'Chọn ngày chấm dứt'}]}>
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
                    <div className={cx('operationGrid')}>
                        <Form.Item name="effectiveFrom" label="Hiệu lực từ" rules={[{required: true, message: 'Chọn ngày hiệu lực'}]}>
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                        <Form.Item name="newEndDate" label="Ngày kết thúc mới" rules={[{required: true, message: 'Chọn ngày kết thúc mới'}]}>
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <div className={cx('operationGrid')}>
                        <Form.Item name="newRentPrice" label="Giá thuê mới">
                            <InputNumber style={{width: '100%'}} min={1} />
                        </Form.Item>
                        <Form.Item name="newDepositAmount" label="Tiền cọc mới">
                            <InputNumber style={{width: '100%'}} min={0} />
                        </Form.Item>
                    </div>
                    <div className={cx('operationGrid')}>
                        <Form.Item name="paymentCycleMonths" label="Chu kỳ thanh toán (tháng)">
                            <InputNumber style={{width: '100%'}} min={1} max={12} />
                        </Form.Item>
                        <Form.Item name="monthlyPaymentDay" label="Ngày thu hàng tháng">
                            <InputNumber style={{width: '100%'}} min={1} max={28} />
                        </Form.Item>
                    </div>
                    <Form.Item name="autoRenew" valuePropName="checked">
                        <Checkbox>Duy trì tự gia hạn sau đợt gia hạn này</Checkbox>
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
                    <Form.Item name="reason" label="Lý do vi phạm" rules={[{required: true, message: 'Nhập lý do vi phạm'}]}>
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
                    <div className={cx('operationGrid')}>
                        <Form.Item name="targetRoomId" label="Phòng đích" rules={[{required: true, message: 'Chọn phòng đích'}]}>
                            <Select loading={transferRoomsLoading} options={transferRoomOptions} placeholder="Chọn phòng trống" />
                        </Form.Item>
                        <Form.Item name="transferDate" label="Ngày chuyển" rules={[{required: true, message: 'Chọn ngày chuyển'}]}>
                            <DatePicker style={{width: '100%'}} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <div className={cx('operationGrid')}>
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

        // deposit-transaction (default)
        return (
            <>
                <div className={cx('operationGrid')}>
                    <Form.Item name="transactionType" label="Loại giao dịch" rules={[{required: true, message: 'Chọn loại giao dịch'}]}>
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
                    <Form.Item name="amount" label="Số tiền" rules={[{required: true, message: 'Nhập số tiền'}]}>
                        <InputNumber style={{width: '100%'}} min={1} />
                    </Form.Item>
                </div>
                <div className={cx('operationGrid')}>
                    <Form.Item name="occurredAt" label="Thời điểm ghi nhận">
                        <DatePicker showTime style={{width: '100%'}} format="DD/MM/YYYY HH:mm" />
                    </Form.Item>
                    <Form.Item name="currency" label="Tiền tệ" initialValue="VND">
                        <Input />
                    </Form.Item>
                </div>
                <div className={cx('operationGrid')}>
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
        if (operationModalType === 'amendment') return 'Tạo phụ lục hợp đồng';
        if (operationModalType === 'amendment-revise') return 'Điều chỉnh phụ lục hợp đồng';
        if (operationModalType === 'billing-rule') return 'Tạo quy tắc tính phí';
        if (operationModalType === 'billing-rule-revise') return 'Cập nhật quy tắc tính phí';
        if (operationModalType === 'terminate') return 'Chấm dứt hợp đồng';
        if (operationModalType === 'renew') return 'Gia hạn hợp đồng';
        if (operationModalType === 'violate') return 'Đánh dấu vi phạm';
        if (operationModalType === 'transfer-room') return 'Chuyển phòng';
        return 'Ghi nhận giao dịch tiền cọc';
    };

    const headerSubtitle = contractDetail
        ? `Phòng ${contractDetail.roomNumber || 'N/A'} • ${contractDetail.tenantFullName || 'Chưa có người thuê'}`
        : '—';

    const canSettle = (contractDetail?.settlementPreview?.estimatedAdditionalCharge || 0) <= 0;

    return (
        <div className={cx('page')}>
            <div className={cx('mainContent')}>

                {/* ── Top Bar ── */}
                <div className={cx('topBar')}>
                    <div className={cx('topLeft')}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(basePath)}
                            className={cx('backButton')}
                        >
                            Quay lại
                        </Button>
                        <div className={cx('titleGroup')}>
                            <div className={cx('titleRow')}>
                                <div className={cx('title')}>Chi tiết hợp đồng</div>
                                {contractDetail?.contractCode && (
                                    <div className={cx('codePill')}>#{contractDetail.contractCode}</div>
                                )}
                                {contractDetail?.status && (
                                    <div className={cx('statusPill')}>{getStatusTag(contractDetail.status)}</div>
                                )}
                            </div>
                            <div className={cx('subtitle')}>{headerSubtitle}</div>
                        </div>
                    </div>

                    <div className={cx('topActions')}>
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing} disabled={loading || !id}>
                            Làm mới
                        </Button>
                        <Button icon={<FileTextOutlined />} onClick={() => setIsFileListModalOpen(true)} disabled={!contractDetail?.id}>
                            Xem file
                        </Button>
                        <Button icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)} disabled={!contractDetail?.id}>
                            Tải file
                        </Button>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`${basePath}/${id}/edit`)} disabled={!id}>
                            Chỉnh sửa
                        </Button>
                    </div>
                </div>

                {/* ── Action Bar — hành động hợp đồng ── */}
                {contractDetail && !loading && (
                    <div className={cx('actionBar')}>
                        <span className={cx('actionBarLabel')}>Thao tác hợp đồng</span>
                        <div className={cx('actionBarButtons')}>
                            <Button
                                icon={<CheckCircleOutlined />}
                                className={cx('btnRenew')}
                                onClick={() => openOperationModal('renew')}
                            >
                                Gia hạn
                            </Button>
                            <Button
                                icon={<SwapOutlined />}
                                className={cx('btnTransfer')}
                                onClick={() => openOperationModal('transfer-room')}
                            >
                                Chuyển phòng
                            </Button>
                            <Button
                                icon={<WarningOutlined />}
                                className={cx('btnViolate')}
                                onClick={() => openOperationModal('violate')}
                            >
                                Đánh dấu vi phạm
                            </Button>
                            <Button
                                icon={<CloseCircleOutlined />}
                                className={cx('btnTerminate')}
                                onClick={() => openOperationModal('terminate')}
                            >
                                Chấm dứt
                            </Button>
                            <Button
                                icon={<SafetyCertificateOutlined />}
                                className={cx('btnSettle')}
                                onClick={handleFinalizeSettlement}
                                disabled={!canSettle}
                            >
                                Chốt tất toán
                            </Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className={cx('centered')}>
                        <Spin size="large" tip="Đang tải chi tiết hợp đồng..." />
                    </div>
                ) : !contractDetail ? (
                    <div className={cx('centered')}>
                        <Empty description="Không có dữ liệu hợp đồng" />
                    </div>
                ) : (
                    <div className={cx('contentBody')}>

                        {/* ── Row 1: Thông tin chung + Tóm tắt tài chính ── */}
                        <div className={cx('gridTwo')}>
                            <SectionCard
                                icon={<InfoCircleOutlined />}
                                iconColor="blue"
                                title="Thông tin chung"
                                desc="Thông tin hợp đồng, phòng và người thuê"
                            >
                                <div className={cx('infoGrid')}>
                                    <InfoItem label="Phòng" value={contractDetail.roomNumber || 'N/A'} />
                                    <InfoItem label="Người thuê" value={contractDetail.tenantFullName || 'N/A'} wide />
                                    <InfoItem label="Số điện thoại" value={contractDetail.tenantPhoneNumber || 'N/A'} />
                                    <InfoItem label="Tổ chức" value={contractDetail.organizationName || 'Chưa gán'} />
                                    <InfoItem label="Trạng thái" value={getStatusTag(contractDetail.status)} />
                                    <InfoItem label="Lifecycle" value={getLifecycleStateLabel(contractDetail.latestLifecycleState)} />
                                    <InfoItem label="Ngày bắt đầu" value={formatDate(contractDetail.startDate)} />
                                    <InfoItem label="Ngày kết thúc" value={contractDetail.endDate ? formatDate(contractDetail.endDate) : 'Vô thời hạn'} />
                                    <InfoItem label="Tự gia hạn" value={contractDetail.autoRenew ? '✓ Bật' : '✗ Tắt'} />
                                    <InfoItem label="Chu kỳ thanh toán" value={`${contractDetail.paymentCycleMonths || 1} tháng`} />
                                    <InfoItem label="Ngày thu" value={contractDetail.monthlyPaymentDay ? `Ngày ${contractDetail.monthlyPaymentDay}` : '—'} />
                                    <InfoItem label="Giá thuê" value={formatCurrency(contractDetail.rentPrice)} highlight />
                                    <InfoItem label="Tiền cọc" value={formatCurrency(contractDetail.deposit)} gold />
                                </div>
                            </SectionCard>

                            {/* Tổng hợp tiền cọc + Xem trước tất toán */}
                            <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                                <SectionCard
                                    icon={<MoneyCollectOutlined />}
                                    iconColor="green"
                                    title="Tổng hợp tiền cọc"
                                    desc="Thu vào, khấu trừ và số dư hiện tại"
                                >
                                    <div className={cx('kvGrid', 'kvGridCompact')}>
                                        <InfoItem label="Thu vào" value={formatCurrency(contractDetail.depositSummary?.totalCollected)} />
                                        <InfoItem label="Khấu trừ" value={formatCurrency(contractDetail.depositSummary?.totalDeducted)} />
                                        <InfoItem label="Đã hoàn" value={formatCurrency(contractDetail.depositSummary?.totalRefunded)} />
                                        <InfoItem label="Số dư hiện tại" value={formatCurrency(contractDetail.depositSummary?.currentBalance)} highlight />
                                    </div>
                                </SectionCard>

                                <SectionCard
                                    icon={<SafetyCertificateOutlined />}
                                    iconColor="orange"
                                    title="Xem trước tất toán"
                                    desc="Kiểm tra công nợ và hoàn cọc dự kiến"
                                >
                                    <div className={cx('kvGrid', 'kvGridCompact')}>
                                        <InfoItem label="Hóa đơn mở" value={contractDetail.settlementPreview?.openBillCount ?? 0} />
                                        <InfoItem label="Tổng đã thanh toán" value={formatCurrency(contractDetail.settlementPreview?.paidBillsTotal)} />
                                        <InfoItem label="Tổng còn thu" value={formatCurrency(contractDetail.settlementPreview?.unpaidBillsTotal)} />
                                        <InfoItem label="Dự kiến hoàn cọc" value={formatCurrency(contractDetail.settlementPreview?.estimatedRefundAmount)} highlight />
                                        <InfoItem label="Dự kiến thu thêm" value={formatCurrency(contractDetail.settlementPreview?.estimatedAdditionalCharge)} />
                                    </div>
                                </SectionCard>
                            </div>
                        </div>

                        {/* ── Row 2: Quy tắc tính phí + Sổ cái tiền cọc ── */}
                        <div className={cx('gridTwo')}>
                            <SectionCard
                                icon={<SettingOutlined />}
                                iconColor="gold"
                                title="Quy tắc tính phí"
                                desc="Quy tắc tính phí theo tiện ích"
                                headerRight={
                                    <Button size="small" type="primary" onClick={() => openOperationModal('billing-rule')}>
                                        + Thêm quy tắc
                                    </Button>
                                }
                            >
                                {(contractDetail.billingRules || []).length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có quy tắc tính phí" />
                                ) : (
                                    <div className={cx('timelineList')}>
                                        {contractDetail.billingRules.map((rule) => (
                                            <div key={rule.id} className={cx('timelineItem')}>
                                                <div className={cx('timelineHeading')}>
                                                    <div className={cx('timelineTitle')}>{rule.utilityName || 'Tiện ích chưa xác định'}</div>
                                                    <Tag color={rule.active ? 'green' : 'default'}>
                                                        {rule.active ? 'Đang áp dụng' : 'Đã ngừng'}
                                                    </Tag>
                                                </div>
                                                <div className={cx('timelineMeta')}>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Chu kỳ</span>
                                                        <span className={cx('metaValue')}>{getBillingCycleLabel(rule.cycle)}</span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Đơn giá</span>
                                                        <span className={cx('metaValue')}>{formatCurrency(rule.unitPrice)}</span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Loại tính</span>
                                                        <span className={cx('metaValue')}>{getCalculationTypeLabel(rule.calculationType)}</span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Hiệu lực</span>
                                                        <span className={cx('metaValue')}>{renderEffectivePeriod(rule.effectiveFrom, rule.effectiveTo)}</span>
                                                    </div>
                                                    {rule.note && (
                                                        <div className={cx('metaRow')}>
                                                            <span className={cx('metaLabel')}>Ghi chú</span>
                                                            <span className={cx('metaValue')}>{rule.note}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {rule.active && (
                                                    <div className={cx('timelineActions')}>
                                                        <Button size="small" onClick={() => openOperationModal('billing-rule-revise', rule)}>
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
                            </SectionCard>

                            <SectionCard
                                icon={<MoneyCollectOutlined />}
                                iconColor="green"
                                title="Sổ cái tiền cọc"
                                desc="Các giao dịch thu / chi / khấu trừ"
                                headerRight={
                                    <Button size="small" type="primary" onClick={() => openOperationModal('deposit-transaction')}>
                                        + Thêm giao dịch
                                    </Button>
                                }
                            >
                                {(contractDetail.depositTransactions || []).length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có giao dịch tiền cọc" />
                                ) : (
                                    <div className={cx('timelineList')}>
                                        {contractDetail.depositTransactions.map((transaction) => (
                                            <div key={transaction.id} className={cx('timelineItem')}>
                                                <div className={cx('timelineHeading')}>
                                                    <div className={cx('timelineTitle')}>
                                                        {getDepositTransactionTypeLabel(transaction.transactionType)}
                                                    </div>
                                                    <Tag color="gold">{formatCurrency(transaction.amount)}</Tag>
                                                </div>
                                                <div className={cx('timelineMeta')}>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Thời điểm</span>
                                                        <span className={cx('metaValue')}>{formatDateTime(transaction.occurredAt)}</span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Tham chiếu</span>
                                                        <span className={cx('metaValue')}>
                                                            {getReferenceTypeLabel(transaction.referenceType)}
                                                            {transaction.referenceId ? ` / ${transaction.referenceId}` : ''}
                                                        </span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Người tạo</span>
                                                        <span className={cx('metaValue')}>{transaction.createdByName || 'Hệ thống'}</span>
                                                    </div>
                                                    {transaction.note && (
                                                        <div className={cx('metaRow')}>
                                                            <span className={cx('metaLabel')}>Ghi chú</span>
                                                            <span className={cx('metaValue')}>{transaction.note}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        </div>

                        {/* ── Row 3: Lịch sử trạng thái + Phiên bản ── */}
                        <div className={cx('gridTwo')}>
                            <SectionCard
                                icon={<EyeOutlined />}
                                iconColor="blue"
                                title="Lịch sử trạng thái"
                                desc="Các lần chuyển trạng thái của hợp đồng"
                            >
                                {(contractDetail.stateTransitions || []).length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử trạng thái" />
                                ) : (
                                    <div className={cx('timelineList')}>
                                        {contractDetail.stateTransitions.map((item) => (
                                            <div key={item.id} className={cx('timelineItem')}>
                                                <div className={cx('timelineHeading')}>
                                                    <div className={cx('timelineTitle')}>
                                                        {item.fromState || 'INIT'} → {item.toState}
                                                    </div>
                                                    <div className={cx('timelineTime')}>{formatDateTime(item.changedAt)}</div>
                                                </div>
                                                <div className={cx('timelineMeta')}>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Lý do</span>
                                                        <span className={cx('metaValue')}>{item.reason || 'N/A'}</span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Người thực hiện</span>
                                                        <span className={cx('metaValue')}>{item.changedByName || 'Hệ thống'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard
                                icon={<HistoryOutlined />}
                                iconColor="gold"
                                title="Lịch sử phiên bản"
                                desc="Các phiên bản hợp đồng đã qua"
                            >
                                {(contractDetail.versions || []).length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có phiên bản" />
                                ) : (
                                    <div className={cx('timelineList')}>
                                        {contractDetail.versions.map((version) => (
                                            <div key={version.id} className={cx('timelineItem')}>
                                                <div className={cx('timelineHeading')}>
                                                    <div className={cx('timelineTitle')}>Phiên bản #{version.versionNumber}</div>
                                                    <Tag color="blue">{getBillingCycleLabel(version.billingCycle)}</Tag>
                                                </div>
                                                <div className={cx('timelineMeta')}>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Giá thuê</span>
                                                        <span className={cx('metaValue')}>{formatCurrency(version.price)}</span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Tiền cọc</span>
                                                        <span className={cx('metaValue')}>{formatCurrency(version.depositAmount)}</span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Hiệu lực</span>
                                                        <span className={cx('metaValue')}>{renderEffectivePeriod(version.effectiveFrom, version.effectiveTo)}</span>
                                                    </div>
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Ngày thu</span>
                                                        <span className={cx('metaValue')}>{version.monthlyPaymentDay ? `Ngày ${version.monthlyPaymentDay}` : '--'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        </div>

                        {/* ── Row 4: Phụ lục hợp đồng ── */}
                        <SectionCard
                            icon={<FileTextOutlined />}
                            iconColor="blue"
                            title="Phụ lục hợp đồng"
                            desc="Các thay đổi và điều chỉnh kèm theo hợp đồng"
                            headerRight={
                                <Button size="small" type="primary" onClick={() => openOperationModal('amendment')}>
                                    + Thêm phụ lục
                                </Button>
                            }
                        >
                            {(contractDetail.amendments || []).length === 0 ? (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có phụ lục" />
                            ) : (
                                <div className={cx('timelineList')}>
                                    {contractDetail.amendments.map((amendment) => (
                                        <div key={amendment.id} className={cx('timelineItem')}>
                                            <div className={cx('timelineHeading')}>
                                                <div className={cx('timelineTitle')}>{getAmendmentTypeLabel(amendment.amendmentType)}</div>
                                                <div>{renderEffectivePeriod(amendment.effectiveFrom, amendment.effectiveTo)}</div>
                                            </div>
                                            <div className={cx('timelineMeta')}>
                                                <div className={cx('metaRow')}>
                                                    <span className={cx('metaLabel')}>Tạo lúc</span>
                                                    <span className={cx('metaValue')}>{formatDateTime(amendment.createdAt)}</span>
                                                </div>
                                                {amendment.note && (
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Ghi chú</span>
                                                        <span className={cx('metaValue')}>{amendment.note}</span>
                                                    </div>
                                                )}
                                                {amendment.dataJson && (
                                                    <div className={cx('metaRow')}>
                                                        <span className={cx('metaLabel')}>Dữ liệu</span>
                                                        <span className={cx('metaValue')}>{amendment.dataJson}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={cx('timelineActions')}>
                                                <Button size="small" onClick={() => openOperationModal('amendment-revise', amendment)}>
                                                    Điều chỉnh
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                )}

                {/* ── Modals ── */}
                <ContractFileUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    contractId={contractDetail?.id}
                    tenantName={contractDetail?.tenantFullName || 'N/A'}
                    onSuccess={() => handleRefresh()}
                />

                <ContractFileListModal
                    isOpen={isFileListModalOpen}
                    onClose={() => setIsFileListModalOpen(false)}
                    contract={contractDetail}
                />

                <Modal
                    open={Boolean(operationModalType)}
                    title={getOperationModalTitle()}
                    onCancel={closeOperationModal}
                    onOk={() => operationForm.submit()}
                    confirmLoading={operationLoading}
                    destroyOnClose
                    width={720}
                    className={cx('operationModal')}
                >
                    <Form form={operationForm} layout="vertical" onFinish={handleSubmitOperation}>
                        {renderOperationModalContent()}
                    </Form>
                </Modal>
            </div>
        </div>
    );
}
