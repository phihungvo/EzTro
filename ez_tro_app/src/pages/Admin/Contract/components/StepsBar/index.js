/* ─── components/StepsBar/StepsBar.jsx ──────────────────────────────────────
 * Thanh tiến trình gồm 5 bước, nhấn để chuyển bước.
 * Props:
 *   steps      : Array<{ label: string }>
 *   activeStep : number (1-based)
 *   onChange   : (step: number) => void
 * ─────────────────────────────────────────────────────────────────────────── */
import styles from './StepsBar.module.scss';

export default function StepsBar({ steps, activeStep, onChange }) {
    return (
        <div className={styles.stepsBar}>
            {steps.map((step, i) => {
                const n        = i + 1;
                const isDone   = n < activeStep;
                const isActive = n === activeStep;
                return (
                    <div
                        key={n}
                        className={[
                            styles.stepItem,
                            isDone   ? styles.done   : '',
                            isActive ? styles.active : '',
                        ].join(' ')}
                        onClick={() => onChange(n)}
                    >
                        <div className={styles.stepNum}>
                            {isDone ? '✓' : n}
                        </div>
                        <div className={styles.stepInfo}>
                            <span className={styles.stepLabel}>Bước {n}</span>
                            <span className={styles.stepName}>{step.label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}