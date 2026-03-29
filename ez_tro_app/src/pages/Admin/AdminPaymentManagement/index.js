import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import {
    CheckCircleOutlined,
    CreditCardOutlined,
    DollarOutlined,
    HistoryOutlined,
    ReloadOutlined,
    RollbackOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import classNames from "classnames/bind";
import dayjs from "dayjs";
import styles from "./AdminPaymentManagement.module.scss";
import { getAllActiveContracts } from "~/service/admin/contract";
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
const { Title, Text } = Typography;
const { TextArea } = Input;

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const toContractOption = (contract) => ({
    label: `${contract.boardingHouseName || "Khu trọ"} · P.${contract.roomNumber || "?"} · ${
        contract.tenantFullName || "Không rõ người thuê"
    }`,
    value: contract.id,
});

const paymentStatusMeta = {
    PENDING: { color: "orange", text: "Chờ xác nhận" },
    CONFIRMED: { color: "blue", text: "Đã xác nhận" },
    PARTIALLY_ALLOCATED: { color: "processing", text: "Phân bổ một phần" },
    FULLY_ALLOCATED: { color: "success", text: "Đã phân bổ hết" },
    OVERPAID: { color: "purple", text: "Dư tiền / credit" },
    REVERSED: { color: "default", text: "Đã reverse" },
    FAILED: { color: "error", text: "Thất bại" },
};

const invoiceStatusMeta = {
    PAID: { color: "success", text: "Đã thanh toán" },
    UNPAID: { color: "warning", text: "Chưa thanh toán" },
    OVERDUE: { color: "error", text: "Quá hạn" },
    PARTIALLY_PAID: { color: "processing", text: "Thanh toán một phần" },
    CANCELLED: { color: "default", text: "Đã hủy" },
};

const formatEnumLabel = (value) =>
    String(value || "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

function AdminPaymentManagement() {
    const [contractOptions, setContractOptions] = useState([]);
    const [contractMap, setContractMap] = useState({});
    const [selectedContractId, setSelectedContractId] = useState(null);
    const [reconciliation, setReconciliation] = useState(null);
    const [agingReport, setAgingReport] = useState(null);
    const [creditLedger, setCreditLedger] = useState(null);
    const [billingAuditLogs, setBillingAuditLogs] = useState([]);
    const [payments, setPayments] = useState([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [loadingContracts, setLoadingContracts] = useState(false);
    const [loadingWorkspace, setLoadingWorkspace] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
    const [paymentSearch, setPaymentSearch] = useState("");

    const [receiveForm] = Form.useForm();
    const [reverseForm] = Form.useForm();

    const selectedContract = selectedContractId ? contractMap[selectedContractId] : null;

    const outstandingInvoices = useMemo(
        () =>
            (reconciliation?.invoices || []).filter(
                (invoice) => Number(invoice.outstandingAmount || 0) > 0 && invoice.billStatus !== "CANCELLED"
            ),
        [reconciliation]
    );

    const selectedPaymentUnallocated = Number(selectedPayment?.unallocatedAmount || 0);

    const paymentTableData = useMemo(
        () =>
            payments.map((payment) => ({
                ...payment,
                key: payment.id,
            })),
        [payments]
    );

    const filteredPayments = useMemo(() => {
        const normalizedSearch = paymentSearch.trim().toLowerCase();
        return paymentTableData.filter((payment) => {
            const matchStatus = paymentStatusFilter === "ALL" || payment.status === paymentStatusFilter;
            const matchSearch =
                !normalizedSearch ||
                String(payment.id).includes(normalizedSearch) ||
                String(payment.externalReference || "").toLowerCase().includes(normalizedSearch);
            return matchStatus && matchSearch;
        });
    }, [paymentSearch, paymentStatusFilter, paymentTableData]);

    const paymentSummary = useMemo(
        () => ({
            pendingCount: payments.filter((payment) => payment.status === "PENDING").length,
            actionableCount: payments.filter(
                (payment) =>
                    !["REVERSED", "FAILED"].includes(payment.status) &&
                    Number(payment.unallocatedAmount || 0) > 0
            ).length,
            totalUnallocated: payments.reduce(
                (sum, payment) => sum + Number(payment.unallocatedAmount || 0),
                0
            ),
        }),
        [payments]
    );

    const agingInvoices = useMemo(
        () =>
            [...(agingReport?.invoices || [])]
                .filter((invoice) => Number(invoice.outstandingAmount || 0) > 0)
                .sort((left, right) => Number(right.ageDays || 0) - Number(left.ageDays || 0)),
        [agingReport]
    );

    const creditEntries = useMemo(
        () =>
            [...(creditLedger?.entries || [])]
                .sort((left, right) => {
                    const leftTime = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
                    const rightTime = right?.createdAt ? new Date(right.createdAt).getTime() : 0;
                    return rightTime - leftTime;
                })
                .slice(0, 6),
        [creditLedger]
    );

    const manualAllocationDraft = useMemo(
        () =>
            outstandingInvoices.reduce((sum, invoice) => sum + Number(invoice.manualAmount || 0), 0),
        [outstandingInvoices]
    );

    const canAllocateSelectedPayment =
        !!selectedPayment &&
        !["REVERSED", "FAILED"].includes(selectedPayment.status) &&
        Number(selectedPayment.unallocatedAmount || 0) > 0;
    const canReverseSelectedPayment =
        !!selectedPayment && !["REVERSED", "FAILED"].includes(selectedPayment.status);

    const refreshWorkspace = useCallback(
        async (contractId, preferredPaymentId = null) => {
            if (!contractId) {
                setReconciliation(null);
                setAgingReport(null);
                setCreditLedger(null);
                setBillingAuditLogs([]);
                setPayments([]);
                setSelectedPaymentId(null);
                setSelectedPayment(null);
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
                const fetchedPayments = paymentPage?.content || [];

                setReconciliation(report);
                setAgingReport(aging);
                setCreditLedger(credit);
                setBillingAuditLogs(logs || []);
                setPayments(fetchedPayments);
                setPaymentSearch("");
                setPaymentStatusFilter("ALL");

                const fallbackPayment =
                    preferredPaymentId || selectedPaymentId || fetchedPayments[0]?.id || null;
                setSelectedPaymentId(fallbackPayment);
                setSelectedPayment(null);
            } finally {
                setLoadingWorkspace(false);
            }
        },
        [selectedPaymentId]
    );

    useEffect(() => {
        const loadContracts = async () => {
            setLoadingContracts(true);
            try {
                const contracts = await getAllActiveContracts();
                const options = (contracts || []).map(toContractOption);
                const map = Object.fromEntries((contracts || []).map((contract) => [contract.id, contract]));
                setContractOptions(options);
                setContractMap(map);
                if (contracts?.length) {
                    setSelectedContractId((current) => current || contracts[0].id);
                }
            } finally {
                setLoadingContracts(false);
            }
        };

        loadContracts();
    }, []);

    useEffect(() => {
        refreshWorkspace(selectedContractId);
    }, [selectedContractId, refreshWorkspace]);

    const handleReceive = async (values) => {
        if (!selectedContractId) {
            message.warning("Hãy chọn hợp đồng trước khi nhận thanh toán.");
            return;
        }

        setSubmitting(true);
        try {
            const payment = await receivePayment({
                contractId: selectedContractId,
                amount: values.amount,
                externalReference: values.externalReference,
                currency: values.currency || "VND",
                receivedAt: values.receivedAt ? values.receivedAt.toISOString() : undefined,
                note: values.note,
            });
            message.success("Đã ghi nhận thanh toán");
            receiveForm.resetFields();
            await refreshWorkspace(selectedContractId, payment.id);
        } catch (error) {
            message.error(getBillingUiErrorMessage(error, "Không thể ghi nhận thanh toán"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirm = async (paymentId) => {
        setSubmitting(true);
        try {
            const payment = await confirmPayment(paymentId);
            message.success("Đã xác nhận thanh toán");
            await refreshWorkspace(selectedContractId, payment.id);
        } catch (error) {
            message.error(getBillingUiErrorMessage(error, "Không thể xác nhận thanh toán"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleAutoAllocate = async (paymentId) => {
        setSubmitting(true);
        try {
            const payment = await allocatePayment(paymentId, null);
            message.success("Đã auto allocate thanh toán");
            await refreshWorkspace(selectedContractId, payment.id);
        } catch (error) {
            message.error(getBillingUiErrorMessage(error, "Không thể phân bổ thanh toán"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleManualAllocate = async () => {
        if (!selectedPayment) {
            message.warning("Hãy chọn payment trước khi manual allocate.");
            return;
        }

        const allocations = outstandingInvoices
            .map((invoice) => ({
                billId: invoice.billId,
                amount: Number(invoice.manualAmount || 0),
                outstandingAmount: Number(invoice.outstandingAmount || 0),
            }))
            .filter((invoice) => invoice.amount > 0);

        if (!allocations.length) {
            message.warning("Nhập ít nhất một amount > 0 để manual allocate.");
            return;
        }

        const invalidItem = allocations.find((item) => item.amount > item.outstandingAmount);
        if (invalidItem) {
            message.error("Có khoản phân bổ vượt outstanding của bill.");
            return;
        }

        const totalManual = allocations.reduce((sum, item) => sum + item.amount, 0);
        if (totalManual > selectedPaymentUnallocated) {
            message.error("Tổng manual allocation vượt phần tiền chưa phân bổ của payment.");
            return;
        }

        setSubmitting(true);
        try {
            const payment = await allocatePayment(selectedPayment.id, {
                allocations: allocations.map(({ billId, amount }) => ({ billId, amount })),
                note: "Manual allocation from finance workspace",
            });
            message.success("Đã manual allocate thành công");
            await refreshWorkspace(selectedContractId, payment.id);
        } catch (error) {
            message.error(getBillingUiErrorMessage(error, "Không thể manual allocate"));
        } finally {
            setSubmitting(false);
        }
    };

    const openReverseModal = () => {
        if (!selectedPayment) {
            message.warning("Hãy chọn payment trước khi reverse.");
            return;
        }

        Modal.confirm({
            title: `Reverse payment #${selectedPayment.id}`,
            icon: <RollbackOutlined />,
            content: (
                <Form form={reverseForm} layout="vertical">
                    <Form.Item name="note" label="Lý do reverse">
                        <TextArea rows={3} placeholder="Ví dụ: thu nhầm, hoàn cọc, retry giao dịch..." />
                    </Form.Item>
                </Form>
            ),
            okText: "Reverse",
            okButtonProps: { danger: true },
            cancelText: "Đóng",
            onOk: async () => {
                try {
                    const values = await reverseForm.validateFields();
                    const payment = await reversePayment(selectedPayment.id, values);
                    message.success("Đã reverse payment");
                    reverseForm.resetFields();
                    await refreshWorkspace(selectedContractId, payment.id);
                } catch (error) {
                    if (error?.errorFields) {
                        return Promise.reject(error);
                    }
                    message.error(getBillingUiErrorMessage(error, "Không thể reverse payment"));
                }
                return undefined;
            },
        });
    };

    const paymentColumns = [
        {
            title: "Payment",
            dataIndex: "id",
            key: "id",
            render: (_, record) => (
                <div>
                    <div className={cx("paymentCode")}>#{record.id}</div>
                    <div className={cx("paymentRef")}>{record.externalReference}</div>
                </div>
            ),
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            render: (value) => <strong>{formatCurrency(value)}</strong>,
        },
        {
            title: "Đã phân bổ",
            dataIndex: "allocatedAmount",
            key: "allocatedAmount",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Chưa phân bổ",
            dataIndex: "unallocatedAmount",
            key: "unallocatedAmount",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const meta = paymentStatusMeta[status] || { color: "default", text: status };
                return <Tag color={meta.color}>{meta.text}</Tag>;
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => {
                const canAllocate =
                    !["REVERSED", "FAILED"].includes(record.status) &&
                    Number(record.unallocatedAmount || 0) > 0;
                return (
                    <Space wrap>
                        <Button size="small" onClick={() => setSelectedPaymentId(record.id)}>
                        Chọn
                        </Button>
                        {record.status === "PENDING" && (
                            <Button size="small" type="primary" onClick={() => handleConfirm(record.id)}>
                            Confirm
                            </Button>
                        )}
                        <Button size="small" onClick={() => handleAutoAllocate(record.id)} disabled={!canAllocate}>
                            Auto allocate
                        </Button>
                    </Space>
                );
            },
        },
    ];

    useEffect(() => {
        if (!selectedPaymentId) {
            setSelectedPayment(null);
            return;
        }

        let cancelled = false;

        const loadSelectedPayment = async () => {
            try {
                const payment = await getPaymentById(selectedPaymentId);
                if (!cancelled) {
                    setSelectedPayment(payment);
                }
            } catch (error) {
                if (!cancelled) {
                    setSelectedPayment(null);
                }
            }
        };

        loadSelectedPayment();

        return () => {
            cancelled = true;
        };
    }, [selectedPaymentId, payments]);

    const invoiceColumns = [
        {
            title: "Bill",
            dataIndex: "billId",
            key: "billId",
            render: (_, record) => (
                <div>
                    <div className={cx("billCode")}>{record.generationKey || `#${record.billId}`}</div>
                    <div className={cx("paymentRef")}>{record.billingPeriodStart} → {record.billingPeriodEnd}</div>
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "billStatus",
            key: "billStatus",
            render: (status) => {
                const meta = invoiceStatusMeta[status] || { color: "default", text: status };
                return <Tag color={meta.color}>{meta.text}</Tag>;
            },
        },
        {
            title: "Outstanding",
            dataIndex: "outstandingAmount",
            key: "outstandingAmount",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Manual allocate",
            key: "manual",
            render: (_, record) => (
                <InputNumber
                    min={0}
                    max={Number(record.outstandingAmount || 0)}
                    precision={0}
                    value={record.manualAmount}
                    disabled={!canAllocateSelectedPayment}
                    onChange={(value) => {
                        setReconciliation((current) => ({
                            ...current,
                            invoices: (current?.invoices || []).map((invoice) =>
                                invoice.billId === record.billId ? { ...invoice, manualAmount: value || 0 } : invoice
                            ),
                        }));
                    }}
                />
            ),
        },
    ];

    const auditItems = (billingAuditLogs || []).slice(0, 8);

    return (
        <div className={cx("payment-wrapper")}>
            <div className={cx("page-header")}>
                {/*<Title level={3} className={cx("page-title")}>*/}
                {/*    <WalletOutlined />*/}
                {/*    Finance Workspace*/}
                {/*</Title>*/}
                <p className={cx("page-description")}>
                    Chọn hợp đồng đang active để nhận payment, allocate/reverse và theo dõi reconciliation theo thời gian thực.
                </p>
            </div>

            <Card className={cx("filter-card")}>
                <Space wrap className={cx("filter-space")}>
                    <Select
                        showSearch
                        style={{ minWidth: 360 }}
                        placeholder="Chọn hợp đồng"
                        options={contractOptions}
                        value={selectedContractId}
                        loading={loadingContracts}
                        onChange={setSelectedContractId}
                        optionFilterProp="label"
                    />
                    <Button icon={<ReloadOutlined />} onClick={() => refreshWorkspace(selectedContractId, selectedPaymentId)}>
                        Làm mới dữ liệu
                    </Button>
                </Space>
            </Card>

            {!selectedContractId ? (
                <Card className={cx("table-card")}>
                    <Empty description="Chưa có hợp đồng active để thao tác" />
                </Card>
            ) : (
                <Spin spinning={loadingWorkspace || submitting}>
                    <Row gutter={[16, 16]} className={cx("statistics-row")}>
                        <Col xs={24} md={12} xl={6}>
                            <Card className={cx("stat-card", "primary")}>
                                <Statistic
                                    title="Tổng hóa đơn"
                                    value={Number(reconciliation?.invoiceTotal || 0)}
                                    formatter={(value) => formatCurrency(value)}
                                    prefix={<DollarOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Card className={cx("stat-card", "success")}>
                                <Statistic
                                    title="Đã thu"
                                    value={Number(reconciliation?.paymentTotal || 0)}
                                    formatter={(value) => formatCurrency(value)}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Card className={cx("stat-card", "warning")}>
                                <Statistic
                                    title="Công nợ"
                                    value={Number(reconciliation?.outstandingTotal || 0)}
                                    formatter={(value) => formatCurrency(value)}
                                    prefix={<CreditCardOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Card className={cx("stat-card", "danger")}>
                                <Statistic
                                    title="Credit còn lại"
                                    value={Number(creditLedger?.currentBalance || 0)}
                                    formatter={(value) => formatCurrency(value)}
                                    prefix={<HistoryOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={9}>
                            <Card title="Nhận payment" className={cx("table-card")}>
                                <Descriptions column={1} size="small" bordered className={cx("contractMeta")}>
                                    <Descriptions.Item label="Khu trọ">
                                        {selectedContract?.boardingHouseName || "—"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phòng">
                                        {selectedContract?.roomNumber || "—"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người thuê">
                                        {selectedContract?.tenantFullName || "—"}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Form
                                    layout="vertical"
                                    form={receiveForm}
                                    className={cx("receiveForm")}
                                    onFinish={handleReceive}
                                >
                                    <Form.Item
                                        label="Số tiền"
                                        name="amount"
                                        rules={[{ required: true, message: "Nhập số tiền" }]}
                                    >
                                        <InputNumber style={{ width: "100%" }} min={1} precision={0} />
                                    </Form.Item>
                                    <Form.Item
                                        label="External reference"
                                        name="externalReference"
                                        rules={[{ required: true, message: "Nhập mã tham chiếu" }]}
                                    >
                                        <Input placeholder="VD: CK-20260329-001" />
                                    </Form.Item>
                                    <Form.Item label="Currency" name="currency" initialValue="VND">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Ngày nhận tiền" name="receivedAt">
                                        <DatePicker
                                            showTime
                                            style={{ width: "100%" }}
                                            format="DD/MM/YYYY HH:mm"
                                            disabledDate={(current) => current && current > dayjs().endOf("day")}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Ghi chú" name="note">
                                        <TextArea rows={3} />
                                    </Form.Item>
                                    <Button type="primary" htmlType="submit" block>
                                        Ghi nhận payment
                                    </Button>
                                </Form>

                                {agingReport?.buckets?.length ? (
                                    <div className={cx("infoPanel")}>
                                        <Text strong>Debt aging</Text>
                                        {(agingReport.buckets || [])
                                            .filter((bucket) => Number(bucket.outstandingAmount || 0) > 0)
                                            .map((bucket) => (
                                                <div key={bucket.bucketCode} className={cx("infoRow")}>
                                                    <span>{bucket.label}</span>
                                                    <span>
                                                        {formatCurrency(bucket.outstandingAmount)} · {bucket.invoiceCount} bill
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                ) : null}

                                {agingInvoices.length ? (
                                    <div className={cx("infoPanel")}>
                                        <Text strong>Overdue invoices cần chú ý</Text>
                                        {agingInvoices.slice(0, 4).map((invoice) => (
                                            <div key={invoice.billId} className={cx("overdueItem")}>
                                                <div>
                                                    <div className={cx("billCode")}>
                                                        {invoice.billCode || `#${invoice.billId}`}
                                                    </div>
                                                    <div className={cx("paymentRef")}>
                                                        {invoice.billTitle || "Hóa đơn"} · quá hạn {invoice.ageDays || 0} ngày
                                                    </div>
                                                </div>
                                                <strong>{formatCurrency(invoice.outstandingAmount)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </Card>
                        </Col>

                        <Col xs={24} xl={15}>
                            <Card
                                title="Payments gần đây"
                                extra={
                                    <Text type="secondary">
                                        {filteredPayments.length}/{payments.length} payment từ API của contract
                                    </Text>
                                }
                                className={cx("table-card")}
                            >
                                <div className={cx("paymentToolbar")}>
                                    <Input
                                        allowClear
                                        placeholder="Tìm theo payment id hoặc external reference"
                                        value={paymentSearch}
                                        onChange={(event) => setPaymentSearch(event.target.value)}
                                    />
                                    <Select
                                        value={paymentStatusFilter}
                                        onChange={setPaymentStatusFilter}
                                        options={[
                                            { value: "ALL", label: "Tất cả trạng thái" },
                                            ...Object.keys(paymentStatusMeta).map((status) => ({
                                                value: status,
                                                label: paymentStatusMeta[status]?.text || status,
                                            })),
                                        ]}
                                    />
                                </div>
                                <div className={cx("quickSummary")}>
                                    <div className={cx("summaryBadge")}>
                                        <span>Pending</span>
                                        <strong>{paymentSummary.pendingCount}</strong>
                                    </div>
                                    <div className={cx("summaryBadge")}>
                                        <span>Có thể allocate</span>
                                        <strong>{paymentSummary.actionableCount}</strong>
                                    </div>
                                    <div className={cx("summaryBadge")}>
                                        <span>Chưa phân bổ</span>
                                        <strong>{formatCurrency(paymentSummary.totalUnallocated)}</strong>
                                    </div>
                                </div>
                                <Table
                                    rowKey="id"
                                    columns={paymentColumns}
                                    dataSource={filteredPayments}
                                    pagination={false}
                                    locale={{ emptyText: "Chưa có payment nào cho hợp đồng này." }}
                                    rowClassName={(record) =>
                                        record.id === selectedPaymentId ? cx("selectedRow") : ""
                                    }
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} className={cx("workspaceRow")}>
                        <Col xs={24} xl={14}>
                            <Card title="Outstanding invoices & manual allocation" className={cx("table-card")}>
                                {!selectedPayment ? (
                                    <Empty description="Chọn một payment ở bảng trên để phân bổ" />
                                ) : (
                                    <>
                                        <Alert
                                            type={selectedPayment.status === "PENDING" ? "warning" : "info"}
                                            showIcon
                                            message={`Payment #${selectedPayment.id} · ${paymentStatusMeta[selectedPayment.status]?.text || selectedPayment.status}`}
                                            description={
                                                selectedPayment.status === "PENDING"
                                                    ? `Payment này đang chờ xác nhận. Allocate sẽ tự confirm nếu backend chấp nhận. Chưa phân bổ: ${formatCurrency(selectedPayment.unallocatedAmount)}`
                                                    : `Chưa phân bổ: ${formatCurrency(selectedPayment.unallocatedAmount)}`
                                            }
                                            style={{ marginBottom: 16 }}
                                        />
                                        <div className={cx("actionSummary")}>
                                            <span>Tổng draft manual: {formatCurrency(manualAllocationDraft)}</span>
                                            <span>
                                                Còn lại sau draft:{" "}
                                                {formatCurrency(
                                                    Math.max(
                                                        Number(selectedPayment.unallocatedAmount || 0) -
                                                            manualAllocationDraft,
                                                        0
                                                    )
                                                )}
                                            </span>
                                        </div>
                                        <Table
                                            rowKey="billId"
                                            columns={invoiceColumns}
                                            dataSource={outstandingInvoices}
                                            pagination={false}
                                            locale={{ emptyText: "Không còn invoice outstanding để phân bổ." }}
                                        />
                                        <div className={cx("actionBar")}>
                                            <Button
                                                type="primary"
                                                onClick={handleManualAllocate}
                                                disabled={!canAllocateSelectedPayment}
                                            >
                                                Manual allocate
                                            </Button>
                                            <Button
                                                onClick={() => handleAutoAllocate(selectedPayment.id)}
                                                disabled={!canAllocateSelectedPayment}
                                            >
                                                Auto allocate
                                            </Button>
                                            <Button danger onClick={openReverseModal} disabled={!canReverseSelectedPayment}>
                                                Reverse payment
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </Col>

                        <Col xs={24} xl={10}>
                            <Card title="Payment detail" className={cx("table-card")}>
                                {!selectedPayment ? (
                                    <Empty description="Chọn payment để xem chi tiết" />
                                ) : (
                                    <>
                                        <Descriptions column={1} size="small" bordered>
                                            <Descriptions.Item label="Payment ID">#{selectedPayment.id}</Descriptions.Item>
                                            <Descriptions.Item label="External reference">
                                                {selectedPayment.externalReference}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Nguồn">
                                                {selectedPayment.source || "NORMAL"}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Trạng thái">
                                                <Tag color={paymentStatusMeta[selectedPayment.status]?.color || "default"}>
                                                    {paymentStatusMeta[selectedPayment.status]?.text || selectedPayment.status}
                                                </Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Số tiền">
                                                {formatCurrency(selectedPayment.amount)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Allocated">
                                                {formatCurrency(selectedPayment.allocatedAmount)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Unallocated">
                                                {formatCurrency(selectedPayment.unallocatedAmount)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Received at">
                                                {selectedPayment.receivedAt
                                                    ? dayjs(selectedPayment.receivedAt).format("DD/MM/YYYY HH:mm")
                                                    : "—"}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Confirmed at">
                                                {selectedPayment.confirmedAt ? dayjs(selectedPayment.confirmedAt).format("DD/MM/YYYY HH:mm") : "—"}
                                            </Descriptions.Item>
                                        </Descriptions>

                                        <div className={cx("allocationList")}>
                                            <Text strong>Allocations</Text>
                                            {(selectedPayment.allocations || []).length === 0 ? (
                                                <Empty
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    description="Payment này chưa có allocation"
                                                />
                                            ) : (
                                                (selectedPayment.allocations || []).map((allocation) => (
                                                    <div key={allocation.id} className={cx("allocationItem")}>
                                                        <div>
                                                            Bill #{allocation.billId} · {formatEnumLabel(allocation.allocationType)}
                                                        </div>
                                                        <strong>{formatCurrency(allocation.amount)}</strong>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={12}>
                            <Card title="Credit ledger gần đây" className={cx("table-card")}>
                                {creditEntries.length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có credit ledger" />
                                ) : (
                                    creditEntries.map((entry) => (
                                        <div key={entry.id} className={cx("infoRow")}>
                                            <span>
                                                {formatEnumLabel(entry.entryType)} {entry.billId ? `· bill #${entry.billId}` : ""}
                                            </span>
                                            <span>{formatCurrency(entry.amount)}</span>
                                        </div>
                                    ))
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} xl={12}>
                            <Card title="Billing audit gần đây" className={cx("table-card")}>
                                {auditItems.length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có audit log" />
                                ) : (
                                    auditItems.map((log) => (
                                        <div key={log.id} className={cx("auditItem")}>
                                            <div className={cx("auditTitle")}>{formatEnumLabel(log.operationType)}</div>
                                            <div className={cx("auditMeta")}>
                                                {formatEnumLabel(log.targetType)} #{log.targetId} · {log.actorName || "System"} ·{" "}
                                                {log.createdAt ? dayjs(log.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Spin>
            )}
        </div>
    );
}

export default AdminPaymentManagement;
