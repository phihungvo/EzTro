import styles from "./SummaryPanel.module.scss";
import { fmt } from "../data.js";

export default function SummaryPanel({
    state,
    computed,
    roomData,
    preview,
    previewLoading,
    onPublish,
    onPreview,
    onShare,
    depositSummary,
    depositTransactions,
    reconciliation,
    reconciliationLoading,
}) {
    const { room, month, year, dueDate } = state;
    const { subtotal, discount, total } = computed;

    const meterLines = (state.meterReadings || []).map((r) => {
        const prev = Number(r.previousIndex || 0);
        const curr = r.currentIndex === "" || r.currentIndex == null ? null : Number(r.currentIndex);
        const price = Number(r.unitPrice || 0);
        const diff = curr == null ? null : curr - prev;
        const amount = curr == null ? 0 : Math.max(0, (diff || 0) * price);
        return { ...r, prev, curr, diff, amount };
    }).filter((r) => r.curr != null);

    const daysLeft = dueDate ? Math.round((new Date(dueDate) - new Date()) / 86400000) : 0;
    const isOverdue = daysLeft < 0;

    const dueDateFormatted = dueDate
        ? new Date(dueDate).toLocaleDateString("vi-VN")
        : "—";

    const fixedServiceLines = (state.fixedServices || []).filter((item) => Number(item.totalAmount || 0) > 0);

    const previewRent = preview ? Number(preview.rentAmount || 0) : 0;
    const previewService = preview ? Number(preview.serviceAmount || 0) : 0;
    const previewDiscount = preview ? Number(preview.discountAmount || 0) : 0;
    const previewTotal = preview ? Number(preview.totalAmount || 0) : 0;

    const displaySubtotal = preview ? previewRent + previewService : subtotal;
    const displayDiscount = preview ? previewDiscount : discount;
    const displayTotal = preview ? previewTotal : total;
    const depositTxns = (depositTransactions || []).slice(0, 3);
    const depositItems = depositSummary
        ? [
              { label: 'Tổng thu cọc', value: depositSummary.totalCollected },
              { label: 'Đã trừ / khấu trừ', value: depositSummary.totalDeducted },
              { label: 'Đã hoàn / refund', value: depositSummary.totalRefunded },
              { label: 'Số dư cọc', value: depositSummary.currentBalance, highlight: true },
          ]
        : [];
    const paymentStats = reconciliation
        ? [
              { label: 'Tổng hóa đơn', value: reconciliation.invoiceTotal },
              { label: 'Đã thu', value: reconciliation.paymentTotal },
              { label: 'Đã phân bổ', value: reconciliation.allocationTotal },
              { label: 'Công nợ', value: reconciliation.outstandingTotal },
              { label: 'Credit', value: reconciliation.creditTotal },
          ]
        : [];
    const discrepancyPercent = reconciliation?.discrepancyPercent
        ? (Number(reconciliation.discrepancyPercent) * 100).toFixed(1)
        : 0;
    const showDiscrepancy = Boolean(reconciliation?.discrepancyAlert);

    return (
        <aside className={styles.panel}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Hoá đơn tháng {month}/{year}</h2>
                        <div className={styles.invoiceId}>#HD-{room}-{year}-{String(month).padStart(2,"0")}</div>
                    </div>
                    <div className={styles.scanLine} />
                </div>

                <div className={styles.body}>
                    {/* Room info */}
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>Phòng &amp; Khách thuê</div>
                        <div className={styles.roomRow}>
                            <div>
                                <div className={styles.roomNum}>Phòng {room}</div>
                                <div className={styles.roomSub}>
                                    {roomData?.tenant || "—"} · {roomData?.people || 0} người
                                </div>
                            </div>
                            <span className={styles.floorTag}>T{roomData?.floor || 1}</span>
                        </div>
                    </div>

                    {/* Status timeline */}
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>Trạng thái</div>
                        <div className={styles.timeline}>
                            <div className={styles.step}>
                                <div className={`${styles.dot} ${styles.dotDone}`}>✓</div>
                                <div className={styles.stepLabel}>Tạo HĐ</div>
                            </div>
                            <div className={`${styles.line} ${styles.lineDone}`} />
                            <div className={styles.step}>
                                <div className={`${styles.dot} ${styles.dotCurrent}`}>→</div>
                                <div className={styles.stepLabel}>Gửi TT</div>
                            </div>
                            <div className={styles.line} />
                            <div className={styles.step}>
                                <div className={styles.dot}></div>
                                <div className={styles.stepLabel}>Đã TT</div>
                            </div>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>Chi tiết</div>

                        <div className={styles.line_}>
                            <span className={styles.lineName}>🏠 Tiền phòng</span>
                            <span className={styles.lineVal}>{fmt(state.roomPrice)}</span>
                        </div>
                        {meterLines.map((r) => (
                            <div key={r.utilityId} className={styles.line_}>
                                <span className={styles.lineName}>
                                    🧾 {r.utilityName} ({r.diff} {r.unit})
                                </span>
                                <span className={styles.lineVal}>{fmt(r.amount)}</span>
                            </div>
                        ))}

                        {fixedServiceLines.map((item) => (
                            <div key={item.id} className={styles.line_}>
                                <span className={styles.lineName}>
                                    🧩 {item.name} ({item.quantity} x {fmt(item.unitPrice)})
                                </span>
                                <span className={styles.lineVal}>{fmt(item.totalAmount)}</span>
                            </div>
                        ))}

                        {state.extras.filter(e => parseFloat(e.amount) > 0).map((e) => (
                            <div key={e.id} className={styles.line_}>
                                <span className={styles.lineName}>➕ {e.name || "Phí phát sinh"}</span>
                                <span className={styles.lineVal}>{fmt(e.amount)}</span>
                            </div>
                        ))}

                        <div className={styles.divider} />

                        <div className={styles.line_}>
                            <span className={styles.lineSubLabel}>Tạm tính</span>
                            <span className={styles.lineVal}>{fmt(displaySubtotal)}</span>
                        </div>

                        {displayDiscount > 0 && (
                            <div className={styles.line_}>
                                <span className={`${styles.lineSubLabel} ${styles.discountName}`}>🏷 Giảm giá</span>
                                <span className={`${styles.lineVal} ${styles.discountVal}`}>−{fmt(displayDiscount)}</span>
                            </div>
                        )}

                        {preview?.hasMissingMeterReadings && (
                            <div className={styles.line_}>
                                <span className={styles.lineSubLabel} style={{ color: "#d48806" }}>
                                    Chưa có đủ chỉ số điện/nước trong kỳ này.
                                </span>
                                <span className={styles.lineVal}></span>
                            </div>
                        )}
                    </div>

                    {depositItems.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionLabel}>Sổ cọc & lịch sử</div>
                            <div className={styles.depositGrid}>
                                {depositItems.map((item) => (
                                    <div key={item.label} className={styles.depositCell}>
                                        <div className={styles.depositLabel}>{item.label}</div>
                                        <div
                                            className={`${styles.depositValue} ${item.highlight ? styles.depositHighlight : ''}`}
                                        >
                                            {fmt(item.value)} đ
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {depositTxns.length > 0 && (
                                <div className={styles.depositList}>
                                    {depositTxns.map((txn) => {
                                        const txnDate = txn?.occurredAt
                                            ? new Date(txn.occurredAt).toLocaleDateString('vi-VN')
                                            : null;
                                        const txnTitle = txn.transactionType
                                            ? txn.transactionType.replace(/_/g, ' ')
                                            : 'Giao dịch';
                                        return (
                                            <div key={txn.id || txn.referenceId || txnDate} className={styles.depositTxn}>
                                                <div className={styles.depositTxnRow}>
                                                    <span className={styles.depositTxnTitle}>{txnTitle}</span>
                                                    <span className={styles.depositTxnAmount}>{fmt(txn.amount)} đ</span>
                                                </div>
                                                <div className={styles.depositTxnMeta}>
                                                    {txn.referenceType ? `${txn.referenceType} #${txn.referenceId}` : txn.note || '—'}
                                                    {txnDate && ` · ${txnDate}`}
                                                </div>
                                            </div>
                                        );
                                    })}
                            {depositTransactions?.length > depositTxns.length && (
                                <div className={styles.depositTxnMore}>
                                    +{depositTransactions.length - depositTxns.length} giao dịch khác
                                </div>
                            )}
                        </div>
                    )}

                    {reconciliationLoading ? (
                        <div className={styles.section}>
                            <div className={styles.sectionLabel}>Đối soát thanh toán</div>
                            <div className={styles.paymentLoading}>Đang tải báo cáo đối soát...</div>
                        </div>
                    ) : paymentStats.length > 0 ? (
                        <div className={styles.section}>
                            <div className={styles.sectionLabel}>Đối soát thanh toán</div>
                            <div className={styles.paymentGrid}>
                                {paymentStats.map((item) => (
                                    <div key={item.label} className={styles.paymentCell}>
                                        <div className={styles.paymentLabel}>{item.label}</div>
                                        <div className={styles.paymentValue}>{fmt(item.value)} đ</div>
                                    </div>
                                ))}
                            </div>
                            {showDiscrepancy && (
                                <div className={styles.paymentAlert}>
                                    Công nợ {discrepancyPercent}% đang vượt ngưỡng. Vui lòng kiểm tra bill chưa trả.
                                </div>
                            )}
                        </div>
                    ) : null}
                        </div>
                    )}

                    {/* Total */}
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Tổng cộng</span>
                        <span className={styles.totalAmount}>{fmt(displayTotal)} ₫</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 8 }}>
                        {previewLoading
                            ? "Đang tải preview từ server..."
                            : preview
                                ? "Preview đã đồng bộ với dữ liệu server."
                                : "Chưa xem trước (preview chưa được khởi tạo)."}
                    </div>

                    {/* Due date */}
                    <div className={`${styles.dueCard} ${isOverdue ? styles.dueOverdue : ""}`}>
                        <span className={styles.dueIcon}>📅</span>
                        <div>
                            <strong className={styles.dueStrong}>Hạn: {dueDateFormatted}</strong>
                            <div className={styles.dueSub}>
                                {isOverdue
                                    ? `Đã quá hạn ${Math.abs(daysLeft)} ngày!`
                                    : `Còn ${daysLeft} ngày để thanh toán`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                <button className={styles.btnPrimary} onClick={onPublish}>
                    <span className={styles.btnShine} />
                    ✅ Phát hành hoá đơn
                </button>
                <button className={styles.btnOutline} onClick={onPreview} disabled={previewLoading}>
                    {previewLoading ? "Đang nạp preview..." : "👁 Xem trước hoá đơn"}
                </button>
                    <button className={styles.btnOutline} onClick={onShare}>
                        🔗 Chia sẻ link thanh toán
                    </button>
                </div>
            </div>

            {/* Tips */}
            <div className={styles.tips}>
                <div className={styles.tipsTitle}>// Lưu ý</div>
                <p>Chỉ số điện/nước được lưu lại làm chỉ số cũ cho kỳ sau</p>
                <p>Hoá đơn sẽ được gửi tự động qua Zalo &amp; SMS</p>
                <p>Có thể chỉnh sửa trước khi khách xác nhận</p>
            </div>
        </aside>
    );
}
