import styles from './ActionBar.module.scss';

export default function ActionBar({ onBack, onSubmit, onReset, submitting, submitLabel, submittingLabel }) {
    return (
        <div className={styles.actionBar}>
            <div className={styles.actionBarLeft}>
                <button
                    className={`${styles.btn} ${styles.btnGhost}`}
                    type="button"
                    onClick={onBack}
                >
                    ← Quay lại
                </button>
                <button
                    className={`${styles.btn} ${styles.btnDangerGhost}`}
                    type="button"
                    onClick={onReset}
                >
                    ↺ Khôi phục
                </button>
            </div>

            <div className={styles.actionBarRight}>
                <button
                    className={`${styles.btn} ${styles.btnGold}`}
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                >
                    {submitting ? submittingLabel : submitLabel}
                </button>
            </div>
        </div>
    );
}
