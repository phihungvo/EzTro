import SectionCard from '../SectionCard/SectionCard';
import { Field, InputSuffix } from '../shared/FormFields';
import sharedStyles from '../shared/FormFields.module.scss';
import styles from './ContractInfoSection.module.scss';

export default function ContractInfoSection({
                                                state, patch, boardingHouses, rooms, loadingRooms, selectedRoom,
                                            }) {
    return (
        <SectionCard
            icon="📋"
            iconColor="blue"
            title="Thông tin hợp đồng"
            desc="Mã hợp đồng, loại hợp đồng và thời hạn"
            headerRight={
                <div className={`${styles.statusChip} ${styles.draft}`}>
                    <div className={styles.dot} /> Bản nháp
                </div>
            }
        >
            {/* ── Chọn khu trọ & phòng ── */}
            <div className={sharedStyles.formGrid2}>
                <Field label="Cơ sở / Tòa nhà" required>
                    <select
                        className={sharedStyles.select}
                        value={state.boardingHouseId}
                        onChange={(e) => patch({ boardingHouseId: e.target.value })}
                    >
                        <option value="">Chọn khu trọ</option>
                        {boardingHouses.map((bh) => (
                            <option key={bh.id} value={bh.id}>{bh.name}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Số phòng" required>
                    <select
                        className={sharedStyles.select}
                        value={state.roomId}
                        disabled={!state.boardingHouseId || loadingRooms}
                        onChange={(e) => patch({ roomId: e.target.value })}
                    >
                        <option value="">
                            {loadingRooms ? 'Đang tải...' : 'Chọn phòng trống'}
                        </option>
                        {rooms.map((r) => (
                            <option key={r.id} value={r.id}>
                                P.{r.roomNumber} – Tầng {r.floorNumber || 'N/A'} – Đang trống
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <div className={sharedStyles.sectionDivider} />

            {/* ── Mã HĐ, loại, ngày ── */}
            <div className={sharedStyles.formGrid3}>
                <Field label="Mã hợp đồng" required hint="Tự động tạo, có thể chỉnh sửa">
                    <input
                        className={sharedStyles.input}
                        type="text"
                        defaultValue="HD-2024-0087"
                    />
                </Field>

                <Field label="Loại hợp đồng" required>
                    <select className={sharedStyles.select}>
                        <option>Hợp đồng dài hạn (≥ 6 tháng)</option>
                        <option>Hợp đồng ngắn hạn (&lt; 6 tháng)</option>
                        <option>Hợp đồng theo tháng</option>
                        <option>Hợp đồng thử việc</option>
                    </select>
                </Field>

                <Field label="Ngày ký hợp đồng" required>
                    <input
                        className={sharedStyles.input}
                        type="date"
                        defaultValue="2024-12-01"
                    />
                </Field>

                <Field label="Ngày bắt đầu thuê" required>
                    <input
                        className={sharedStyles.input}
                        type="date"
                        value={state.startDate}
                        onChange={(e) => patch({ startDate: e.target.value })}
                    />
                </Field>

                <Field label="Ngày kết thúc hợp đồng">
                    <input
                        className={sharedStyles.input}
                        type="date"
                        value={state.endDate}
                        disabled={state.isOpenEnded}
                        onChange={(e) => patch({ endDate: e.target.value })}
                    />
                </Field>

                <Field label="Thời hạn hợp đồng">
                    <InputSuffix
                        value={state.paymentCycleMonths}
                        onChange={(e) => patch({ paymentCycleMonths: e.target.value })}
                        suffix="tháng"
                        min={1}
                        max={120}
                    />
                </Field>
            </div>

            {/* ── Info box phòng đã chọn ── */}
            {selectedRoom && (
                <div className={`${sharedStyles.infoBox} ${sharedStyles.blue}`} style={{ marginTop: 14 }}>
                    <span>ℹ️</span>
                    <div>
                        Phòng {selectedRoom.roomNumber} – Tầng {selectedRoom.floorNumber || 'N/A'} –
                        Tối đa {selectedRoom.maxOccupants || 'N/A'} người.
                        Phòng hiện đang <strong>trống</strong>, có thể ký hợp đồng ngay.
                    </div>
                </div>
            )}
        </SectionCard>
    );
}