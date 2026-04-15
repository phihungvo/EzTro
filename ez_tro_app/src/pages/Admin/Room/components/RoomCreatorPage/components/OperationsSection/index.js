import SectionCard from '~/pages/Admin/Contract/components/SectionCard/SectionCard';
import {Field, InputSuffix} from '~/pages/Admin/Contract/components/shared/FormFields';
import sharedStyles from '~/pages/Admin/Contract/components/shared/FormFields.module.scss';

import {STATUS_OPTIONS} from '../../constants';
import styles from './OperationsSection.module.scss';

export default function OperationsSection({state, patch, selectedBuilding, statusLocked}) {
    return (
        <SectionCard
            icon="02"
            iconColor="gold"
            title="Giá thuê và vận hành"
            desc="Thông số này là mốc gốc để tạo hợp đồng, kiểm soát công suất và khai thác phòng."
        >
            <div className={sharedStyles.formGrid4}>
                <Field label="Giá thuê" required hint="Giá gốc theo tháng trước khi lên hợp đồng">
                    <InputSuffix
                        value={state.price}
                        onChange={(e) => patch({price: e.target.value})}
                        suffix="VND / tháng"
                        min={0}
                        placeholder="4500000"
                    />
                </Field>

                <Field label="Diện tích" required>
                    <InputSuffix
                        value={state.area}
                        onChange={(e) => patch({area: e.target.value})}
                        suffix="m2"
                        type="number"
                        min={0}
                        placeholder="18"
                    />
                </Field>

                <Field label="Sức chứa tối đa" required>
                    <InputSuffix
                        value={state.maxOccupants}
                        onChange={(e) => patch({maxOccupants: e.target.value})}
                        suffix="người"
                        type="number"
                        min={1}
                        placeholder="2"
                    />
                </Field>

                <Field label="Tầng đặt phòng"
                       hint={selectedBuilding?.totalFloors ? `Toà hiện có ${selectedBuilding.totalFloors} tầng.` : 'Có thể bổ sung sau nếu toà chưa cấu hình'}>
                    <InputSuffix
                        value={state.floorNumber}
                        onChange={(e) => patch({floorNumber: e.target.value})}
                        suffix="tầng"
                        type="number"
                        min={1}
                        placeholder="2"
                    />
                </Field>
            </div>

            <div className={styles.statusGrid}>
                {STATUS_OPTIONS.map((option) => {
                    const active = state.status === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={`${styles.statusCard} ${styles[option.tone]} ${active ? styles.active : ''} ${statusLocked ? styles.locked : ''}`}
                            onClick={() => !statusLocked && patch({status: option.value})}
                            disabled={statusLocked}
                        >
                            <div className={styles.statusCardHeader}>
                                <strong>{option.label}</strong>
                                <span>{active ? 'Đang chọn' : 'Có thể chọn'}</span>
                            </div>
                            <p>{option.desc}</p>
                        </button>
                    );
                })}

                <div className={`${styles.statusCard} ${styles.coral} ${styles.systemCard}`}>
                    <div className={styles.statusCardHeader}>
                        <strong>Đang có khách</strong>
                        <span>Đồng bộ từ hệ thống</span>
                    </div>
                    <p>Khi có hợp đồng hiệu lực, trạng thái phòng sẽ tự chuyển sang đang thuê.</p>
                </div>
            </div>

            <Field
                label="Ghi chú vận hành"
                className={sharedStyles.colSpan3}
                hint="Ví dụ: đã sơn mới, lưu ý điện nước, vật dụng cần bổ sung trước khi bàn giao."
            >
                <textarea
                    className={sharedStyles.textarea}
                    value={state.note}
                    onChange={(e) => patch({note: e.target.value})}
                    placeholder="Nhập ghi chú nội bộ cho chủ trọ hoặc đội vận hành."
                />
            </Field>
        </SectionCard>
    );
}
