import styles from "./PreviewModal.module.scss";
import { fmt, SERVICES_CONFIG } from "../data.js";

export default function PreviewModal({ state, computed, roomData, onClose, onPublish, onPrint }) {
    const { room, month, year, issueDate, dueDate, services, extras, paymentMethod, notePublic } = state;
    const { elecTotal, waterTotal, total } = computed;

    const elecDiff  = state.elecNew  - state.elecPrev;
    const waterDiff = state.waterNew - state.waterPrev;
    const activeServices = Object.entries(services).filter(([, on]) => on);
    const activeExtras   = extras.filter(e => parseFloat(e.amount) > 0);

    const pmLabels = { cash: "Tiền mặt", bank: "Chuyển khoản Vietcombank", momo: "Momo / ZaloPay" };

    const fmtDate = (str) => str ? new Date(str).toLocaleDateString("vi-VN") : "—";

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Xem trước hoá đơn</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.body}>
                    <div className={styles.previewDoc}>
                        {/* Head */}
                        <div className={styles.previewHead}>
                            <div className={styles.previewHeadSub}>KHU NHÀ TRỌ TÂN BÌNH</div>
                            <h3 className={styles.previewTitle}>HOÁ ĐƠN TIỀN PHÒNG</h3>
                            <p className={styles.previewPeriod}>Tháng {month}/{year}</p>
                        </div>

                        {/* Meta */}
                        <div className={styles.previewMeta}>
                            <div className={styles.metaBlock}>
                                <div className={styles.metaLbl}>Mã hoá đơn</div>
                                <div className={styles.metaVal}>#HD-{room}-{year}-{String(month).padStart(2,"0")}</div>
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

                        {/* Lines */}
                        <div className={styles.lines}>
                            <div className={styles.lineItem}>
                                <span>Tiền phòng (tháng {month})</span>
                                <span>{fmt(state.roomPrice)} ₫</span>
                            </div>
                            <div className={styles.lineItem}>
                                <span>Điện ({state.elecPrev}→{state.elecNew} = {elecDiff} kWh × {fmt(state.elecPrice)}₫)</span>
                                <span>{fmt(elecTotal)} ₫</span>
                            </div>
                            <div className={styles.lineItem}>
                                <span>Nước ({state.waterPrev}→{state.waterNew} = {waterDiff} m³ × {fmt(state.waterPrice)}₫)</span>
                                <span>{fmt(waterTotal)} ₫</span>
                            </div>
                            {activeServices.map(([key]) => (
                                <div key={key} className={styles.lineItem}>
                                    <span>{SERVICES_CONFIG[key].name}</span>
                                    <span>{fmt(SERVICES_CONFIG[key].price)} ₫</span>
                                </div>
                            ))}
                            {activeExtras.map((e) => (
                                <div key={e.id} className={styles.lineItem}>
                                    <span>{e.name || "Phí phát sinh"}</span>
                                    <span>{fmt(e.amount)} ₫</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.previewTotal}>
                            <span>TỔNG CỘNG</span>
                            <span>{fmt(total)} ₫</span>
                        </div>

                        <div className={styles.previewNote}>
                            <strong>Hạn thanh toán:</strong> {fmtDate(dueDate)}<br />
                            <strong>Phương thức:</strong> {pmLabels[paymentMethod] || paymentMethod}<br />
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
                    <button className={styles.btnPrimary} onClick={onPublish}>✅ Phát hành</button>
                </div>
            </div>
        </div>
    );
}