import cardStyles from "../../Section.module.scss";
import styles from "./RentSection.module.scss";
import { fmt } from "../data.js";

export default function RentSection({ state, onRoomPriceChange, onIssueDateChange }) {
  const daysInMonth = new Date(state.year, state.month, 0).getDate();
  const currentVersion = state.contractVersion;
  const billingCycleLabel = {
    DAILY: "Theo ngày",
    WEEKLY: "Theo tuần",
    MONTHLY: "Theo tháng",
  }[currentVersion?.billingCycle] || "Theo tháng";

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
          <label className={cardStyles.label}>Version hợp đồng hiện hành</label>
          <div className={styles.historyList}>
            {currentVersion ? (
              <>
                <div className={styles.historyItem}>
                  <span
                    className={styles.historyDot}
                    style={{ background: "var(--cyan)", boxShadow: "0 0 5px var(--cyan)" }}
                  />
                  <div>
                    <div className={styles.historyMeta}>
                      Version #{currentVersion.versionNumber} · {billingCycleLabel}
                    </div>
                    <div className={styles.historyDesc}>
                      Hiệu lực từ {currentVersion.effectiveFrom || "N/A"}
                      {currentVersion.effectiveTo ? ` đến ${currentVersion.effectiveTo}` : " đến vô thời hạn"}
                    </div>
                    <div className={styles.historyAmount} style={{ color: "var(--cyan)" }}>
                      Giá thuê {fmt(currentVersion.price || 0)} ₫
                    </div>
                  </div>
                </div>
                <div className={styles.historyItem}>
                  <span
                    className={styles.historyDot}
                    style={{ background: "var(--amber)", boxShadow: "0 0 5px var(--amber)" }}
                  />
                  <div>
                    <div className={styles.historyMeta}>
                      Tiền cọc · Chu kỳ thanh toán
                    </div>
                    <div className={styles.historyDesc}>
                      Cọc {fmt(currentVersion.depositAmount || 0)} ₫
                    </div>
                    <div className={styles.historyAmount} style={{ color: "var(--amber)" }}>
                      Thu vào ngày {currentVersion.monthlyPaymentDay || "--"} · {billingCycleLabel}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.historyItem}>
                <div>
                  <div className={styles.historyMeta}>Chưa có version hợp đồng</div>
                  <div className={styles.historyDesc}>
                    Hãy chạy backfill foundation hoặc chọn phòng có hợp đồng đã được migrate.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
