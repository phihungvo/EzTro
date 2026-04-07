import SectionCard from '~/pages/Admin/Contract/components/SectionCard/SectionCard';

import {FEATURE_FIELDS} from '../../constants';
import {formatCurrency} from '../../utils';
import styles from './AmenitiesSection.module.scss';

export default function AmenitiesSection({state, patch, utilities}) {
    const toggleUtility = (utilityId) => {
        const key = String(utilityId);
        patch({
            utilityIds: state.utilityIds.includes(key)
                ? state.utilityIds.filter((item) => item !== key)
                : [...state.utilityIds, key],
        });
    };

    return (
        <SectionCard
            icon="03"
            iconColor="blue"
            title="Tiện ích và cấu hình phòng"
            desc="Chọn tiện ích mặc định và tiện nghi có sẵn để luồng hợp đồng, hóa đơn và vận hành đúng thực tế."
        >
            <div className={styles.utilityPanel}>
                <div className={styles.utilityHeader}>
                    <div>
                        <strong>Tiện ích của khu trọ</strong>
                        <p>Chỉ hiển thị những tiện ích đã được cấu hình sẵn cho khu nhà hiện tại.</p>
                    </div>
                    <span>{state.utilityIds.length} đang áp dụng</span>
                </div>

                {utilities.length === 0 ? (
                    <div className={styles.emptyState}>
                        Khu trọ này chưa có tiện ích nào. Bạn vẫn có thể lưu phòng trước và bổ sung sau.
                    </div>
                ) : (
                    <div className={styles.utilityGrid}>
                        {utilities.map((utility) => {
                            const active = state.utilityIds.includes(String(utility.id));
                            return (
                                <button
                                    key={utility.id}
                                    type="button"
                                    className={`${styles.utilityCard} ${active ? styles.selected : ''}`}
                                    onClick={() => toggleUtility(utility.id)}
                                >
                                    <div className={styles.utilityCardHeader}>
                                        <strong>{utility.name}</strong>
                                        <span>{active ? 'Đã chọn' : 'Thêm vào phòng'}</span>
                                    </div>
                                    <p>{utility.type === 'USAGE_BASED' ? 'Tính theo chỉ số / Mức sử dụng' : 'Tính phí cố định theo kỳ'}</p>
                                    <small>{formatCurrency(utility.unitPrice)} / {utility.unit || 'tháng'}</small>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className={styles.featureGrid}>
                {FEATURE_FIELDS.map((feature) => (
                    <button
                        key={feature.key}
                        type="button"
                        className={`${styles.featureCard} ${styles[feature.tone]} ${state[feature.key] ? styles.enabled : ''}`}
                        onClick={() => patch({[feature.key]: !state[feature.key]})}
                    >
                        <span className={styles.featureIcon}>{feature.icon}</span>
                        <div>
                            <strong>{feature.title}</strong>
                            <p>{feature.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </SectionCard>
    );
}
