import styles from '../FinanceSection/FinanceSection.module.scss';

export default function FinanceSummary({
                                           rentNum, depositNum, fixedServices,
                                           monthlyTotal, signTotal, depositMonths, formatVND,
                                       }) {
    return (
        <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Tiền thuê phòng</span>
                <span className={styles.summaryValue}>{formatVND(rentNum)}</span>
            </div>

            {fixedServices.map((s) => (
                <div key={s.id} className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{s.name}</span>
                    <span className={styles.summaryValue}>{formatVND(s.price * s.qty)}</span>
                </div>
            ))}

            <div className={styles.summaryRow}>
                <span className={styles.summaryLabel} style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Điện / Nước
                </span>
                <span className={styles.summaryValue} style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Theo chỉ số
                </span>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryTotal}>
                <span className={styles.summaryLabel}>Tổng cố định/tháng</span>
                <span className={styles.summaryValue}>{formatVND(monthlyTotal)}</span>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                    Tiền đặt cọc ({depositMonths || 2} tháng)
                </span>
                <span className={styles.summaryValue} style={{ color: 'var(--gold)' }}>
                    {formatVND(depositNum || rentNum * Number(depositMonths || 2))}
                </span>
            </div>

            <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Thanh toán đầu kỳ (1 tháng)</span>
                <span className={styles.summaryValue} style={{ color: 'var(--gold)' }}>
                    {formatVND(monthlyTotal)}
                </span>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryTotal}>
                <span className={styles.summaryLabel}>Tổng nhận khi ký</span>
                <span className={styles.summaryValue}>{formatVND(signTotal)}</span>
            </div>
        </div>
    );
}