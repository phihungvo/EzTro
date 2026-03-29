import styles from "./PreviewModal.module.scss";
import { fmt } from "../data.js";

export default function PreviewModal({
    state,
    computed,
    preview,
    loading,
    error,
    roomData,
    onClose,
    onPublish,
    onPrint,
}) {
    const { room, month, year, issueDate, paymentMethod, paymentInstructions, notePublic } = state;
    const totalAmount = preview ? Number(preview.totalAmount || 0) : computed.total;
    const previewPeriod = preview
        ? `${preview.billingPeriodStart || ""} → ${preview.billingPeriodEnd || ""}`
        : `Tháng ${month}/${year}`;
    const previewCode = preview?.generationKey
        ? preview.generationKey
        : `#HD-${room}-${year}-${String(month).padStart(2, "0")}`;
    const previewDueDate = preview?.dueDate || state.dueDate;
    const previewLines = preview?.lines || [];
    const hasMissing = preview?.hasMissingMeterReadings;
    const publishDisabled = loading || Boolean(error) || hasMissing;

    const pmLabels = { cash: "Tiền mặt", bank: "Chuyển khoản Vietcombank", momo: "Momo / ZaloPay" };
    const fmtDate = (str) => (str ? new Date(str).toLocaleDateString("vi-VN") : "—");

    const renderLine = (line, idx) => (
        <div key={`${line.lineKey}-${idx}`} className={styles.lineItem}>
            <span>
                {line.description || line.lineKey || "Dịch vụ"}
                {line.quantity && line.unitPrice ? ` (${line.quantity} x ${fmt(line.unitPrice)})` : ""}
            </span>
            <span>{fmt(Number(line.amount || 0))} ₫</span>
        </div>
    );

    const renderBodyContent = () => {
        if (loading) {
            return <div style={{ textAlign: "center", padding: 24 }}>Đang tải preview...</div>;
        }
        if (error) {
            return (
                <div style={{ textAlign: "center", padding: 24, color: "#cf1322" }}>
                    {error}
                </div>
            );
        }
        if (previewLines.length === 0) {
            return (
                <div style={{ textAlign: "center", padding: 24 }}>Không có dòng chi tiết để hiển thị.</div>
            );
        }
        return previewLines.map(renderLine);
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Xem trước hoá đơn</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.body}>
                    <div className={styles.previewDoc}>
                        <div className={styles.previewHead}>
                            <div className={styles.previewHeadSub}>KHU NHÀ TRỌ TÂN BÌNH</div>
                            <h3 className={styles.previewTitle}>HOÁ ĐƠN TIỀN PHÒNG</h3>
                            <p className={styles.previewPeriod}>{previewPeriod}</p>
                        </div>

                        <div className={styles.previewMeta}>
                            <div className={styles.metaBlock}>
                                <div className={styles.metaLbl}>Mã hóa đơn</div>
                                <div className={styles.metaVal}>{previewCode}</div>
                            </div>
                            <div className={styles.metaBlock}>
                                <div className={styles.metaLbl}>Ngày phát hành</div>
                                <div className={styles.metaVal}>{fmtDate(issueDate)}</div>
                            </div>
                            <div className={styles.metaBlock}>
                                <div className={styles.metaLbl}>Phòng</div>
                                <div className={styles.metaVal}>P.{room} — T{roomData?.floor}</div>
                            </div>
                            <div className={styles.metaBlock}>
                                <div className={styles.metaLbl}>Khách thuê</div>
                                <div className={styles.metaVal}>{roomData?.tenant || "—"}</div>
                            </div>
                        </div>

                        <div className={styles.lines}>{renderBodyContent()}</div>

                        {hasMissing && (
                            <div style={{ color: "#d48806", paddingLeft: 8, marginBottom: 6 }}>
                                Cảnh báo: một số tiện ích chưa có chỉ số công tơ trong kỳ này.
                            </div>
                        )}

                        <div className={styles.previewTotal}>
                            <span>TỔNG CỘNG</span>
                            <span>{fmt(totalAmount)} ₫</span>
                        </div>

                        <div className={styles.previewNote}>
                            <strong>Hạn thanh toán:</strong> {fmtDate(previewDueDate)}<br />
                            <strong>Phương thức:</strong> {pmLabels[paymentMethod] || paymentMethod}<br />
                            <strong>Hướng dẫn:</strong> {paymentInstructions}<br />
                            <em>{notePublic}</em>
                        </div>

                        <div className={styles.previewFooter}>
                            Hoá đơn được tạo tự động bởi NhàTrọ Pro · {fmtDate(issueDate)} · ký tên: Nguyễn Minh Chủ
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.btnGhost} onClick={onClose}>Đóng</button>
                    <button className={styles.btnOutline} onClick={onPrint}>🖨 In hoá đơn</button>
                    <button className={styles.btnPrimary} onClick={onPublish} disabled={publishDisabled}>
                        {hasMissing ? "Bổ sung meter trước khi phát hành" : "✅ Phát hành"}
                    </button>
                </div>
            </div>
        </div>
    );
}
