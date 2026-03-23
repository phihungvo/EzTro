import SectionCard from '../SectionCard/SectionCard';
import { Field } from '../shared/FormFields';
import sharedStyles from '../shared/FormFields.module.scss';
import styles from './TenantSection.module.scss';

export default function TenantSection({
                                          state, patch,
                                          extraRows, onAddExtra, onRemoveExtra, onPatchExtra, isEditMode,
                                      }) {
    return (
        <SectionCard
            icon="👤"
            iconColor="gold"
            title="Thông tin người thuê"
            desc={isEditMode ? "Thông tin người thuê chỉ xem tại màn cập nhật hợp đồng" : "Chỉ xử lý người thuê chính khi tạo hợp đồng"}
        >
            <div className={styles.tenantList}>
                <div className={styles.tenantRow}>
                    <div className={styles.tenantBadge}>Người đại diện</div>

                    <Field label="Họ và tên" required>
                        <input
                            className={sharedStyles.input}
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={state.tenantFullName}
                            readOnly={isEditMode}
                            onChange={(e) => patch({ tenantFullName: e.target.value })}
                        />
                    </Field>

                    <Field label="Số điện thoại" required>
                        <input
                            className={sharedStyles.input}
                            type="tel"
                            placeholder="0901 234 567"
                            value={state.tenantPhoneNumber}
                            readOnly={isEditMode}
                            onChange={(e) => patch({ tenantPhoneNumber: e.target.value })}
                        />
                    </Field>

                    <Field label="CCCD / CMT" required>
                        <input
                            className={sharedStyles.input}
                            type="text"
                            placeholder="012345678910"
                            value={state.tenantIdentityNumber}
                            readOnly={isEditMode}
                            onChange={(e) => patch({ tenantIdentityNumber: e.target.value })}
                        />
                    </Field>

                    <Field label="Ngày sinh">
                        <input
                            className={sharedStyles.input}
                            type="date"
                            value={state.tenantDateOfBirth}
                            readOnly={isEditMode}
                            disabled={isEditMode}
                            onChange={(e) => patch({ tenantDateOfBirth: e.target.value })}
                        />
                    </Field>

                    <div />
                </div>

                {!isEditMode && extraRows.map((row, idx) => (
                    <div key={row.id} className={styles.tenantRow}>
                        <div className={`${styles.tenantBadge} ${styles.extra}`}>
                            Người ở cùng #{idx + 1}
                        </div>

                        <Field label="Họ và tên">
                            <input
                                className={sharedStyles.input}
                                type="text"
                                placeholder="Nguyễn Văn B"
                                value={row.name}
                                onChange={(e) => onPatchExtra(row.id, 'name', e.target.value)}
                            />
                        </Field>

                        <Field label="Số điện thoại">
                            <input
                                className={sharedStyles.input}
                                type="tel"
                                placeholder="0901 234 567"
                                value={row.phone}
                                onChange={(e) => onPatchExtra(row.id, 'phone', e.target.value)}
                            />
                        </Field>

                        <Field label="CCCD / CMT">
                            <input
                                className={sharedStyles.input}
                                type="text"
                                placeholder="012345678910"
                                value={row.idCard}
                                onChange={(e) => onPatchExtra(row.id, 'idCard', e.target.value)}
                            />
                        </Field>

                        <Field label="Mối quan hệ">
                            <select
                                className={sharedStyles.select}
                                value={row.relation}
                                onChange={(e) => onPatchExtra(row.id, 'relation', e.target.value)}
                            >
                                <option>Bạn bè</option>
                                <option>Vợ/Chồng</option>
                                <option>Anh/Chị/Em</option>
                                <option>Đồng nghiệp</option>
                            </select>
                        </Field>

                        <button
                            className={sharedStyles.btnIcon}
                            onClick={() => onRemoveExtra(row.id)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {!isEditMode && (
                <button className={styles.addTenantBtn} onClick={onAddExtra}>
                    ＋ Thêm người ở cùng
                </button>
            )}

            <div className={sharedStyles.sectionDivider} />

            <div className={sharedStyles.formGrid2}>
                <Field label="Email liên hệ" required>
                    <input
                        className={sharedStyles.input}
                        type="email"
                        value={state.tenantEmail}
                        readOnly={isEditMode}
                        onChange={(e) => patch({ tenantEmail: e.target.value })}
                        placeholder="email@example.com"
                    />
                </Field>
                <Field label="Mật khẩu đăng nhập" required={!isEditMode} hint={isEditMode ? "Không chỉnh sửa từ màn cập nhật hợp đồng" : null}>
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={state.tenantPassword}
                        readOnly={isEditMode}
                        onChange={(e) => patch({ tenantPassword: e.target.value })}
                        placeholder={isEditMode ? 'Chỉnh sửa tại màn người thuê nếu cần đổi mật khẩu' : 'Tối thiểu 6 ký tự'}
                    />
                </Field>
                <Field label="Nghề nghiệp">
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={state.tenantOccupation}
                        readOnly={isEditMode}
                        onChange={(e) => patch({ tenantOccupation: e.target.value })}
                        placeholder="Nhân viên văn phòng"
                    />
                </Field>
            </div>
        </SectionCard>
    );
}
