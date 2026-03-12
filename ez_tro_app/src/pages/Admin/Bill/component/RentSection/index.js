import cardStyles from "../../Section.module.scss";
import styles from "./RentSection.module.scss";
import { fmt, PAYMENT_HISTORY } from "../data.js";

export default function RentSection({ state, onRoomPriceChange, onIssueDateChange }) {
  const daysInMonth = new Date(state.year, state.month, 0).getDate();

  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.header}>
        <span className={cardStyles.title}>② Tiền phòng</span>
        <span className={styles.badge}>Theo hợp đồng</span>
      </div>
      <div className={cardStyles.body}>
        <div className={styles.row2}>
          <div className={cardStyles.fieldGroup}>
            <label className={cardStyles.label}>
              Giá thuê / tháng <span className={cardStyles.req}>*</span>
            </label>
            <input
              type="number"
              className={`${cardStyles.input} ${cardStyles.mono}`}
              value={state.roomPrice}
              onChange={(e) =>
                onRoomPriceChange(parseFloat(e.target.value) || 0)
              }
            />
            <span className={cardStyles.hint}>
              Theo HĐ: {fmt(state.roomPrice)} ₫/tháng
            </span>
          </div>
          <div className={cardStyles.fieldGroup}>
            <label className={cardStyles.label}>Số ngày thuê</label>
            <input
              type="number"
              className={`${cardStyles.input} ${cardStyles.mono}`}
              value={daysInMonth}
              readOnly
            />
            <span className={cardStyles.hint}>
              Tháng {state.month} = {daysInMonth} ngày
            </span>
          </div>
        </div>

        <div className={cardStyles.fieldGroup} style={{ marginBottom: 14 }}>
          <label className={cardStyles.label}>
            Ngày xuất hoá đơn <span className={cardStyles.req}>*</span>
          </label>
          <input
            type="date"
            className={cardStyles.input}
            value={state.issueDate}
            onChange={(e) => onIssueDateChange(e.target.value)}
          />
        </div>

        <div className={cardStyles.sep} />
        <div className={cardStyles.fieldGroup}>
          <label className={cardStyles.label}>Lịch sử thanh toán gần đây</label>
          <div className={styles.historyList}>
            {PAYMENT_HISTORY.map((h, i) => (
              <div
                key={i}
                className={styles.historyItem}
                style={{ borderBottom: i < PAYMENT_HISTORY.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <span
                  className={styles.historyDot}
                  style={{
                    background: h.ok ? "var(--green)" : "var(--red)",
                    boxShadow: `0 0 5px ${h.ok ? "var(--green)" : "var(--red)"}`,
                  }}
                />
                <div>
                  <div className={styles.historyMeta}>
                    Tháng {h.period} ·{" "}
                    {h.ok ? `Thanh toán ngày ${h.date}` : h.date}
                  </div>
                  <div className={styles.historyDesc}>{h.desc}</div>
                  <div
                    className={styles.historyAmount}
                    style={{ color: h.ok ? "var(--green)" : "var(--red)" }}
                  >
                    {h.ok ? "+" : ""}
                    {fmt(h.amount)} ₫
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

