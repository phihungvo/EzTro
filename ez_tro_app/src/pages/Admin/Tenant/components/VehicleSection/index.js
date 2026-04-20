import s from '../shared.module.scss';
import cs from './VehicleSection.module.scss';

/**
 * VehicleSection
 * Card phương tiện đăng ký: thêm/xoá xe, toggle thu phí giữ xe.
 *
 * Props:
 *  vehicles        array    - [{ id, type, plate }]
 *  onAdd           fn()
 *  onRemove        fn(id)
 *  onPatch         fn(id, field, value)
 *  parkingFee      bool     - bật/tắt thu phí giữ xe
 *  onParkingFee    fn(bool)
 */

const VEHICLE_TYPES = [
    { value: 'motorbike', label: '🏍️ Xe máy' },
    { value: 'ebike',     label: '⚡ Xe đạp điện' },
    { value: 'car',       label: '🚗 Ô tô' },
    { value: 'bicycle',   label: '🚲 Xe đạp' },
];

export default function VehicleSection({
                                           vehicles,
                                           onAdd,
                                           onRemove,
                                           onPatch,
                                           parkingFee,
                                           onParkingFee,
                                       }) {
    return (
        <>
            <div id="vehicles-list">
                {vehicles.map((v) => (
                    <div key={v.id} className={cs.vehicleItem}>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Loại phương tiện</label>
                            <select
                                className={s.formControl}
                                value={v.type}
                                onChange={(e) => onPatch(v.id, 'type', e.target.value)}
                            >
                                {VEHICLE_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Biển số xe</label>
                            <input
                                className={s.formControl}
                                placeholder="51K-12345"
                                value={v.plate}
                                onChange={(e) => onPatch(v.id, 'plate', e.target.value)}
                            />
                        </div>

                        <div className={cs.vehicleRemove}>
                            <button
                                className={s.btnIcon}
                                onClick={() => onRemove(v.id)}
                                title="Xoá"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className={s.btnAddMember} onClick={onAdd}>
                ＋ Thêm phương tiện
            </button>

            <div style={{ marginTop: 12 }}>
                <div className={s.toggleWrap}>
                    <div className={s.toggleLabel}>
                        <strong>Thu phí giữ xe</strong>
                        <span>Tính vào hóa đơn hàng tháng theo loại xe</span>
                    </div>
                    <label className={s.switch}>
                        <input
                            type="checkbox"
                            checked={parkingFee}
                            onChange={(e) => onParkingFee?.(e.target.checked)}
                        />
                        <span className={s.slider} />
                    </label>
                </div>
            </div>
        </>
    );
}