import styles from './ActionBar.module.scss';

export default function ActionBar({ onBack, onSubmit, submitting }) {
    return (
        <div className={styles.actionBar}>
            <div className={styles.actionBarLeft}>
                <button
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={onBack}
                >
                    ← Quay lại
                </button>
                <button className={`${styles.btn} ${styles.btnDangerGhost}`}>
                    🗑 Xoá form
                </button>
            </div>

            <div className={styles.actionBarRight}>
                <button className={`${styles.btn} ${styles.btnSecondary}`}>
                    💾 Lưu nháp
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`}>
                    👁 Xem trước HĐ
                </button>
                <button
                    className={`${styles.btn} ${styles.btnGold}`}
                    onClick={onSubmit}
                    disabled={submitting}
                >
                    {submitting ? '⏳ Đang tạo...' : '✅ Tạo hợp đồng'}
                </button>
            </div>
        </div>
    );
}