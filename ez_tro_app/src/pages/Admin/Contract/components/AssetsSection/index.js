import SectionCard from '../SectionCard/SectionCard';
import { Field, InputSuffix } from '../shared/FormFields';
import sharedStyles from '../shared/FormFields.module.scss';
import styles from './AssetsSection.module.scss';

export default function AssetsSection({ activeAssets, onToggleAsset, defaultAssets }) {
    return (
        <SectionCard
            icon="📦"
            iconColor="orange"
            title="Bàn giao tài sản & thiết bị"
            desc="Ghi nhận nội thất, thiết bị bàn giao kèm phòng"
        >
            {/* ── Tag pills ── */}
            <div className={styles.tagGroup}>
                {defaultAssets.map((name) => (
                    <div
                        key={name}
                        className={`${styles.tag} ${activeAssets.has(name) ? styles.active : styles.default}`}
                        onClick={() => onToggleAsset(name)}
                    >
                        {activeAssets.has(name) ? `✓ ${name}` : name}
                    </div>
                ))}
            </div>

            {/* ── Chỉ số & chìa khoá ── */}
            <div className={sharedStyles.formGrid3}>
                <Field label="Chỉ số điện bàn giao">
                    <InputSuffix value="1245" onChange={() => {}} suffix="kWh" />
                </Field>
                <Field label="Chỉ số nước bàn giao">
                    <InputSuffix value="87" onChange={() => {}} suffix="m³" />
                </Field>
                <Field label="Số chìa khoá bàn giao">
                    <InputSuffix value="2" onChange={() => {}} suffix="chìa" min={1} />
                </Field>
            </div>

            <div className={sharedStyles.sectionDivider} />

            {/* ── Ghi chú tình trạng ── */}
            <Field label="Ghi chú tình trạng phòng">
                <textarea
                    className={sharedStyles.textarea}
                    defaultValue="Phòng mới sơn lại, sàn gạch tốt. Điều hòa Daikin 1.5HP hoạt động bình thường. Có 1 vết nứt nhỏ tường phía cửa sổ."
                />
            </Field>

            {/* ── Upload zone ── */}
            <div className={styles.uploadZone}>
                <div className={styles.uploadIcon}>📸</div>
                <div className={styles.uploadText}>Tải ảnh tình trạng phòng lúc bàn giao</div>
                <div className={styles.uploadSubtext}>JPG, PNG – tối đa 10 ảnh, mỗi ảnh ≤ 5MB</div>
            </div>
        </SectionCard>
    );
}