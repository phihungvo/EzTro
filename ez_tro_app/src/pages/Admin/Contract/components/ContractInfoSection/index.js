import SectionCard from '../SectionCard/SectionCard';
import { Field, InputSuffix } from '../shared/FormFields';
import sharedStyles from '../shared/FormFields.module.scss';
import styles from './ContractInfoSection.module.scss';

export default function ContractInfoSection({
                                                state, patch, boardingHouses, rooms, loadingRooms, selectedRoom, isEditMode,
                                            }) {
    const statusText = {
        ACTIVE: 'Đang hiệu lực',
        PENDING: 'Sắp hiệu lực',
        EXPIRED: 'Đã hết hạn',
        CANCELLED: 'Đã hủy',
    }[state.status] || 'Bản nháp';

    return (
        <SectionCard
            icon="📋"
            iconColor="blue"
            title="Thông tin hợp đồng"
            desc={isEditMode ? "Cập nhật thông tin hợp đồng hiện có" : "Chọn phòng và thiết lập kỳ hạn hợp đồng"}
            headerRight={
                <div className={`${styles.statusChip} ${styles.draft}`}>
                    <div className={styles.dot} /> {statusText}
                </div>
            }
        >
            {/* ── Chọn khu trọ & phòng ── */}
            <div className={sharedStyles.formGrid2}>
                <Field label="Cơ sở / Tòa nhà" required>
                    <select
                        className={sharedStyles.select}
                        value={state.boardingHouseId}
                        disabled={isEditMode}
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
                        disabled={isEditMode || !state.boardingHouseId || loadingRooms}
                        onChange={(e) => patch({ roomId: e.target.value })}
                    >
                        <option value="">
                            {loadingRooms ? 'Đang tải...' : 'Chọn phòng'}
                        </option>
                        {rooms.map((r) => (
                            <option key={r.id} value={r.id}>
                                P.{r.roomNumber} – Tầng {r.floorNumber || 'N/A'} – {r.status === 'AVAILABLE' ? 'Đang trống' : 'Đang sử dụng'}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <div className={sharedStyles.sectionDivider} />

            <div className={sharedStyles.formGrid3}>
                <Field label="Mã hợp đồng" hint="Hệ thống tự sinh sau khi lưu">
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={state.contractCode || ''}
                        readOnly
                        placeholder="Sẽ được tạo tự động"
                    />
                </Field>

                <Field label="Trạng thái hệ thống">
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={statusText}
                        readOnly
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
                        Phòng hiện đang <strong>{selectedRoom.status === 'AVAILABLE' ? 'trống' : 'được sử dụng'}</strong>.
                    </div>
                </div>
            )}
        </SectionCard>
    );
}
