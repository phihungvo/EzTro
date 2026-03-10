import styles from "./SummaryPanel.module.scss";
import { fmt, SERVICES_CONFIG } from "../data.js";

export default function SummaryPanel({ state, computed, roomData, onPublish, onPreview, onShare }) {
    const { room, month, year, dueDate, services } = state;
    const { elecTotal, waterTotal, subtotal, discount, total } = computed;

    const elecDiff  = state.elecNew  - state.elecPrev;
    const waterDiff = state.waterNew - state.waterPrev;

    const daysLeft = dueDate ? Math.round((new Date(dueDate) - new Date()) / 86400000) : 0;
    const isOverdue = daysLeft < 0;

    const dueDateFormatted = dueDate
        ? new Date(dueDate).toLocaleDateString("vi-VN")
        : "—";

    const activeServices = Object.entries(services).filter(([, on]) => on);
    const extrasTotal = state.extras.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

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
                        <div className={styles.line_}>
                            <span className={styles.lineName}>⚡ Điện ({elecDiff} kWh)</span>
                            <span className={styles.lineVal}>{fmt(elecTotal)}</span>
                        </div>
                        <div className={styles.line_}>
                            <span className={styles.lineName}>💧 Nước ({waterDiff} m³)</span>
                            <span className={styles.lineVal}>{fmt(waterTotal)}</span>
                        </div>

                        {activeServices.map(([key]) => (
                            <div key={key} className={styles.line_}>
                <span className={styles.lineName}>
                  {SERVICES_CONFIG[key].icon} {SERVICES_CONFIG[key].name}
                </span>
                                <span className={styles.lineVal}>{fmt(SERVICES_CONFIG[key].price)}</span>
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
                            <span className={styles.lineVal}>{fmt(subtotal)}</span>
                        </div>

                        {discount > 0 && (
                            <div className={styles.line_}>
                                <span className={`${styles.lineSubLabel} ${styles.discountName}`}>🏷 Giảm giá</span>
                                <span className={`${styles.lineVal} ${styles.discountVal}`}>−{fmt(discount)}</span>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Tổng cộng</span>
                        <span className={styles.totalAmount}>{fmt(total)} ₫</span>
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
                    <button className={styles.btnOutline} onClick={onPreview}>
                        👁 Xem trước hoá đơn
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