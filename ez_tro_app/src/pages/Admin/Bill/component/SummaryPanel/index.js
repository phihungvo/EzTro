import styles from "./SummaryPanel.module.scss";
import { fmt } from "../data.js";

const fmtDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("vi-VN");
};

const formatEnumLabel = (value) => {
    if (!value) return "—";
    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

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
    agingReport,
    creditLedger,
    auditLogs,
    insightLoading,
    previewError,
}) {
    const { room, month, year, dueDate } = state;
    const { subtotal, discount, total } = computed;

    const meterLines = (state.meterReadings || [])
        .map((item) => {
            const previousIndex = Number(item.previousIndex || 0);
            const currentIndex = item.currentIndex === "" || item.currentIndex == null ? null : Number(item.currentIndex);
            const unitPrice = Number(item.unitPrice || 0);
            const usage = currentIndex == null ? null : currentIndex - previousIndex;
            const amount = currentIndex == null ? 0 : Math.max(0, (usage || 0) * unitPrice);
            return { ...item, previousIndex, currentIndex, usage, amount };
        })
        .filter((item) => item.currentIndex != null);

    const fixedServiceLines = (state.fixedServices || []).filter((item) => Number(item.totalAmount || 0) > 0);
    const extraLines = (state.extras || []).filter((item) => parseFloat(item.amount) > 0);

    const previewRent = Number(preview?.rentAmount || 0);
    const previewService = Number(preview?.serviceAmount || 0);
    const previewDiscount = Number(preview?.discountAmount || 0);
    const previewTotal = Number(preview?.totalAmount || 0);

    const displaySubtotal = preview ? previewRent + previewService : subtotal;
    const displayDiscount = preview ? previewDiscount : discount;
    const displayTotal = preview ? previewTotal : total;
    const localTotal = Number(total || 0);
    const previewDelta = preview ? previewTotal - localTotal : 0;

    const daysLeft = dueDate ? Math.round((new Date(dueDate) - new Date()) / 86400000) : 0;
    const isOverdue = dueDate ? daysLeft < 0 : false;

    const depositItems = depositSummary
        ? [
              { label: "Tổng thu cọc", value: depositSummary.totalCollected },
              { label: "Đã trừ / khấu trừ", value: depositSummary.totalDeducted },
              { label: "Đã hoàn / refund", value: depositSummary.totalRefunded },
              { label: "Số dư cọc", value: depositSummary.currentBalance, highlight: true },
          ]
        : [];
    const recentDepositTransactions = (depositTransactions || []).slice(0, 3);

    const paymentStats = reconciliation
        ? [
              { label: "Tổng hóa đơn", value: reconciliation.invoiceTotal },
              { label: "Đã thu", value: reconciliation.paymentTotal },
              { label: "Đã phân bổ", value: reconciliation.allocationTotal },
              { label: "Công nợ", value: reconciliation.outstandingTotal },
              { label: "Credit", value: reconciliation.creditTotal },
          ]
        : [];
    const discrepancyPercent = reconciliation?.discrepancyPercent
        ? (Number(reconciliation.discrepancyPercent) * 100).toFixed(1)
        : null;

    const agingBuckets = (agingReport?.buckets || []).filter((bucket) => Number(bucket.outstandingAmount || 0) > 0);
    const recentCreditEntries = (creditLedger?.entries || []).slice(-3).reverse();
    const recentAuditLogs = (auditLogs || []).slice(0, 4);

    return (
        <aside className={styles.panel}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>
                            Hoá đơn tháng {month}/{year}
                        </h2>
                        <div className={styles.invoiceId}>#HD-{room}-{year}-{String(month).padStart(2, "0")}</div>
                    </div>
                    <div className={styles.scanLine} />
                </div>

                <div className={styles.body}>
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
                                <div className={styles.stepLabel}>Review</div>
                            </div>
                            <div className={styles.line} />
                            <div className={styles.step}>
                                <div className={styles.dot}>{preview ? "✓" : ""}</div>
                                <div className={styles.stepLabel}>Phát hành</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>Chi tiết</div>

                        <div className={styles.line_}>
                            <span className={styles.lineName}>🏠 Tiền phòng</span>
                            <span className={styles.lineVal}>{fmt(state.roomPrice)}</span>
                        </div>

                        {meterLines.map((item) => (
                            <div key={item.utilityId} className={styles.line_}>
                                <span className={styles.lineName}>
                                    🧾 {item.utilityName} ({item.usage} {item.unit})
                                </span>
                                <span className={styles.lineVal}>{fmt(item.amount)}</span>
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

                        {extraLines.map((item) => (
                            <div key={item.id} className={styles.line_}>
                                <span className={styles.lineName}>➕ {item.name || "Phí phát sinh"}</span>
                                <span className={styles.lineVal}>{fmt(item.amount)}</span>
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
                            <div className={styles.inlineWarning}>
                                Thiếu chỉ số điện/nước trong kỳ này. Hoá đơn chưa thể phát hành.
                            </div>
                        )}

                        {previewError && <div className={styles.inlineError}>{previewError}</div>}

                        {preview && previewDelta !== 0 && (
                            <div className={styles.inlineInfo}>
                                Tổng server lệch {fmt(Math.abs(previewDelta))} ₫ so với phần tính cục bộ.
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
                                            className={`${styles.depositValue} ${
                                                item.highlight ? styles.depositHighlight : ""
                                            }`}
                                        >
                                            {fmt(item.value)} đ
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {recentDepositTransactions.length > 0 && (
                                <div className={styles.depositList}>
                                    {recentDepositTransactions.map((txn) => {
                                        const title = txn.transactionType
                                            ? formatEnumLabel(txn.transactionType)
                                            : "Giao dịch";
                                        const key = txn.id || `${txn.referenceId}-${txn.occurredAt}`;
                                        return (
                                            <div key={key} className={styles.depositTxn}>
                                                <div className={styles.depositTxnRow}>
                                                    <span className={styles.depositTxnTitle}>{title}</span>
                                                    <span className={styles.depositTxnAmount}>{fmt(txn.amount)} đ</span>
                                                </div>
                                                <div className={styles.depositTxnMeta}>
                                                    {txn.referenceType
                                                        ? `${txn.referenceType} #${txn.referenceId}`
                                                        : txn.note || "—"}
                                                    {txn.occurredAt ? ` · ${fmtDate(txn.occurredAt)}` : ""}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(depositTransactions?.length || 0) > recentDepositTransactions.length && (
                                        <div className={styles.depositTxnMore}>
                                            +{depositTransactions.length - recentDepositTransactions.length} giao dịch khác
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(reconciliationLoading || insightLoading) && (
                        <div className={styles.section}>
                            <div className={styles.sectionLabel}>Đối soát thanh toán</div>
                            <div className={styles.paymentLoading}>Đang tải dữ liệu billing/reconciliation...</div>
                        </div>
                    )}

                    {!reconciliationLoading && paymentStats.length > 0 && (
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
                            {reconciliation?.discrepancyAlert && (
                                <div className={styles.paymentAlert}>
                                    Công nợ {discrepancyPercent}% đang vượt ngưỡng. Cần rà lại các bill chưa trả hoặc
                                    payment chưa phân bổ.
                                </div>
                            )}
                        </div>
                    )}

                    {agingBuckets.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionLabel}>Tuổi nợ</div>
                            <div className={styles.miniList}>
                                {agingBuckets.map((bucket) => (
                                    <div key={bucket.bucketCode} className={styles.miniRow}>
                                        <span>{bucket.label}</span>
                                        <span className={styles.miniValue}>
                                            {fmt(bucket.outstandingAmount)} đ · {bucket.invoiceCount} bill
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {Number(creditLedger?.currentBalance || 0) > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionLabel}>Credit carry-forward</div>
                            <div className={styles.inlineInfo}>
                                Credit hiện tại: <strong>{fmt(creditLedger.currentBalance)} đ</strong>
                            </div>
                            {recentCreditEntries.length > 0 && (
                                <div className={styles.miniList}>
                                    {recentCreditEntries.map((entry) => (
                                        <div key={entry.id} className={styles.miniRow}>
                                            <span>{formatEnumLabel(entry.entryType)}</span>
                                            <span className={styles.miniValue}>
                                                {fmt(entry.amount)} đ {entry.createdAt ? `· ${fmtDate(entry.createdAt)}` : ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {recentAuditLogs.length > 0 && (
                        <div className={styles.section}>
                            <div className={styles.sectionLabel}>Audit gần nhất</div>
                            <div className={styles.miniList}>
                                {recentAuditLogs.map((log) => (
                                    <div key={log.id} className={styles.auditRow}>
                                        <div className={styles.auditTitle}>{formatEnumLabel(log.operationType)}</div>
                                        <div className={styles.auditMeta}>
                                            {log.actorName || "System"}
                                            {log.createdAt ? ` · ${fmtDate(log.createdAt)}` : ""}
                                            {log.targetType ? ` · ${formatEnumLabel(log.targetType)}` : ""}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Tổng cộng</span>
                        <span className={styles.totalAmount}>{fmt(displayTotal)} ₫</span>
                    </div>
                    <div className={styles.previewState}>
                        {previewLoading
                            ? "Đang tải preview từ server..."
                            : preview
                              ? "Preview đã đồng bộ với dữ liệu server."
                              : "Chưa xem trước (preview chưa được khởi tạo)."}
                    </div>

                    <div className={`${styles.dueCard} ${isOverdue ? styles.dueOverdue : ""}`}>
                        <span className={styles.dueIcon}>📅</span>
                        <div>
                            <strong className={styles.dueStrong}>Hạn: {fmtDate(dueDate)}</strong>
                            <div className={styles.dueSub}>
                                {dueDate
                                    ? isOverdue
                                        ? `Đã quá hạn ${Math.abs(daysLeft)} ngày`
                                        : `Còn ${daysLeft} ngày để thanh toán`
                                    : "Chưa đặt hạn thanh toán"}
                            </div>
                        </div>
                    </div>
                </div>

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

            <div className={styles.tips}>
                <div className={styles.tipsTitle}>{"// Lưu ý"}</div>
                <p>Preview server là source of truth cho tổng tiền và các line proration.</p>
                <p>Thiếu meter reading hoặc mismatch total sẽ bị chặn trước khi phát hành.</p>
                <p>Credit và tuổi nợ đang được đọc trực tiếp từ reconciliation backend.</p>
            </div>
        </aside>
    );
}
