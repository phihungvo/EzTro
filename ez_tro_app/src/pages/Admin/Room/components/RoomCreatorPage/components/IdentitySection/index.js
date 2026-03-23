import SectionCard from '~/pages/Admin/Contract/components/SectionCard/SectionCard';
import {Field} from '~/pages/Admin/Contract/components/shared/FormFields';
import sharedStyles from '~/pages/Admin/Contract/components/shared/FormFields.module.scss';
import styles from './IdentitySection.module.scss';

export default function IdentitySection({
                                            state,
                                            patch,
                                            boardingHouses,
                                            buildings,
                                            loadingContext,
                                            selectedBuilding,
                                            isEditMode,
                                        }) {
    return (
        <SectionCard
            icon="01"
            iconColor="blue"
            title="Vi trí và định danh"
            desc="Khai báo đúng khu trọ, tòa nhà và mã phòng để đồng bộ hợp đồng, tài sản và hóa đơn."
        >
            <div className={sharedStyles.formGrid3}>
                <Field label="Khu nhà trọ" required>
                    <select
                        className={sharedStyles.select}
                        value={state.boardingHouseId}
                        onChange={(e) => patch({boardingHouseId: e.target.value, buildingId: ''})}
                        disabled={isEditMode}
                    >
                        <option value="">Chọn khu nhà trọ</option>
                        {boardingHouses.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Toà nhà" required>
                    <select
                        className={sharedStyles.select}
                        value={state.buildingId}
                        onChange={(e) => patch({buildingId: e.target.value})}
                        disabled={loadingContext || isEditMode}
                    >
                        <option value="">{loadingContext ? 'Đang tải toà nhà...' : 'Chọn toà nhà'}</option>
                        {buildings.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Số phòng" hint="Bỏ trống nếu muốn hệ thống tự tăng theo toà">
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={state.roomNumber}
                        onChange={(e) => patch({roomNumber: e.target.value})}
                        placeholder="Ví dụ: 203 hoặc P3-02"
                    />
                </Field>
            </div>

            <div className={styles.contextStrip}>
                <div className={`${styles.contextCard} ${styles.teal}`}>
                    <span>Tầng tối đa theo toà nhà</span>
                    <strong>{selectedBuilding?.totalFloors || 'Chưa cấu hình'}</strong>
                </div>
                <div className={`${styles.contextCard} ${styles.amber}`}>
                    <span>Sức chứa gợi ý</span>
                    <strong>{selectedBuilding?.totalFloors ? 'Rà soát theo diện tích thực tế' : 'Chủ trọ tự khai báo.'}</strong>
                </div>
                <div className={`${styles.contextCard} ${styles.violet}`}>
                    <span>Lưu ý nghiệp vụ</span>
                    <strong>{isEditMode ? 'Không đổi khu và tòa để tránh lệch lịch sử' : 'Tạo đúng vị trí ngay từ đầu.'}</strong>
                </div>
            </div>
        </SectionCard>
    );
}
