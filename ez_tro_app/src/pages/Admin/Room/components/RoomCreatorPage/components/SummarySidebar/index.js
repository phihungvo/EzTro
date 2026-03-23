import {FEATURE_FIELDS} from '../../constants';
import {formatCurrency} from '../../utils';
import styles from './SummarySidebar.module.scss';

export default function SummarySidebar({
                                           state,
                                           boardingHouseName,
                                           buildingName,
                                           selectedUtilities,
                                           hasActiveContract,
                                           selectedBuilding,
                                           isQuotaExceeded,
                                       }) {
    const enabledFeatures = FEATURE_FIELDS.filter((item) => state[item.key]);
    const checklist = [
        {
            label: 'Khu nhà và tòa nhà',
            done: Boolean(boardingHouseName && buildingName),
            hint: boardingHouseName && buildingName
                ? `${boardingHouseName} / ${buildingName}`
                : 'Chưa chọn đủ vị trí phòng',
        },
        {
            label: 'Giá thuê và diện tích',
            done: Number(state.price || 0) > 0 && Number(state.area || 0) > 0,
            hint:
                Number(state.price || 0) > 0 && Number(state.area || 0) > 0
                    ? `${formatCurrency(state.price)} · ${state.area} m²`
                    : 'Thiếu giá thuê hoặc diện tích',
        },
        {
            label: 'Sức chứa và tầng',
            done:
                Number(state.maxOccupants || 0) > 0 &&
                (!state.floorNumber || Number(state.floorNumber) > 0),
            hint: `${state.maxOccupants || '0'} người · tầng ${state.floorNumber || '—'}`,
        },
        {
            label: 'Tiện ích mặc định',
            done: selectedUtilities.length > 0,
            hint:
                selectedUtilities.length > 0
                    ? `${selectedUtilities.length} tiện ích đã chọn`
                    : 'Chưa chọn tiện ích nào',
        },
    ];

    return (
        <aside className={styles.reviewShell}>
            <div className={styles.top}>

                <div className={`${styles.statusPill} ${hasActiveContract ? styles.warning : styles.ready}`}>
                    {hasActiveContract ? 'Có hợp đồng hiệu lực' : (state.status === 'MAINTENANCE' ? 'Đang bảo trì' : 'Sẳn sàn khai thác')}
                </div>
            </div>

            <div className={styles.heroCard}>
                <div>
                    <span className={styles.label}>Vi tri phong</span>
                    <strong>{state.roomNumber?.trim() || 'Tự sinh số phòng'}</strong>
                    <small>{boardingHouseName || 'Chưa chọn khu nhà'} · {buildingName || 'Chưa chọn toà nhà'}</small>
                </div>
                <div className={styles.priceBox}>
                    <span>Giá thuê</span>
                    <strong>{formatCurrency(state.price)}</strong>
                    <small>{state.area || '0'} m2 · tối đa {state.maxOccupants || '0'} người</small>
                </div>
            </div>

            <div className={styles.metricGrid}>
                <div className={`${styles.metricCard} ${styles.teal}`}>
                    <span>Tiện ích</span>
                    <strong>{selectedUtilities.length}</strong>
                    <small>đang áp dụng</small>
                </div>
                <div className={`${styles.metricCard} ${styles.amber}`}>
                    <span>Tầng</span>
                    <strong>{state.floorNumber || '—'}</strong>
                    <small>{selectedBuilding?.totalFloors ? `tối đa ${selectedBuilding.totalFloors}` : 'chưa đạt giới hạn'}</small>
                </div>
                <div className={`${styles.metricCard} ${styles.violet}`}>
                    <span>Tiện nghi</span>
                    <strong>{enabledFeatures.length}</strong>
                    <small>đang bật</small>
                </div>
            </div>

            <div className={styles.block}>
                <span className={styles.label}>Checklist dữ liệu</span>
                <div className={styles.checklist}>
                    {checklist.map((item) => (
                        <div key={item.label}
                             className={`${styles.checkItem} ${item.done ? styles.done : styles.pending}`}>
                            <span className={styles.icon}>{item.done ? '✓' : '•'}</span>
                            <div>
                                <strong>{item.label}</strong>
                                <small>{item.hint}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.block}>
                <span className={styles.label}>Utility đang chọn</span>
                {selectedUtilities.length === 0 ? (
                    <p className={styles.empty}>Chưa chọn utility mặc định cho phòng này.</p>
                ) : (
                    <div className={styles.tags}>
                        {selectedUtilities.map((utility) => (
                            <span key={utility.id} className={`${styles.tag} ${styles.tealTag}`}>{utility.name}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.block}>
                <span className={styles.label}>Tiện nghi</span>
                {enabledFeatures.length === 0 ? (
                    <p className={styles.empty}>Chưa bật tiện nghi cố định nào.</p>
                ) : (
                    <div className={styles.tags}>
                        {enabledFeatures.map((feature) => (
                            <span key={feature.key}
                                  className={`${styles.tag} ${styles.violetTag}`}>{feature.title}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.block}>
                <span className={styles.label}>Ghi chú bàn giao</span>
                <p className={styles.note}>
                    {state.note?.trim() || 'Chưa có ghi chú nội bộ. Có thể để trống nếu chưa cần.'}
                </p>
            </div>
        </aside>
    );
}
