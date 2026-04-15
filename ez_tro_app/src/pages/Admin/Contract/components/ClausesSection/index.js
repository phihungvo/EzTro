import SectionCard from '../SectionCard/SectionCard';
import { Field } from '../shared/FormFields';
import sharedStyles from '../shared/FormFields.module.scss';
import styles from './ClausesSection.module.scss';

export default function ClausesSection({
                                           clauses, onToggle, extraNote, onExtraNote,
                                       }) {
    return (
        <SectionCard
            icon="📜"
            iconColor="red"
            title="Điều khoản hợp đồng"
            desc="Quy định và điều khoản áp dụng cho hợp đồng này"
            headerRight={
                <button className={`${styles.btn} ${styles.btnGhost}`} style={{ fontSize: 12 }}>
                    📄 Tải mẫu sẵn
                </button>
            }
        >
            <div className={styles.subHeading}>
                Điều khoản tiêu chuẩn (nhấn để bật/tắt)
            </div>

            {/* ── Danh sách điều khoản ── */}
            <div className={styles.clauseList}>
                {clauses.map((c) => (
                    <div
                        key={c.id}
                        className={`${styles.clauseItem} ${c.selected ? styles.selected : ''}`}
                        onClick={() => onToggle(c.id)}
                    >
                        <div className={styles.clauseCheck}>{c.selected ? '✓' : ''}</div>
                        <div className={styles.clauseText}>{c.text}</div>
                    </div>
                ))}
            </div>

            <div className={sharedStyles.sectionDivider} />

            {/* ── Điều khoản bổ sung ── */}
            <Field label="Điều khoản bổ sung (tuỳ chỉnh)">
                <textarea
                    className={sharedStyles.textarea}
                    style={{ minHeight: 100 }}
                    value={extraNote}
                    onChange={(e) => onExtraNote(e.target.value)}
                    placeholder="Thêm điều khoản riêng cho hợp đồng này..."
                />
            </Field>

            {/* ── Cảnh báo pháp lý ── */}
            <div className={`${sharedStyles.infoBox} ${sharedStyles.gold}`} style={{ marginTop: 14 }}>
                <span>⚠️</span>
                <div>
                    Hợp đồng này có giá trị pháp lý khi được ký bởi cả hai bên.
                    Nên in 2 bản, mỗi bên giữ 1 bản có chữ ký gốc.
                </div>
            </div>
        </SectionCard>
    );
}