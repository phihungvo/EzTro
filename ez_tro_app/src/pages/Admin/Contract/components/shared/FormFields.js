import styles from './FormFields.module.scss';

/* ── Field ──────────────────────────────────────────────────────────────── */
export function Field({ label, required, hint, className, children }) {
    return (
        <div className={`${styles.field} ${className || ''}`}>
            <span className={styles.fieldLabel}>
                {label}
                {required && <span className={styles.required}> *</span>}
            </span>
            {children}
            {hint && <span className={styles.fieldHint}>{hint}</span>}
        </div>
    );
}

/* ── InputSuffix ─────────────────────────────────────────────────────────── */
export function InputSuffix({
                                value, onChange, suffix,
                                type = 'number', min, max, placeholder,
                            }) {
    return (
        <div className={styles.inputGroup}>
            <input
                className={styles.input}
                type={type}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                placeholder={placeholder}
            />
            <span className={styles.inputGroupSuffix}>{suffix}</span>
        </div>
    );
}

/* ── PrefixInput ─────────────────────────────────────────────────────────── */
export function PrefixInput({ prefix, value, onChange, placeholder }) {
    return (
        <div className={styles.fieldPrefix}>
            <span className={styles.prefixLabel}>{prefix}</span>
            <input
                className={styles.input}
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
}