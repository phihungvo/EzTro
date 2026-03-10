import styles from "./UtilitySection.module.scss";
import cardStyles from "../../Section.module.scss";
import {fmt} from "../data.js";

function consumptionClass(diff, type) {
    if (diff < 0) return styles.error;
    if (type === "elec" && diff > 200) return styles.high;
    if (type === "water" && diff > 30) return styles.high;
    return styles.normal;
}

export default function UtilitySection({
                                           state,
                                           onElecNewChange,
                                           onWaterNewChange,
                                           onElecPriceChange,
                                           onWaterPriceChange
                                       }) {
    const {elecPrev, elecNew, elecPrice, waterPrev, waterNew, waterPrice} = state;
    const elecDiff = elecNew - elecPrev;
    const waterDiff = waterNew - waterPrev;
    const elecTotal = Math.max(0, elecDiff * elecPrice);
    const waterTotal = Math.max(0, waterDiff * waterPrice);
    const utilityTotal = elecTotal + waterTotal;

    const hasError = elecDiff < 0 || waterDiff < 0;

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
              {elecDiff < 0 ? "Chỉ số điện hiện tại thấp hơn kỳ trước! " : ""}
                            {waterDiff < 0 ? "Chỉ số nước hiện tại thấp hơn kỳ trước!" : ""}
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
                        {/* Electricity */}
                        <tr>
                            <td className={styles.icon}>⚡</td>
                            <td>
                                <div className={styles.utilName}>Điện</div>
                                <div className={styles.utilSub}>Kỳ: 1–31/03</div>
                            </td>
                            <td>
                                <div className={styles.prevReading}>{fmt(elecPrev)}</div>
                                <div className={styles.unit}>kWh</div>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.utilInput}
                                    value={elecNew}
                                    onChange={(e) => onElecNewChange(+e.target.value)}
                                />
                                <div className={styles.unit}>kWh</div>
                            </td>
                            <td>
                  <span className={`${styles.consumBadge} ${consumptionClass(elecDiff, "elec")}`}>
                    {elecDiff}
                  </span>
                                <div className={styles.unit}>kWh</div>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.utilInput}
                                    value={elecPrice}
                                    onChange={(e) => onElecPriceChange(+e.target.value)}
                                    style={{width: 80}}
                                />
                                <div className={styles.unit}>₫/kWh</div>
                            </td>
                            <td className={styles.subtotal}>{fmt(elecTotal)}</td>
                        </tr>

                        {/* Water */}
                        <tr>
                            <td className={styles.icon}>💧</td>
                            <td>
                                <div className={styles.utilName}>Nước</div>
                                <div className={styles.utilSub}>Kỳ: 1–31/03</div>
                            </td>
                            <td>
                                <div className={styles.prevReading}>{fmt(waterPrev)}</div>
                                <div className={styles.unit}>m³</div>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.utilInput}
                                    value={waterNew}
                                    onChange={(e) => onWaterNewChange(+e.target.value)}
                                />
                                <div className={styles.unit}>m³</div>
                            </td>
                            <td>
                  <span className={`${styles.consumBadge} ${consumptionClass(waterDiff, "water")}`}>
                    {waterDiff}
                  </span>
                                <div className={styles.unit}>m³</div>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className={styles.utilInput}
                                    value={waterPrice}
                                    onChange={(e) => onWaterPriceChange(+e.target.value)}
                                    style={{width: 80}}
                                />
                                <div className={styles.unit}>₫/m³</div>
                            </td>
                            <td className={styles.subtotal}>{fmt(waterTotal)}</td>
                        </tr>
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