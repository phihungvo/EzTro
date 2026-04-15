import React, {useCallback, useEffect, useMemo, useState} from "react";
import { Alert, Button, Descriptions, Divider, Empty, Form, Input, InputNumber, message, Modal, Select, Spin, Table, Timeline, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./Bills.module.scss";
import PaymentMethods from "~/components/Layout/UserLayout/components/PaymentMethods";
import UserTable from "src/components/Layout/UserLayout/components/UserTable";
import {
    downloadMyBillDocument,
    downloadMyBillReceipt,
    getMyBillDetail,
    getMyBills,
    submitMyBillPayment,
    uploadMyBillPaymentProof
} from "~/service/user/my-bill";

const Bills = () => {
    const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;
    const isBillPayable = (bill) => ["UNPAID", "OVERDUE", "PARTIALLY_PAID"].includes(bill?.status);
    const getLifecycleLabel = (status) => {
        const map = {
            ISSUED: 'Đã phát hành',
            SENT: 'Đã gửi',
            CANCELLED: 'Đã hủy',
        };
        return map[status] || status || '—';
    };
    const getTimelineColor = (eventType) => {
        const map = {
            ISSUED: 'blue',
            SENT: 'green',
            SEND_FAILED: 'red',
            UPDATED: 'gold',
            PAYMENT_SUBMITTED: 'cyan',
            PAYMENT_ALLOCATED: 'green',
            PAYMENT_REVERSED: 'orange',
            CANCELLED: 'gray',
        };
        return map[eventType] || 'blue';
    };

    const [myBills, setMyBills] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailBill, setDetailBill] = useState(null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [paymentBill, setPaymentBill] = useState(null);
    const [paymentProofFileList, setPaymentProofFileList] = useState([]);
    const [paymentForm] = Form.useForm();

    const fetchMyBills = useCallback(async () => {
        try {
            const response = await getMyBills();

            if (!response?.content) {
                message.warning("Không thể lấy thông tin phòng của bạn");
                return;
            }

            setMyBills(response.content);
        } catch (error) {
            console.error("❌ Error fetching room info:", error);
            message.error("Lỗi khi tải dữ liệu phòng");
        }
    }, []);

    useEffect(() => {
        fetchMyBills();
    }, [fetchMyBills]);

    const closePaymentModal = useCallback(() => {
        setPaymentOpen(false);
        setPaymentLoading(false);
        setPaymentSubmitting(false);
        setPaymentBill(null);
        setPaymentProofFileList([]);
        paymentForm.resetFields();
    }, [paymentForm]);

    const loadBillDetail = useCallback(async (billId) => {
        return await getMyBillDetail(billId);
    }, []);

    const handleDownloadBlob = useCallback(async (downloadAction, successMessage) => {
        const file = await downloadAction();
        const url = window.URL.createObjectURL(file.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.fileName || "document.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        message.success(successMessage);
    }, []);

    const refreshBillContexts = useCallback(async (billId, options = {}) => {
        const {refreshDetail = false} = options;
        const detailPromise = refreshDetail && billId
            ? loadBillDetail(billId).catch(() => null)
            : Promise.resolve(null);
        const [freshDetail] = await Promise.all([detailPromise, fetchMyBills()]);
        if (refreshDetail) {
            setDetailBill(freshDetail);
        }
        return freshDetail;
    }, [fetchMyBills, loadBillDetail]);

    const paymentMethods = [
        {
            icon: "🏦",
            title: "Chuyển Khoản",
            method: "bank_transfer"
        },
        {
            icon: "📱",
            title: "Ví Điện Tử",
            method: "e_wallet"
        },
        {
            icon: "💰",
            title: "Tiền Mặt",
            method: "cash"
        }
    ];

    const handlePayment = useCallback(async (bill) => {
        setPaymentOpen(true);
        setPaymentLoading(true);
        try {
            const response = await loadBillDetail(bill.id);
            setPaymentBill(response);
            paymentForm.setFieldsValue({
                amount: Number(response?.outstandingAmount ?? bill?.outstandingAmount ?? bill?.amount ?? 0),
                paymentMethod: "bank_transfer",
                externalReference: "",
                note: "",
            });
        } catch (error) {
            closePaymentModal();
        } finally {
            setPaymentLoading(false);
        }
    }, [closePaymentModal, loadBillDetail, paymentForm]);

    const handleViewDetail = useCallback(async (bill) => {
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const response = await loadBillDetail(bill.id);
            setDetailBill(response);
        } catch (error) {
            setDetailBill(null);
        } finally {
            setDetailLoading(false);
        }
    }, [loadBillDetail]);

    const handleSelectMethod = (method) => {
        message.info(`Chọn phương thức: ${method.title}`);
        // Handle payment method selection
    };

    const handleSubmitPayment = useCallback(async () => {
        const values = await paymentForm.validateFields();
        if (!paymentBill?.id) {
            return;
        }
        if (values.paymentMethod === "bank_transfer" && paymentProofFileList.length === 0) {
            message.error("Chuyển khoản yêu cầu tải lên chứng từ thanh toán");
            return;
        }

        setPaymentSubmitting(true);
        try {
            let uploadedProof = null;
            const proofFile = paymentProofFileList[0]?.originFileObj;
            if (proofFile) {
                uploadedProof = await uploadMyBillPaymentProof(paymentBill.id, proofFile);
            }
            await submitMyBillPayment(paymentBill.id, {
                amount: values.amount,
                currency: "VND",
                externalReference: values.externalReference?.trim() || undefined,
                paymentMethod: values.paymentMethod,
                proofFileId: uploadedProof?.id,
                note: values.note?.trim() || undefined,
            });

            message.success("Đã gửi xác nhận thanh toán. Chủ trọ sẽ đối soát và xác nhận sau.");
            await refreshBillContexts(paymentBill.id, {
                refreshDetail: detailOpen && detailBill?.id === paymentBill.id,
            });
            closePaymentModal();
        } finally {
            setPaymentSubmitting(false);
        }
    }, [closePaymentModal, detailBill?.id, detailOpen, paymentBill?.id, paymentForm, paymentProofFileList, refreshBillContexts]);

    const billList = useMemo(() => (Array.isArray(myBills) ? myBills : []), [myBills]);
    const billStats = useMemo(() => {
        const unpaidBills = billList.filter((bill) => isBillPayable(bill));
        const paidBills = billList.filter((bill) => bill?.status === 'PAID');
        const overdueBills = billList.filter((bill) => bill?.status === 'OVERDUE');
        const outstanding = unpaidBills.reduce((sum, bill) => sum + Number(bill?.outstandingAmount ?? bill?.amount ?? 0), 0);

        return [
            {label: 'Tổng hóa đơn', value: billList.length, sub: 'đang hiển thị'},
            {label: 'Chưa thanh toán', value: unpaidBills.length, sub: overdueBills.length > 0 ? `${overdueBills.length} quá hạn` : 'an toàn'},
            {label: 'Đã thanh toán', value: paidBills.length, sub: 'thành công'},
            {label: 'Còn nợ', value: formatCurrency(outstanding), sub: 'VND'},
        ];
    }, [billList]);

    return (
        <div className={styles.bills}>
            <section className={styles.hero}>
                <div>
                    <div className={styles.heroTitle}>Hóa đơn & thanh toán</div>
                    <div className={styles.heroSub}>
                        Quản lý hóa đơn, chứng từ và trạng thái thanh toán trong một giao diện tối.
                    </div>
                </div>
                <div className={styles.heroActions}>
                    <Button type="primary" icon={<UploadOutlined />} onClick={() => message.info('Tính năng đồng bộ hóa đơn đang phát triển')}>
                        Đồng bộ
                    </Button>
                    <Button onClick={() => message.info('Xuất báo cáo đang phát triển')}>
                        Xuất báo cáo
                    </Button>
                </div>
            </section>

            <section className={styles.statsGrid}>
                {billStats.map((item) => (
                    <div key={item.label} className={styles.statCard}>
                        <div className={styles.statLabel}>{item.label}</div>
                        <div className={styles.statValue}>{item.value}</div>
                        <div className={styles.statSub}>{item.sub}</div>
                    </div>
                ))}
            </section>

            <div className={styles.grid}>
                <div className={styles.mainCol}>
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <div className={styles.sectionTitle}>Danh sách hóa đơn</div>
                                <div className={styles.sectionSub}>Theo dõi các hóa đơn gần đây và thao tác thanh toán</div>
                            </div>
                        </div>

                        {billList.length > 0 ? (
                            <UserTable
                                bills={billList}
                                onPayment={handlePayment}
                                onViewDetail={handleViewDetail}
                            />
                        ) : (
                            <Empty description="Bạn chưa có hóa đơn nào" />
                        )}
                    </div>
                </div>

                <div className={styles.sideCol}>
                    <PaymentMethods
                        methods={paymentMethods}
                        onSelectMethod={handleSelectMethod}
                    />
                </div>
            </div>

            <Modal
                open={detailOpen}
                onCancel={() => {
                    setDetailOpen(false);
                    setDetailBill(null);
                }}
                footer={null}
                width={960}
                title={detailBill?.billCode ? `Chi tiết hóa đơn ${detailBill.billCode}` : 'Chi tiết hóa đơn'}
            >
                <Spin spinning={detailLoading}>
                    {!detailBill ? (
                        <Empty description="Không có dữ liệu hóa đơn" />
                    ) : (
                        <>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16}}>
                                <Button
                                    style={{color: 'red'}}
                                    onClick={() => handleDownloadBlob(
                                        () => downloadMyBillDocument(detailBill.id),
                                        'Đã tải tài liệu hóa đơn'
                                    )}
                                >
                                    Tải hoá đơn
                                </Button>
                                <Button
                                    onClick={() => handleDownloadBlob(
                                        () => downloadMyBillReceipt(detailBill.id),
                                        'Đã tải biên nhận hóa đơn'
                                    )}
                                >
                                    Tải biên nhận
                                </Button>
                            </div>
                            <Descriptions bordered size="small" column={2}>
                                <Descriptions.Item label="Tiêu đề">{detailBill.billTitle || '—'}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">{detailBill.status || '—'}</Descriptions.Item>
                                <Descriptions.Item label="Kỳ tính">
                                    {detailBill.billingPeriodStart && detailBill.billingPeriodEnd
                                        ? `${dayjs(detailBill.billingPeriodStart).format('DD/MM/YYYY')} - ${dayjs(detailBill.billingPeriodEnd).format('DD/MM/YYYY')}`
                                        : '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phát hành">{getLifecycleLabel(detailBill.lifecycleStatus)}</Descriptions.Item>
                                <Descriptions.Item label="Hạn thanh toán">
                                    {detailBill.dueDate ? dayjs(detailBill.dueDate).format('DD/MM/YYYY') : '—'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền">{formatCurrency(detailBill.amount)}</Descriptions.Item>
                                <Descriptions.Item label="Còn phải trả">{formatCurrency(detailBill.outstandingAmount)}</Descriptions.Item>
                                <Descriptions.Item label="Ghi chú">{detailBill.publicNote || '—'}</Descriptions.Item>
                                <Descriptions.Item label="Hướng dẫn thanh toán">{detailBill.paymentInstructions || '—'}</Descriptions.Item>
                            </Descriptions>

                            {isBillPayable(detailBill) && Number(detailBill.outstandingAmount || 0) > 0 && (
                                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 16}}>
                                    <Button type="primary" onClick={() => handlePayment(detailBill)}>
                                        Gửi xác nhận thanh toán
                                    </Button>
                                </div>
                            )}

                            <Divider>Chi tiết các khoản</Divider>
                            <Table
                                size="small"
                                rowKey="id"
                                pagination={false}
                                dataSource={detailBill.lines || []}
                                columns={[
                                    { title: 'Mô tả', dataIndex: 'description' },
                                    { title: 'Loại', dataIndex: 'lineType', width: 160 },
                                    { title: 'Số lượng', dataIndex: 'quantity', width: 120, align: 'right' },
                                    { title: 'Đơn giá', dataIndex: 'unitPrice', width: 150, align: 'right', render: formatCurrency },
                                    { title: 'Thành tiền', dataIndex: 'amount', width: 160, align: 'right', render: formatCurrency },
                                ]}
                            />

                            <Divider>Lịch sử phân bổ thanh toán</Divider>
                            <Table
                                size="small"
                                rowKey="id"
                                pagination={false}
                                dataSource={detailBill.allocations || []}
                                locale={{ emptyText: 'Chưa có thanh toán nào được phân bổ' }}
                                columns={[
                                    { title: 'Mã tham chiếu', dataIndex: 'externalReference' },
                                    { title: 'Loại phân bổ', dataIndex: 'allocationType', width: 160 },
                                    { title: 'Số tiền', dataIndex: 'amount', width: 160, align: 'right', render: formatCurrency },
                                    {
                                        title: 'Ngày nhận',
                                        dataIndex: 'receivedAt',
                                        width: 160,
                                        render: (value) => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—'
                                    },
                                ]}
                            />

                            <Divider>Timeline</Divider>
                            <Timeline
                                items={(detailBill.timeline || []).map((item) => ({
                                    color: getTimelineColor(item.eventType),
                                    children: (
                                        <div>
                                            <strong>{item.title}</strong>
                                            <div style={{color: '#666'}}>
                                                {item.occurredAt ? dayjs(item.occurredAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
                                            </div>
                                            <div>{item.description || '—'}</div>
                                            {item.amount !== null && item.amount !== undefined && (
                                                <div style={{marginTop: 4}}>{formatCurrency(item.amount)}</div>
                                            )}
                                        </div>
                                    )
                                }))}
                            />
                        </>
                    )}
                </Spin>
            </Modal>

            <Modal
                open={paymentOpen}
                onCancel={closePaymentModal}
                confirmLoading={paymentSubmitting}
                onOk={handleSubmitPayment}
                okText="Gửi xác nhận"
                cancelText="Đóng"
                destroyOnClose
                title={paymentBill?.billCode ? `Xác nhận thanh toán ${paymentBill.billCode}` : "Xác nhận thanh toán"}
            >
                <Spin spinning={paymentLoading}>
                    {!paymentBill ? (
                        <Empty description="Không thể tải dữ liệu hóa đơn" />
                    ) : (
                        <>
                            <Alert
                                type="info"
                                showIcon
                                style={{marginBottom: 16}}
                                message="Tenant chỉ gửi xác nhận thanh toán"
                                description="Sau khi gửi, khoản thanh toán sẽ ở trạng thái chờ xác nhận. Chủ trọ cần đối soát và confirm trước khi bill được ghi nhận đã thanh toán. Nếu số tiền lớn hơn số dư bill, phần dư sẽ được giữ lại như credit sau khi đối soát."
                            />

                            <Descriptions bordered size="small" column={1} style={{marginBottom: 16}}>
                                <Descriptions.Item label="Mã hóa đơn">{paymentBill.billCode || "—"}</Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền">{formatCurrency(paymentBill.amount)}</Descriptions.Item>
                                <Descriptions.Item label="Còn phải trả">{formatCurrency(paymentBill.outstandingAmount)}</Descriptions.Item>
                                <Descriptions.Item label="Hướng dẫn thanh toán">
                                    {paymentBill.paymentInstructions || "Chủ trọ chưa cấu hình hướng dẫn thanh toán."}
                                </Descriptions.Item>
                            </Descriptions>

                            <Form form={paymentForm} layout="vertical">
                                <Form.Item
                                    label="Số tiền đã chuyển"
                                    name="amount"
                                    rules={[
                                        {required: true, message: "Vui lòng nhập số tiền đã chuyển"},
                                        {
                                            validator: (_, value) => {
                                                if (value === undefined || value === null || Number(value) <= 0) {
                                                    return Promise.reject(new Error("Số tiền phải lớn hơn 0"));
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        style={{width: "100%"}}
                                        min={0}
                                        precision={0}
                                        addonAfter="đ"
                                        placeholder="Nhập số tiền tenant đã thanh toán"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Phương thức thanh toán"
                                    name="paymentMethod"
                                    rules={[{required: true, message: "Vui lòng chọn phương thức thanh toán"}]}
                                >
                                    <Select
                                        options={paymentMethods.map((method) => ({
                                            label: `${method.icon} ${method.title}`,
                                            value: method.method,
                                        }))}
                                        placeholder="Chọn phương thức"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Mã tham chiếu giao dịch"
                                    name="externalReference"
                                    extra="Ví dụ: mã giao dịch ngân hàng, nội dung chuyển khoản hoặc mã ví điện tử."
                                >
                                    <Input placeholder="Nhập mã tham chiếu nếu có" />
                                </Form.Item>

                                <Form.Item
                                    label="Chứng từ thanh toán"
                                    extra="Hỗ trợ jpg, jpeg, png, webp, pdf tối đa 5MB. Chuyển khoản yêu cầu tải chứng từ."
                                >
                                    <Upload
                                        beforeUpload={() => false}
                                        maxCount={1}
                                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                                        fileList={paymentProofFileList}
                                        onChange={({fileList}) => setPaymentProofFileList(fileList.slice(-1))}
                                    >
                                        <Button icon={<UploadOutlined />}>Chọn chứng từ</Button>
                                    </Upload>
                                </Form.Item>

                                <Form.Item
                                    label="Ghi chú"
                                    name="note"
                                    extra="Có thể ghi thêm ghi chú để chủ trọ đối soát."
                                >
                                    <Input.TextArea rows={4} placeholder="Nhập ghi chú bổ sung cho chủ trọ" />
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </Spin>
            </Modal>
        </div>
    );
};

export default Bills;
