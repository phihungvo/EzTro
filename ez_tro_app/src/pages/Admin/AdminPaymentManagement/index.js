import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Button,
    DatePicker,
    Descriptions,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Spin,
    Table,
    Tooltip,
    message,
} from "antd";
import {
    AuditOutlined,
    BankOutlined,
    ArrowRightOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    DollarOutlined,
    FileTextOutlined,
    FilterOutlined,
    HistoryOutlined,
    PlusOutlined,
    ReloadOutlined,
    RollbackOutlined,
    SearchOutlined,
    ThunderboltOutlined,
    WalletOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import classNames from "classnames/bind";
import dayjs from "dayjs";

import styles from "./AdminPaymentManagement.module.scss";
import { getAllActiveContracts, getPresignedUrl } from "~/service/admin/contract";
import {
    getContractReconciliation,
    getCreditLedgerReport,
    getDebtAgingReport,
} from "~/service/admin/reconciliation";
import { getBillingAuditLogs } from "~/service/admin/billing-audit";
import {
    allocatePayment,
    confirmPayment,
    getPaymentById,
    listPayments,
    receivePayment,
    reversePayment,
} from "~/service/admin/payment";
import { getBillingUiErrorMessage } from "~/utils/apiError";

const cx = classNames.bind(styles);
const { TextArea } = Input;

// ─────────────────────────────────────────────────────────
// Helpers & constants
// ─────────────────────────────────────────────────────────
const formatCurrency = (value) =>
    `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const toContractOption = (contract) => ({
    label: `${contract.boardingHouseName || "Khu trọ"} · P.${contract.roomNumber || "?"} · ${contract.tenantFullName || "Không rõ"}`,
    value: contract.id,
});

const formatEnumLabel = (value) =>
    String(value || "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

const PAYMENT_STATUS_META = {
    PENDING:             { color: "#f0a443", bg: "rgba(240,164,67,0.12)",   text: "Chờ xác nhận" },
    CONFIRMED:           { color: "#4b8eff", bg: "rgba(75,142,255,0.12)",   text: "Đã xác nhận" },
    PARTIALLY_ALLOCATED: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", text: "Phân bổ một phần" },
    FULLY_ALLOCATED:     { color: "#22c97a", bg: "rgba(34,201,122,0.12)",  text: "Đã phân bổ hết" },
    OVERPAID:            { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",    text: "Dư / Credit" },
    REVERSED:            { color: "#4e5f7c", bg: "rgba(78,95,124,0.12)",   text: "Đã đảo ngược" },
    FAILED:              { color: "#f25c5c", bg: "rgba(242,92,92,0.1)",    text: "Thất bại" },
};

const INVOICE_STATUS_META = {
    PAID:           { color: "#22c97a", bg: "rgba(34,201,122,0.12)",  text: "Đã thanh toán" },
    UNPAID:         { color: "#f0a443", bg: "rgba(240,164,67,0.12)",  text: "Chưa thanh toán" },
    OVERDUE:        { color: "#f25c5c", bg: "rgba(242,92,92,0.1)",   text: "Quá hạn" },
    PARTIALLY_PAID: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)",text: "Thanh toán một phần" },
    CANCELLED:      { color: "#4e5f7c", bg: "rgba(78,95,124,0.12)", text: "Đã hủy" },
};

const KPI_CONFIG = [
    { key: "invoiceTotal",     label: "Tổng hóa đơn",   icon: <FileTextOutlined />,    cls: "kpiBlue" },
    { key: "paymentTotal",     label: "Đã thu về",       icon: <CheckCircleOutlined />, cls: "kpiGreen" },
    { key: "outstandingTotal", label: "Công nợ còn lại", icon: <WarningOutlined />,     cls: "kpiAmber" },
    { key: "creditBalance",    label: "Credit tồn",      icon: <WalletOutlined />,      cls: "kpiViolet" },
];

// ─────────────────────────────────────────────────────────
// StatusTag
// ─────────────────────────────────────────────────────────
const StatusTag = ({ status, meta }) => {
    const m = meta[status] || { color: "#4e5f7c", bg: "rgba(78,95,124,0.12)", text: status };
    return (
        <span
            className={cx("statusTag")}
            style={{ color: m.color, background: m.bg, borderColor: `${m.color}44` }}
        >
            {m.text}
        </span>
    );
};

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────
function AdminPaymentManagement() {
    const [contractOptions, setContractOptions]       = useState([]);
    const [contractMap, setContractMap]               = useState({});
    const [selectedContractId, setSelectedContractId] = useState(null);
    const [reconciliation, setReconciliation]         = useState(null);
    const [agingReport, setAgingReport]               = useState(null);
    const [creditLedger, setCreditLedger]             = useState(null);
    const [billingAuditLogs, setBillingAuditLogs]     = useState([]);
    const [payments, setPayments]                     = useState([]);
    const [selectedPaymentId, setSelectedPaymentId]   = useState(null);
    const [selectedPayment, setSelectedPayment]       = useState(null);
    const [loadingContracts, setLoadingContracts]     = useState(false);
    const [loadingWorkspace, setLoadingWorkspace]     = useState(false);
    const [submitting, setSubmitting]                 = useState(false);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
    const [paymentSearch, setPaymentSearch]           = useState("");

    const [receiveForm] = Form.useForm();
    const [reverseForm] = Form.useForm();
    const [confirmForm] = Form.useForm();

    const selectedContract = selectedContractId ? contractMap[selectedContractId] : null;

    // ── Derived ──
    const outstandingInvoices = useMemo(
        () =>
            (reconciliation?.invoices || []).filter(
                (i) => Number(i.outstandingAmount || 0) > 0 && i.billStatus !== "CANCELLED"
            ),
        [reconciliation]
    );

    const selectedPaymentUnallocated = Number(selectedPayment?.unallocatedAmount || 0);

    const filteredPayments = useMemo(() => {
        const s = paymentSearch.trim().toLowerCase();
        return payments.filter((p) => {
            const matchStatus = paymentStatusFilter === "ALL" || p.status === paymentStatusFilter;
            const matchSearch =
                !s ||
                String(p.id).includes(s) ||
                String(p.externalReference || "").toLowerCase().includes(s);
            return matchStatus && matchSearch;
        });
    }, [payments, paymentSearch, paymentStatusFilter]);

    const paymentSummary = useMemo(() => ({
        pendingCount:     payments.filter((p) => p.status === "PENDING").length,
        actionableCount:  payments.filter((p) => !["REVERSED", "FAILED"].includes(p.status) && Number(p.unallocatedAmount || 0) > 0).length,
        totalUnallocated: payments.reduce((s, p) => s + Number(p.unallocatedAmount || 0), 0),
    }), [payments]);

    const agingInvoices = useMemo(() =>
            [...(agingReport?.invoices || [])]
                .filter((i) => Number(i.outstandingAmount || 0) > 0)
                .sort((a, b) => Number(b.ageDays || 0) - Number(a.ageDays || 0)),
        [agingReport]
    );

    const creditEntries = useMemo(() =>
            [...(creditLedger?.entries || [])]
                .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
                .slice(0, 6),
        [creditLedger]
    );

    const manualAllocationDraft = useMemo(
        () => outstandingInvoices.reduce((s, i) => s + Number(i.manualAmount || 0), 0),
        [outstandingInvoices]
    );

    const canAllocate =
        !!selectedPayment &&
        !["REVERSED", "FAILED"].includes(selectedPayment.status) &&
        Number(selectedPayment.unallocatedAmount || 0) > 0;

    const canReverse =
        !!selectedPayment && !["REVERSED", "FAILED"].includes(selectedPayment.status);

    const describePaymentSource = useCallback((payment) => {
        if (!payment) {
            return "—";
        }
        if (payment.source === "TENANT_SUBMITTED") {
            return "Tenant portal";
        }
        return formatEnumLabel(payment.source || "NORMAL");
    }, []);

    const summarizePaymentContext = useCallback((payment) => {
        if (!payment) {
            return null;
        }
        const parts = [];
        if (payment.submittedBillCode) {
            parts.push(payment.submittedBillCode);
        }
        if (payment.paymentMethod) {
            parts.push(formatEnumLabel(payment.paymentMethod));
        }
        if (payment.createdByName) {
            parts.push(payment.createdByName);
        }
        return parts.length ? parts.join(" · ") : null;
    }, []);

    const summarizeAuditMetadata = useCallback((log) => {
        const metadata = log?.metadata;
        if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
            return null;
        }
        const parts = [];
        if (log.operationType === "PAYMENT_RECEIVE") {
            if (metadata.origin === "TENANT_PORTAL") {
                parts.push("Tenant portal");
            }
            if (metadata.billCode) {
                parts.push(String(metadata.billCode));
            }
            if (metadata.paymentMethod) {
                parts.push(formatEnumLabel(metadata.paymentMethod));
            }
            if (metadata.externalReference) {
                parts.push(`Ref ${metadata.externalReference}`);
            }
            if (metadata.proofFileName) {
                parts.push(`Proof ${metadata.proofFileName}`);
            }
            return parts.length ? parts.join(" · ") : null;
        }
        if (log.operationType === "PAYMENT_CONFIRM") {
            if (metadata.billCode) {
                parts.push(String(metadata.billCode));
            }
            if (metadata.paymentMethod) {
                parts.push(formatEnumLabel(metadata.paymentMethod));
            }
            if (metadata.evidenceReference) {
                parts.push(`Evidence ${metadata.evidenceReference}`);
            }
            if (metadata.proofFileName) {
                parts.push(`Proof ${metadata.proofFileName}`);
            }
            if (metadata.financeNote) {
                parts.push(String(metadata.financeNote));
            }
            return parts.length ? parts.join(" · ") : null;
        }
        return null;
    }, []);

    const handleOpenProofFile = useCallback(async (payment, action = "view") => {
        if (!payment?.proofFileId) {
            message.warning("Khoản thanh toán này chưa có chứng từ");
            return;
        }
        try {
            const url = await getPresignedUrl(payment.proofFileId, action);
            if (action === "download") {
                const link = document.createElement("a");
                link.href = url;
                link.download = payment.proofFileName || `payment-proof-${payment.proofFileId}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (e) {
            message.error(getBillingUiErrorMessage(e, "Không thể mở chứng từ thanh toán"));
        }
    }, []);

    // ── Workspace refresh ──
    const refreshWorkspace = useCallback(
        async (contractId, preferredPaymentId = null) => {
            if (!contractId) {
                setReconciliation(null); setAgingReport(null); setCreditLedger(null);
                setBillingAuditLogs([]); setPayments([]);
                setSelectedPaymentId(null); setSelectedPayment(null);
                return;
            }
            setLoadingWorkspace(true);
            try {
                const [report, aging, credit, logs, paymentPage] = await Promise.all([
                    getContractReconciliation(contractId),
                    getDebtAgingReport(contractId),
                    getCreditLedgerReport(contractId),
                    getBillingAuditLogs({ contractId }),
                    listPayments({ contractId, page: 0, size: 100 }),
                ]);
                const fetched = paymentPage?.content || [];
                setReconciliation(report); setAgingReport(aging); setCreditLedger(credit);
                setBillingAuditLogs(logs || []); setPayments(fetched);
                setPaymentSearch(""); setPaymentStatusFilter("ALL");
                setSelectedPaymentId(preferredPaymentId || selectedPaymentId || fetched[0]?.id || null);
                setSelectedPayment(null);
            } finally {
                setLoadingWorkspace(false);
            }
        },
        [selectedPaymentId]
    );

    useEffect(() => {
        (async () => {
            setLoadingContracts(true);
            try {
                const contracts = await getAllActiveContracts();
                setContractOptions((contracts || []).map(toContractOption));
                setContractMap(Object.fromEntries((contracts || []).map((c) => [c.id, c])));
                if (contracts?.length) setSelectedContractId((cur) => cur || contracts[0].id);
            } finally {
                setLoadingContracts(false);
            }
        })();
    }, []);

    useEffect(() => {
        refreshWorkspace(selectedContractId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedContractId]);

    useEffect(() => {
        if (!selectedPaymentId) { setSelectedPayment(null); return; }
        let cancelled = false;
        getPaymentById(selectedPaymentId)
            .then((p) => { if (!cancelled) setSelectedPayment(p); })
            .catch(() => { if (!cancelled) setSelectedPayment(null); });
        return () => { cancelled = true; };
    }, [selectedPaymentId, payments]);

    // ── Handlers ──
    const handleReceive = async (values) => {
        if (!selectedContractId) { message.warning("Hãy chọn hợp đồng trước."); return; }
        setSubmitting(true);
        try {
            const p = await receivePayment({
                contractId: selectedContractId,
                amount: values.amount,
                externalReference: values.externalReference,
                currency: values.currency || "VND",
                receivedAt: values.receivedAt?.toISOString(),
                note: values.note,
            });
            message.success("Đã ghi nhận thanh toán thành công");
            receiveForm.resetFields();
            await refreshWorkspace(selectedContractId, p.id);
        } catch (e) {
            message.error(getBillingUiErrorMessage(e, "Không thể ghi nhận thanh toán"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirm = useCallback(async (paymentId) => {
        try {
            const payment = selectedPayment?.id === paymentId
                ? selectedPayment
                : await getPaymentById(paymentId);
            confirmForm.setFieldsValue({
                note: "",
                evidenceReference: payment?.externalReference || "",
            });

            Modal.confirm({
                title: `Xác nhận thanh toán #${payment.id}`,
                icon: <CheckCircleOutlined />,
                width: 640,
                okText: "Xác nhận",
                cancelText: "Đóng",
                content: (
                    <div style={{marginTop: 16}}>
                        <Descriptions bordered size="small" column={1} style={{marginBottom: 16}}>
                            <Descriptions.Item label="Nguồn">{describePaymentSource(payment)}</Descriptions.Item>
                            <Descriptions.Item label="Bill liên quan">{payment.submittedBillCode || "—"}</Descriptions.Item>
                            <Descriptions.Item label="Phương thức">{payment.paymentMethod ? formatEnumLabel(payment.paymentMethod) : "—"}</Descriptions.Item>
                            <Descriptions.Item label="Người gửi / ghi nhận">{payment.createdByName || "—"}</Descriptions.Item>
                            <Descriptions.Item label="Mã tham chiếu">{payment.externalReference || "—"}</Descriptions.Item>
                            <Descriptions.Item label="Chứng từ">
                                {payment.proofFileId ? (
                                    <Space>
                                        <span>{payment.proofFileName || `File #${payment.proofFileId}`}</span>
                                        <Button size="small" onClick={() => handleOpenProofFile(payment, "view")}>Xem</Button>
                                    </Space>
                                ) : "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú từ tenant / thu ngân">{payment.note || "—"}</Descriptions.Item>
                        </Descriptions>
                        <Form form={confirmForm} layout="vertical">
                            <Form.Item
                                label="Ghi chú đối soát"
                                name="note"
                                extra="Nên ghi rõ lý do xác nhận, đối chiếu sao kê hoặc ghi chú nghiệp vụ."
                            >
                                <TextArea rows={3} placeholder="VD: Đã đối chiếu sao kê BIDV lúc 08:15, khớp số tiền và nội dung chuyển khoản." />
                            </Form.Item>
                            <Form.Item
                                label="Mã bằng chứng / sao kê"
                                name="evidenceReference"
                                extra="Có thể nhập mã giao dịch, id sao kê hoặc ref nội bộ của bộ phận kế toán."
                            >
                                <Input placeholder="VD: BIDV-STATEMENT-20260402-001" />
                            </Form.Item>
                        </Form>
                    </div>
                ),
                onOk: async () => {
                    try {
                        const values = await confirmForm.validateFields();
                        setSubmitting(true);
                        const p = await confirmPayment(paymentId, values);
                        message.success("Xác nhận thanh toán thành công");
                        await refreshWorkspace(selectedContractId, p.id);
                        confirmForm.resetFields();
                    } catch (e) {
                        if (e?.errorFields) {
                            return Promise.reject(e);
                        }
                        message.error(getBillingUiErrorMessage(e, "Không thể xác nhận"));
                    } finally {
                        setSubmitting(false);
                    }
                },
                onCancel: () => confirmForm.resetFields(),
            });
        } catch (e) {
            message.error(getBillingUiErrorMessage(e, "Không thể tải chi tiết thanh toán"));
        }
    }, [confirmForm, describePaymentSource, handleOpenProofFile, selectedContractId, selectedPayment]);

    const handleAutoAllocate = async (paymentId) => {
        setSubmitting(true);
        try {
            const p = await allocatePayment(paymentId, null);
            message.success("Phân bổ tự động thành công");
            await refreshWorkspace(selectedContractId, p.id);
        } catch (e) {
            message.error(getBillingUiErrorMessage(e, "Không thể phân bổ tự động"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleManualAllocate = async () => {
        if (!selectedPayment) { message.warning("Hãy chọn một khoản thanh toán."); return; }
        const allocations = outstandingInvoices
            .map((i) => ({ billId: i.billId, amount: Number(i.manualAmount || 0), outstandingAmount: Number(i.outstandingAmount || 0) }))
            .filter((i) => i.amount > 0);
        if (!allocations.length) { message.warning("Nhập ít nhất một số tiền > 0 để phân bổ thủ công."); return; }
        if (allocations.find((i) => i.amount > i.outstandingAmount)) { message.error("Có khoản phân bổ vượt outstanding của bill."); return; }
        if (allocations.reduce((s, i) => s + i.amount, 0) > selectedPaymentUnallocated) { message.error("Tổng vượt số tiền chưa phân bổ."); return; }
        setSubmitting(true);
        try {
            const p = await allocatePayment(selectedPayment.id, {
                allocations: allocations.map(({ billId, amount }) => ({ billId, amount })),
                note: "Manual allocation from finance workspace",
            });
            message.success("Phân bổ thủ công thành công");
            await refreshWorkspace(selectedContractId, p.id);
        } catch (e) {
            message.error(getBillingUiErrorMessage(e, "Không thể phân bổ thủ công"));
        } finally {
            setSubmitting(false);
        }
    };

    const openReverseModal = () => {
        if (!selectedPayment) { message.warning("Hãy chọn một khoản thanh toán."); return; }
        Modal.confirm({
            title: `Đảo ngược thanh toán #${selectedPayment.id}`,
            icon: <RollbackOutlined />,
            content: (
                <Form form={reverseForm} layout="vertical">
                    <Form.Item name="note" label="Lý do đảo ngược">
                        <TextArea rows={3} placeholder="VD: Thu nhầm, hoàn cọc, thử lại giao dịch..." />
                    </Form.Item>
                </Form>
            ),
            okText: "Đảo ngược",
            okButtonProps: { danger: true },
            cancelText: "Đóng",
            onOk: async () => {
                try {
                    const values = await reverseForm.validateFields();
                    const p = await reversePayment(selectedPayment.id, values);
                    message.success("Đã đảo ngược thanh toán");
                    reverseForm.resetFields();
                    await refreshWorkspace(selectedContractId, p.id);
                } catch (e) {
                    if (e?.errorFields) return Promise.reject(e);
                    message.error(getBillingUiErrorMessage(e, "Không thể đảo ngược"));
                }
            },
        });
    };

    // ── Table columns ──
    const paymentColumns = [
        {
            title: "Thanh toán",
            key: "id",
            render: (_, r) => (
                <>
                    <div className={cx("payId")}>#{r.id}</div>
                    <div className={cx("payRef")}>{r.externalReference || "—"}</div>
                    {summarizePaymentContext(r) && (
                        <div className={cx("payRef")}>{summarizePaymentContext(r)}</div>
                    )}
                </>
            ),
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            render: (v) => <span className={cx("amtPrimary")}>{formatCurrency(v)}</span>,
        },
        {
            title: "Đã phân bổ",
            dataIndex: "allocatedAmount",
            render: (v) => <span className={cx("amtSub")}>{formatCurrency(v)}</span>,
        },
        {
            title: "Chưa phân bổ",
            dataIndex: "unallocatedAmount",
            render: (v) => (
                <span className={cx(Number(v) > 0 ? "amtWarn" : "amtSub")}>{formatCurrency(v)}</span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (s) => <StatusTag status={s} meta={PAYMENT_STATUS_META} />,
        },
        {
            title: "Thao tác",
            key: "actions",
            fixed: "right",
            width: 220,
            render: (_, r) => {
                const canA = !["REVERSED", "FAILED"].includes(r.status) && Number(r.unallocatedAmount || 0) > 0;
                return (
                    <Space size={6}>
                        <Tooltip title="Chọn thanh toán này để xem và phân bổ">
                            <Button
                                size="small"
                                className={cx("btnGhost", "btnSm")}
                                icon={<ArrowRightOutlined />}
                                onClick={() => setSelectedPaymentId(r.id)}
                            >
                                {r.id === selectedPaymentId ? "Đang chọn" : "Chọn"}
                            </Button>
                        </Tooltip>
                        {r.status === "PENDING" && (
                            <Tooltip title="Xác nhận khoản thanh toán">
                                <Button
                                    size="small"
                                    className={cx("btnPrimary", "btnSm")}
                                    onClick={() => handleConfirm(r.id)}
                                >
                                    Xác nhận
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip title="Tự động phân bổ theo thứ tự ưu tiên">
                            <Button
                                size="small"
                                className={cx(canA ? "btnAccent" : "btnGhost", "btnSm")}
                                disabled={!canA}
                                icon={<ThunderboltOutlined />}
                                onClick={() => handleAutoAllocate(r.id)}
                            >
                                Tự động
                            </Button>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const invoiceColumns = [
        {
            title: "Hóa đơn",
            key: "billId",
            render: (_, r) => (
                <>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-1, #f0f4ff)" }}>
                        {r.generationKey || `#${r.billId}`}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3, #4e5f7c)", marginTop: 2 }}>
                        {r.billingPeriodStart} → {r.billingPeriodEnd}
                    </div>
                </>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "billStatus",
            render: (s) => <StatusTag status={s} meta={INVOICE_STATUS_META} />,
        },
        {
            title: "Còn nợ",
            dataIndex: "outstandingAmount",
            render: (v) => <span className={cx("amtWarn")} style={{ fontWeight: 800 }}>{formatCurrency(v)}</span>,
        },
        {
            title: "Phân bổ thủ công",
            key: "manual",
            render: (_, r) => (
                <InputNumber
                    min={0}
                    max={Number(r.outstandingAmount || 0)}
                    precision={0}
                    value={r.manualAmount}
                    disabled={!canAllocate}
                    style={{ width: 130 }}
                    onChange={(v) =>
                        setReconciliation((cur) => ({
                            ...cur,
                            invoices: (cur?.invoices || []).map((i) =>
                                i.billId === r.billId ? { ...i, manualAmount: v || 0 } : i
                            ),
                        }))
                    }
                />
            ),
        },
    ];

    // ─────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────
    return (
        <div className={cx("wrapper")}>

            {/* ════ Top navigation bar ════ */}
            <header className={cx("topBar")}>
                <div className={cx("topBarLeft")}>
                    <div className={cx("brandIcon")}>
                        <WalletOutlined />
                    </div>
                    <span className={cx("brandName")}>FinanceOps</span>
                    <span className={cx("brandSep")} />
                    <span className={cx("pageTitle")}>Quản lý Thanh toán</span>
                </div>

                <div className={cx("topBarRight")}>
                    <Select
                        showSearch
                        className={cx("contractSelector")}
                        style={{ minWidth: 320 }}
                        placeholder="Chọn hợp đồng..."
                        options={contractOptions}
                        value={selectedContractId}
                        loading={loadingContracts}
                        onChange={setSelectedContractId}
                        optionFilterProp="label"
                        suffixIcon={<FilterOutlined />}
                    />
                    <Tooltip title="Làm mới toàn bộ dữ liệu workspace">
                        <Button
                            className={cx("btnGhost")}
                            icon={<ReloadOutlined />}
                            onClick={() => refreshWorkspace(selectedContractId, selectedPaymentId)}
                        >
                            Làm mới
                        </Button>
                    </Tooltip>
                </div>
            </header>

            {/* ════ No contract ════ */}
            {!selectedContractId ? (
                <div className={cx("fullEmpty")}>
                    <BankOutlined />
                    <p>Chưa có hợp đồng active để thao tác</p>
                </div>
            ) : (
                <Spin spinning={loadingWorkspace || submitting} tip="Đang tải...">
                    <main className={cx("content")}>

                        {/* ════ KPI strip ════ */}
                        <div className={cx("kpiStrip")}>
                            {KPI_CONFIG.map(({ key, label, icon, cls }) => {
                                const value =
                                    key === "creditBalance"
                                        ? creditLedger?.currentBalance
                                        : reconciliation?.[key];
                                return (
                                    <div key={key} className={cx("kpiCard", cls)}>
                                        <div className={cx("kpiIconWrap")}>{icon}</div>
                                        <div className={cx("kpiInfo")}>
                                            <div className={cx("kpiLabel")}>{label}</div>
                                            <div className={cx("kpiValue")}>{formatCurrency(value)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ════ Row 1: Receive form + Payment list ════ */}
                        <div className={cx("mainGrid")}>

                            {/* Receive form */}
                            <div className={cx("card")}>
                                <div className={cx("cardHead")}>
                                    <div className={cx("cardTitle")}>
                                        <PlusOutlined />
                                        Ghi nhận thanh toán
                                    </div>
                                </div>
                                <div className={cx("cardBody")}>
                                    {/* Contract strip */}
                                    <div className={cx("contractStrip")}>
                                        <div className={cx("contractStripItem")}>
                                            <span className={cx("contractStripLabel")}>Khu trọ</span>
                                            <span className={cx("contractStripValue")}>
                                                {selectedContract?.boardingHouseName || "—"}
                                            </span>
                                        </div>
                                        <span className={cx("contractStripDivider")} />
                                        <div className={cx("contractStripItem")}>
                                            <span className={cx("contractStripLabel")}>Phòng</span>
                                            <span className={cx("contractStripValue", "contractStripValue--accent")}>
                                                P.{selectedContract?.roomNumber || "?"}
                                            </span>
                                        </div>
                                        <span className={cx("contractStripDivider")} />
                                        <div className={cx("contractStripItem")}>
                                            <span className={cx("contractStripLabel")}>Người thuê</span>
                                            <span className={cx("contractStripValue")}>
                                                {selectedContract?.tenantFullName || "—"}
                                            </span>
                                        </div>
                                    </div>

                                    <Form layout="vertical" form={receiveForm} onFinish={handleReceive}>
                                        <Form.Item
                                            label="Số tiền (₫)"
                                            name="amount"
                                            rules={[{ required: true, message: "Nhập số tiền" }]}
                                        >
                                            <InputNumber
                                                style={{ width: "100%" }}
                                                min={1}
                                                precision={0}
                                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Mã tham chiếu"
                                            name="externalReference"
                                            rules={[{ required: true, message: "Nhập mã tham chiếu" }]}
                                        >
                                            <Input placeholder="VD: CK-20260329-001" />
                                        </Form.Item>
                                        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
                                            <Form.Item label="Tiền tệ" name="currency" initialValue="VND">
                                                <Input />
                                            </Form.Item>
                                            <Form.Item label="Ngày nhận tiền" name="receivedAt">
                                                <DatePicker
                                                    showTime
                                                    style={{ width: "100%" }}
                                                    format="DD/MM/YYYY HH:mm"
                                                    disabledDate={(d) => d && d > dayjs().endOf("day")}
                                                />
                                            </Form.Item>
                                        </div>
                                        <Form.Item label="Ghi chú" name="note">
                                            <TextArea rows={2} />
                                        </Form.Item>
                                        <Button className={cx("btnReceive")} htmlType="submit">
                                            <WalletOutlined /> Ghi nhận thanh toán
                                        </Button>
                                    </Form>

                                    {/* Aging buckets */}
                                    {(agingReport?.buckets || []).filter((b) => Number(b.outstandingAmount || 0) > 0).length > 0 && (
                                        <div className={cx("miniPanel")}>
                                            <div className={cx("miniPanelHead", "miniPanelHead--amber")}>
                                                <ClockCircleOutlined /> Phân tầng tuổi nợ
                                            </div>
                                            {(agingReport.buckets || [])
                                                .filter((b) => Number(b.outstandingAmount || 0) > 0)
                                                .map((b) => (
                                                    <div key={b.bucketCode} className={cx("agingRow")}>
                                                        <span className={cx("agingLabel")}>{b.label}</span>
                                                        <div>
                                                            <div className={cx("agingAmount")}>{formatCurrency(b.outstandingAmount)}</div>
                                                            <div className={cx("agingCount")}>{b.invoiceCount} hóa đơn</div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {/* Overdue invoices */}
                                    {agingInvoices.slice(0, 4).length > 0 && (
                                        <div className={cx("miniPanel", "miniPanel--red")}>
                                            <div className={cx("miniPanelHead", "miniPanelHead--red")}>
                                                <WarningOutlined /> Hóa đơn quá hạn
                                            </div>
                                            {agingInvoices.slice(0, 4).map((inv) => (
                                                <div key={inv.billId} className={cx("overdueRow")}>
                                                    <div>
                                                        <div className={cx("overdueCode")}>{inv.billCode || `#${inv.billId}`}</div>
                                                        <div className={cx("overdueDays")}>Quá hạn {inv.ageDays || 0} ngày</div>
                                                    </div>
                                                    <span className={cx("overdueAmount")}>{formatCurrency(inv.outstandingAmount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment list */}
                            <div className={cx("card")}>
                                <div className={cx("cardHead")}>
                                    <div className={cx("cardTitle")}>
                                        <CreditCardOutlined />
                                        Danh sách thanh toán
                                    </div>
                                    <span className={cx("cardBadge")}>
                                        {filteredPayments.length} / {payments.length}
                                    </span>
                                </div>

                                <div className={cx("cardBodyZero")}>
                                    {/* Toolbar */}
                                    <div className={cx("paymentToolbar")}>
                                        <Input
                                            allowClear
                                            prefix={<SearchOutlined style={{ color: "#4e5f7c" }} />}
                                            placeholder="Tìm theo mã thanh toán hoặc tham chiếu..."
                                            value={paymentSearch}
                                            onChange={(e) => setPaymentSearch(e.target.value)}
                                        />
                                        <Select
                                            value={paymentStatusFilter}
                                            onChange={setPaymentStatusFilter}
                                            style={{ width: 190 }}
                                            options={[
                                                { value: "ALL", label: "Tất cả trạng thái" },
                                                ...Object.entries(PAYMENT_STATUS_META).map(([v, m]) => ({
                                                    value: v,
                                                    label: m.text,
                                                })),
                                            ]}
                                        />
                                    </div>

                                    {/* Summary strip */}
                                    <div className={cx("summaryStrip")}>
                                        <div className={cx("summaryCell")}>
                                            <span className={cx("summaryCellLabel")}>Chờ xác nhận</span>
                                            <span className={cx("summaryCellValue", "summaryCellValue--amber")}>
                                                {paymentSummary.pendingCount}
                                            </span>
                                        </div>
                                        <div className={cx("summaryCell")}>
                                            <span className={cx("summaryCellLabel")}>Có thể phân bổ</span>
                                            <span className={cx("summaryCellValue", "summaryCellValue--blue")}>
                                                {paymentSummary.actionableCount}
                                            </span>
                                        </div>
                                        <div className={cx("summaryCell")}>
                                            <span className={cx("summaryCellLabel")}>Chưa phân bổ</span>
                                            <span className={cx("summaryCellValue", "summaryCellValue--violet")}>
                                                {formatCurrency(paymentSummary.totalUnallocated)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className={cx("tableWrap")}>
                                        <Table
                                            rowKey="id"
                                            size="small"
                                            columns={paymentColumns}
                                            dataSource={filteredPayments}
                                            scroll={{ x: 700 }}
                                            pagination={{ size: "small", pageSize: 8 }}
                                            locale={{
                                                emptyText: (
                                                    <Empty description={
                                                        <span style={{ color: "#4e5f7c", fontSize: 13 }}>
                                                            Chưa có khoản thanh toán nào
                                                        </span>
                                                    } />
                                                ),
                                            }}
                                            rowClassName={(r) => r.id === selectedPaymentId ? cx("selectedRow") : ""}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ════ Row 2: Allocation + Detail ════ */}
                        <div className={cx("allocationGrid")}>

                            {/* Allocation workspace */}
                            <div className={cx("card")}>
                                <div className={cx("cardHead")}>
                                    <div className={cx("cardTitle")}>
                                        <DollarOutlined />
                                        Phân bổ thanh toán
                                    </div>
                                </div>
                                <div className={cx("cardBody")}>
                                    {!selectedPayment ? (
                                        <div className={cx("emptyState")}>
                                            <ArrowRightOutlined />
                                            <span>Chọn một khoản thanh toán từ danh sách bên trên để phân bổ</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={cx(
                                                "paymentBanner",
                                                selectedPayment.status === "PENDING"
                                                    ? "paymentBanner--pending"
                                                    : "paymentBanner--normal"
                                            )}>
                                                <span className={cx("paymentBannerIcon")}>
                                                    {selectedPayment.status === "PENDING"
                                                        ? <ClockCircleOutlined />
                                                        : <CheckCircleOutlined />}
                                                </span>
                                                <div className={cx("paymentBannerBody")}>
                                                    <div className={cx("paymentBannerTitle")}>
                                                        Thanh toán #{selectedPayment.id}
                                                        <StatusTag status={selectedPayment.status} meta={PAYMENT_STATUS_META} />
                                                    </div>
                                                    <div className={cx("paymentBannerDesc")}>
                                                        {selectedPayment.status === "PENDING"
                                                            ? "Khoản này đang chờ xác nhận. "
                                                            : ""}
                                                        {selectedPayment.source === "TENANT_SUBMITTED" && (
                                                            <>
                                                                Tenant đã gửi xác nhận
                                                                {selectedPayment.submittedBillCode ? ` cho bill ${selectedPayment.submittedBillCode}. ` : ". "}
                                                            </>
                                                        )}
                                                        Chưa phân bổ:{" "}
                                                        <strong className={cx("amtWarn")}>
                                                            {formatCurrency(selectedPayment.unallocatedAmount)}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={cx("allocationMeta")}>
                                                <span>
                                                    Tổng phân bổ thủ công:{" "}
                                                    <strong className={cx("allocationMetaValue")}>
                                                        {formatCurrency(manualAllocationDraft)}
                                                    </strong>
                                                </span>
                                                <span>
                                                    Còn lại:{" "}
                                                    <strong
                                                        className={cx(
                                                            Math.max(selectedPaymentUnallocated - manualAllocationDraft, 0) > 0
                                                                ? "allocationMetaValue--warn"
                                                                : "allocationMetaValue--ok"
                                                        )}
                                                    >
                                                        {formatCurrency(Math.max(selectedPaymentUnallocated - manualAllocationDraft, 0))}
                                                    </strong>
                                                </span>
                                            </div>

                                            <div className={cx("tableWrap")}>
                                                <Table
                                                    rowKey="billId"
                                                    size="small"
                                                    columns={invoiceColumns}
                                                    dataSource={outstandingInvoices}
                                                    scroll={{ x: 500 }}
                                                    pagination={false}
                                                    locale={{
                                                        emptyText: (
                                                            <Empty description={
                                                                <span style={{ color: "#4e5f7c", fontSize: 13 }}>
                                                                    Không có hóa đơn nào cần phân bổ
                                                                </span>
                                                            } />
                                                        ),
                                                    }}
                                                />
                                            </div>

                                            <div className={cx("actionBar")}>
                                                <Tooltip title="Phân bổ thủ công theo số tiền đã nhập">
                                                    <Button
                                                        className={cx("btnPrimary")}
                                                        disabled={!canAllocate}
                                                        onClick={handleManualAllocate}
                                                        icon={<CheckCircleOutlined />}
                                                    >
                                                        Phân bổ thủ công
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="Tự động phân bổ theo thứ tự ưu tiên hệ thống">
                                                    <Button
                                                        className={cx(canAllocate ? "btnAccent" : "btnGhost")}
                                                        disabled={!canAllocate}
                                                        onClick={() => handleAutoAllocate(selectedPayment.id)}
                                                        icon={<ThunderboltOutlined />}
                                                    >
                                                        Phân bổ tự động
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="Đảo ngược và hoàn lại toàn bộ khoản thanh toán">
                                                    <Button
                                                        className={cx(canReverse ? "btnDanger" : "btnGhost")}
                                                        disabled={!canReverse}
                                                        onClick={openReverseModal}
                                                        icon={<RollbackOutlined />}
                                                    >
                                                        Đảo ngược
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Payment detail */}
                            <div className={cx("card")}>
                                <div className={cx("cardHead")}>
                                    <div className={cx("cardTitle")}>
                                        <AuditOutlined />
                                        Chi tiết thanh toán
                                    </div>
                                </div>
                                <div className={cx("cardBody")}>
                                    {!selectedPayment ? (
                                        <div className={cx("emptyState")}>
                                            <AuditOutlined />
                                            <span>Chọn khoản thanh toán để xem chi tiết</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Descriptions column={1} size="small" bordered>
                                                {[
                                                    ["Mã thanh toán",  <span className={cx("detailMonoId")}>#{selectedPayment.id}</span>],
                                                    ["Mã tham chiếu",  selectedPayment.externalReference || "—"],
                                                    ["Nguồn",          describePaymentSource(selectedPayment)],
                                                    ["Trạng thái",     <StatusTag status={selectedPayment.status} meta={PAYMENT_STATUS_META} />],
                                                    ["Bill liên quan", selectedPayment.submittedBillCode || "—"],
                                                    ["Phương thức",    selectedPayment.paymentMethod ? formatEnumLabel(selectedPayment.paymentMethod) : "—"],
                                                    ["Người gửi / ghi nhận", selectedPayment.createdByName || "—"],
                                                    ["Chứng từ",       selectedPayment.proofFileId ? (
                                                        <Space>
                                                            <span>{selectedPayment.proofFileName || `File #${selectedPayment.proofFileId}`}</span>
                                                            <Button size="small" onClick={() => handleOpenProofFile(selectedPayment, "view")}>Xem</Button>
                                                            <Button size="small" onClick={() => handleOpenProofFile(selectedPayment, "download")}>Tải</Button>
                                                        </Space>
                                                    ) : "—"],
                                                    ["Số tiền",        <span className={cx("detailAmtLg")}>{formatCurrency(selectedPayment.amount)}</span>],
                                                    ["Đã phân bổ",     <span className={cx("detailAlloc")}>{formatCurrency(selectedPayment.allocatedAmount)}</span>],
                                                    ["Chưa phân bổ",   <span className={cx("detailUnalloc")}>{formatCurrency(selectedPayment.unallocatedAmount)}</span>],
                                                    ["Ngày nhận",      selectedPayment.receivedAt  ? dayjs(selectedPayment.receivedAt).format("DD/MM/YYYY HH:mm")  : "—"],
                                                    ["Ngày xác nhận",  selectedPayment.confirmedAt ? dayjs(selectedPayment.confirmedAt).format("DD/MM/YYYY HH:mm") : "—"],
                                                    ["Ghi chú",        selectedPayment.note || "—"],
                                                ].map(([label, value], i) => (
                                                    <Descriptions.Item
                                                        key={i}
                                                        label={label}
                                                    >
                                                        {value}
                                                    </Descriptions.Item>
                                                ))}
                                            </Descriptions>

                                            <div className={cx("allocHistory")}>
                                                <div className={cx("allocHistoryTitle")}>Lịch sử phân bổ</div>
                                                {!(selectedPayment.allocations || []).length ? (
                                                    <div className={cx("allocEmpty")}>Chưa có lịch sử phân bổ</div>
                                                ) : (
                                                    (selectedPayment.allocations || []).map((a) => (
                                                        <div key={a.id} className={cx("allocHistoryItem")}>
                                                            <div>
                                                                <span className={cx("allocBillId")}>Bill #{a.billId}</span>
                                                                <span className={cx("allocTypeMeta")}>{formatEnumLabel(a.allocationType)}</span>
                                                            </div>
                                                            <span className={cx("allocAmt")}>{formatCurrency(a.amount)}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ════ Row 3: Credit ledger + Audit log ════ */}
                        <div className={cx("bottomGrid")}>

                            {/* Credit ledger */}
                            <div className={cx("card")}>
                                <div className={cx("cardHead")}>
                                    <div className={cx("cardTitle")}>
                                        <WalletOutlined style={{ color: "#a78bfa" }} />
                                        Credit Ledger
                                    </div>
                                    <span className={cx("creditBal")}>
                                        Số dư: <strong>{formatCurrency(creditLedger?.currentBalance)}</strong>
                                    </span>
                                </div>
                                <div className={cx("cardBody")}>
                                    {!creditEntries.length ? (
                                        <div className={cx("emptyState")} style={{ padding: "36px 0" }}>
                                            <WalletOutlined />
                                            <span>Chưa có giao dịch tín dụng</span>
                                        </div>
                                    ) : (
                                        creditEntries.map((e) => (
                                            <div key={e.id} className={cx("creditRow")}>
                                                <div>
                                                    <div className={cx("creditType")}>{formatEnumLabel(e.entryType)}</div>
                                                    {e.billId    && <div className={cx("creditBill")}>Bill #{e.billId}</div>}
                                                    {e.createdAt && <div className={cx("creditDate")}>{dayjs(e.createdAt).format("DD/MM/YYYY HH:mm")}</div>}
                                                </div>
                                                <span className={cx(Number(e.amount || 0) >= 0 ? "creditPos" : "creditNeg")}>
                                                    {formatCurrency(e.amount)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Audit log */}
                            <div className={cx("card")}>
                                <div className={cx("cardHead")}>
                                    <div className={cx("cardTitle")}>
                                        <HistoryOutlined />
                                        Nhật ký thao tác
                                    </div>
                                </div>
                                <div className={cx("cardBody")}>
                                    {!(billingAuditLogs || []).slice(0, 8).length ? (
                                        <div className={cx("emptyState")} style={{ padding: "36px 0" }}>
                                            <HistoryOutlined />
                                            <span>Chưa có nhật ký thao tác</span>
                                        </div>
                                    ) : (
                                        (billingAuditLogs || []).slice(0, 8).map((log) => (
                                            <div key={log.id} className={cx("auditItem")}>
                                                <div className={cx("auditOp")}>{formatEnumLabel(log.operationType)}</div>
                                                <div className={cx("auditMeta")}>
                                                    <span>{formatEnumLabel(log.targetType)} #{log.targetId}</span>
                                                    <span className={cx("auditSep")}>·</span>
                                                    <span>{log.actorName || "Hệ thống"}</span>
                                                    <span className={cx("auditSep")}>·</span>
                                                    <span>{log.createdAt ? dayjs(log.createdAt).format("DD/MM/YYYY HH:mm") : "—"}</span>
                                                </div>
                                                {summarizeAuditMetadata(log) && (
                                                    <div className={cx("auditMeta")}>{summarizeAuditMetadata(log)}</div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </main>
                </Spin>
            )}
        </div>
    );
}

export default AdminPaymentManagement;
