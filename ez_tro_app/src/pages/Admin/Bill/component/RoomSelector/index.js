import styles from "./RoomSelector.module.scss";
import { MOCK_ROOMS as RAW_MOCK_ROOMS, fmt } from "../data.js";

// Fallback để tránh crash nếu import bị lỗi trong quá trình hot-reload
const MOCK_ROOMS = RAW_MOCK_ROOMS || {};

const INVOICED_ROOMS = ["103", "302"];

export default function RoomSelector({ selectedRoom, month, year, onSelectRoom, onMonthChange, onYearChange }) {
    const roomData = MOCK_ROOMS[selectedRoom];

    const getHistoryBadge = (r) => {
        if (r.months_left <= 2) return { cls: styles.badgeRed, text: "HĐ sắp HH" };
        if (r.history === "late") return { cls: styles.badgeAmber, text: "Hay trễ hạn" };
        return { cls: styles.badgeGreen, text: "Đúng hạn" };
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>① Thông tin phòng &amp; hợp đồng</span>
                <span className={styles.chip}>
          Tháng <strong>{month}/{year}</strong>
        </span>
            </div>

            <div className={styles.cardBody}>
                {/* Period + Month/Year */}
                <div className={styles.periodRow}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Kỳ hoá đơn</label>
                        <div className={styles.segmented}>
                            <button className={`${styles.segBtn} ${styles.segActive}`}>Hàng tháng</button>
                            <button className={styles.segBtn}>Tùy chỉnh</button>
                        </div>
                    </div>
                </div>

                <div className={styles.row2}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Tháng <span className={styles.req}>*</span></label>
                        <select className={styles.select} value={month} onChange={(e) => onMonthChange(+e.target.value)}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Năm <span className={styles.req}>*</span></label>
                        <select className={styles.select} value={year} onChange={(e) => onYearChange(+e.target.value)}>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                </div>

                <div className={styles.sep} />
                <div className={styles.sectionLabel}>Chọn phòng</div>

                {INVOICED_ROOMS.includes(selectedRoom) && (
                    <div className={styles.alertWarn}>
                        <span>⚠️</span>
                        <span>Phòng này đã có hoá đơn tháng <strong>{month}/{year}</strong>. Bạn có muốn tạo hoá đơn bổ sung?</span>
                    </div>
                )}

                {/* Room grid */}
                <div className={styles.roomGrid}>
                    {Object.entries(MOCK_ROOMS).map(([id, r]) => {
                        const isSelected = selectedRoom === id;
                        const isEmpty = r.status === "empty";
                        const isInvoiced = r.status === "invoiced";

                        return (
                            <div
                                key={id}
                                className={`${styles.roomCard} ${isSelected ? styles.selected : ""} ${isEmpty ? styles.empty : ""}`}
                                onClick={() => !isEmpty && onSelectRoom(id)}
                            >
                <span
                    className={`${styles.statusDot} ${
                        isEmpty ? styles.dotEmpty : isInvoiced ? styles.dotInvoiced : styles.dotAvailable
                    }`}
                />
                                <div className={styles.roomNum}>P.{id}</div>
                                <div className={styles.roomMeta}>
                                    T{r.floor} · {isEmpty ? "Trống" : `${r.people} người`}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className={styles.legend}>
                    <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.dotAvailable}`} />Chưa có HĐ</span>
                    <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.dotInvoiced}`} />Đã tạo HĐ</span>
                    <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.dotEmpty}`} />Phòng trống</span>
                </div>

                {/* Tenant card */}
                {roomData && roomData.tenant && (
                    <div className={styles.tenantCard}>
                        <div className={styles.tenantAvatar}>👤</div>
                        <div className={styles.tenantInfo}>
                            <div className={styles.tenantNameRow}>
                                <span className={styles.tenantName}>{roomData.tenant}</span>
                                <span className={styles.badgeCyan}>Đang ở</span>
                            </div>
                            <div className={styles.tenantMeta}>
                                <span>📱 {roomData.phone}</span>
                                <span>
                  📋 HĐ: <strong>{roomData.contract}</strong> · Còn{" "}
                                    <strong
                                        className={roomData.months_left <= 2 ? styles.textRed : styles.textCyan}
                                    >
                    {roomData.months_left} tháng
                  </strong>
                </span>
                            </div>
                        </div>
                        <div className={styles.tenantRight}>
                            <span className={styles.badgeAmber}>{roomData.people} người</span>
                            <span className={`${getHistoryBadge(roomData).cls}`}>
                {getHistoryBadge(roomData).text}
              </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}