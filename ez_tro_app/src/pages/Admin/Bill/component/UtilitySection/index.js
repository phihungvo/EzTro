import styles from "./UtilitySection.module.scss";
import cardStyles from "../../Section.module.scss";
import {fmt} from "../data.js";

function consumptionClass(diff, type) {
    if (diff < 0) return styles.error;
    if (diff > 200) return styles.high;
    return styles.normal;
}

export default function UtilitySection({
                                           state,
                                           onMeterCurrentChange,
                                           onMeterPriceChange,
                                       }) {
    const readings = Array.isArray(state.meterReadings) ? state.meterReadings : [];

    const rows = readings.map((r) => {
        const prev = Number(r.previousIndex || 0);
        const curr = r.currentIndex === "" || r.currentIndex === null || r.currentIndex === undefined
            ? null
            : Number(r.currentIndex);
        const price = Number(r.unitPrice || 0);
        const diff = curr == null ? 0 : curr - prev;
        const total = curr == null ? 0 : Math.max(0, diff * price);
        return { ...r, prev, curr, diff, total, price };
    });

    const utilityTotal = rows.reduce((s, r) => s + (r.total || 0), 0);
    const hasError = rows.some((r) => r.curr != null && r.diff < 0);

    return (
        <div className={cardStyles.card}>
            <div className={cardStyles.header}>
                <span className={cardStyles.title}>③ Chỉ số điện — nước</span>
                <span className={cardStyles.chipInfo}>📸 Có ảnh chụp đồng hồ</span>
            </div>
            <div className={cardStyles.body}>
                {hasError && (
                    <div className={cardStyles.alertDanger}>
                        <span>⚠️</span>
                        <span>
              Có chỉ số hiện tại thấp hơn kỳ trước!
            </span>
                    </div>
                )}

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Loại</th>
                            <th>Chỉ số cũ</th>
                            <th>Chỉ số mới</th>
                            <th>Tiêu thụ</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", color: "#999", padding: 16 }}>
                                    Phòng này chưa có dịch vụ điện/nước theo chỉ số (USAGE_BASED).
                                </td>
                            </tr>
                        ) : (
                            rows.map((r) => (
                                <tr key={r.utilityId}>
                                    <td className={styles.icon}>
                                        {String(r.utilityName || "").toLowerCase().includes("điện")
                                            ? "⚡"
                                            : String(r.utilityName || "").toLowerCase().includes("nước")
                                                ? "💧"
                                                : "🧾"}
                                    </td>
                                    <td>
                                        <div className={styles.utilName}>{r.utilityName}</div>
                                        <div className={styles.utilSub}>Kỳ: {state.month}/{state.year}</div>
                                    </td>
                                    <td>
                                        <div className={styles.prevReading}>{fmt(r.prev)}</div>
                                        <div className={styles.unit}>{r.unit || ""}</div>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className={styles.utilInput}
                                            value={r.currentIndex ?? ""}
                                            onChange={(e) => onMeterCurrentChange(r.utilityId, e.target.value)}
                                        />
                                        <div className={styles.unit}>{r.unit || ""}</div>
                                    </td>
                                    <td>
                  <span className={`${styles.consumBadge} ${consumptionClass(r.curr == null ? 0 : r.diff)}`}>
                    {r.curr == null ? "—" : r.diff}
                  </span>
                                        <div className={styles.unit}>{r.unit || ""}</div>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className={styles.utilInput}
                                            value={r.price}
                                            onChange={(e) => onMeterPriceChange(r.utilityId, e.target.value)}
                                            style={{width: 80}}
                                        />
                                        <div className={styles.unit}>₫/{r.unit || ""}</div>
                                    </td>
                                    <td className={styles.subtotal}>{fmt(r.total)}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan={6} className={styles.footLabel}>Tổng điện nước</td>
                            <td className={styles.footTotal}>{fmt(utilityTotal)}</td>
                        </tr>
                        </tfoot>
                    </table>
                </div>

                <button
                    className={styles.addPhotoBtn}
                    onClick={() => {
                    }}
                >
                    📷 Đính kèm ảnh chỉ số đồng hồ
                </button>
                <div className={cardStyles.hint}>Hỗ trợ JPG, PNG · Tối đa 3 ảnh · Lưu làm bằng chứng</div>
            </div>
        </div>
    );
}
