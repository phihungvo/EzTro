import SectionCard from '../SectionCard/SectionCard';
import { Field } from '../shared/FormFields';
import sharedStyles from '../shared/FormFields.module.scss';
import styles from './TenantSection.module.scss';

export default function TenantSection({
                                          state, patch,
                                          availableTenants,
                                          loadingTenants,
                                          extraRows, onAddExtra, onRemoveExtra, onPatchExtra, isEditMode,
                                          onSelectTenant,
                                          onTenantModeChange,
                                      }) {
    const isUsingExistingTenant = !isEditMode && state.tenantMode === 'EXISTING';
    const isCreateTenantMode = !isEditMode && state.tenantMode === 'NEW';
    const isTenantReadOnly = isEditMode || isUsingExistingTenant;
    const hasAvailableTenants = availableTenants.length > 0;

    return (
        <SectionCard
            icon="👤"
            iconColor="gold"
            title="Thông tin người thuê"
            desc={isEditMode
                ? "Thông tin người thuê chỉ xem tại màn cập nhật hợp đồng"
                : "Ưu tiên chọn người thuê đã có sẵn của tài khoản hiện tại, chỉ tạo mới khi cần"}
        >
            {!isEditMode && (
                <div className={styles.modeSwitch}>
                    <button
                        type="button"
                        className={`${styles.modeButton} ${isUsingExistingTenant ? styles.active : ''}`}
                        onClick={() => onTenantModeChange('EXISTING')}
                        disabled={!hasAvailableTenants}
                    >
                        Chọn người thuê có sẵn
                    </button>

                    <button
                        type="button"
                        className={`${styles.modeButton} ${isCreateTenantMode ? styles.active : ''}`}
                        onClick={() => onTenantModeChange('NEW')}
                    >
                        Tạo người thuê mới
                    </button>
                </div>
            )}

            {!isEditMode && isUsingExistingTenant && (
                <div className={styles.selectionCard}>
                    <Field
                        label="Danh sách người thuê"
                        required
                        hint={loadingTenants
                            ? 'Đang tải danh sách người thuê...'
                            : 'Danh sách đang ưu tiên các tenant thuộc chủ trọ hiện tại và chưa có hợp đồng hiệu lực'}
                    >
                        <select
                            className={sharedStyles.select}
                            value={state.tenantId}
                            onChange={(e) => onSelectTenant(e.target.value)}
                            disabled={loadingTenants || !hasAvailableTenants}
                        >
                            <option value="">Chọn người thuê đã có sẵn</option>
                            {availableTenants.map((tenant) => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.fullName} - {tenant.phoneNumber || 'Chưa có SĐT'} - {tenant.identityNumber || 'Chưa có CCCD'}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {!hasAvailableTenants && !loadingTenants && (
                        <div className={styles.selectionHint}>
                            Chưa có người thuê phù hợp để dùng lại. Bạn có thể chuyển sang tạo người thuê mới.
                        </div>
                    )}
                </div>
            )}

            <div className={styles.tenantList}>
                <div className={styles.tenantRow}>
                    <div className={styles.tenantBadge}>Người đại diện</div>

                    <Field label="Họ và tên" required>
                        <input
                            className={sharedStyles.input}
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={state.tenantFullName}
                            readOnly={isTenantReadOnly}
                            onChange={(e) => patch({ tenantFullName: e.target.value })}
                        />
                    </Field>

                    <Field label="Số điện thoại" required>
                        <input
                            className={sharedStyles.input}
                            type="tel"
                            placeholder="0901 234 567"
                            value={state.tenantPhoneNumber}
                            readOnly={isTenantReadOnly}
                            onChange={(e) => patch({ tenantPhoneNumber: e.target.value })}
                        />
                    </Field>

                    <Field label="CCCD / CMT" required>
                        <input
                            className={sharedStyles.input}
                            type="text"
                            placeholder="012345678910"
                            value={state.tenantIdentityNumber}
                            readOnly={isTenantReadOnly}
                            onChange={(e) => patch({ tenantIdentityNumber: e.target.value })}
                        />
                    </Field>

                    <Field label="Ngày sinh">
                        <input
                            className={sharedStyles.input}
                            type="date"
                            value={state.tenantDateOfBirth}
                            readOnly={isTenantReadOnly}
                            disabled={isTenantReadOnly}
                            onChange={(e) => patch({ tenantDateOfBirth: e.target.value })}
                        />
                    </Field>

                    <div />
                </div>

                {isCreateTenantMode && extraRows.map((row, idx) => (
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

            {isCreateTenantMode && (
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
                        readOnly={isTenantReadOnly}
                        onChange={(e) => patch({ tenantEmail: e.target.value })}
                        placeholder="email@example.com"
                    />
                </Field>
                <Field
                    label="Mật khẩu đăng nhập"
                    required={isCreateTenantMode}
                    hint={isEditMode
                        ? "Không chỉnh sửa từ màn cập nhật hợp đồng"
                        : isUsingExistingTenant
                            ? "Người thuê đã có tài khoản, không cần nhập lại mật khẩu"
                            : null}
                >
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={state.tenantPassword}
                        readOnly={isTenantReadOnly}
                        disabled={isTenantReadOnly}
                        onChange={(e) => patch({ tenantPassword: e.target.value })}
                        placeholder={isEditMode
                            ? 'Chỉnh sửa tại màn người thuê nếu cần đổi mật khẩu'
                            : isUsingExistingTenant
                                ? 'Đang dùng lại tài khoản người thuê đã có'
                                : 'Tối thiểu 6 ký tự'}
                    />
                </Field>
                <Field label="Nghề nghiệp">
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={state.tenantOccupation}
                        readOnly={isTenantReadOnly}
                        onChange={(e) => patch({ tenantOccupation: e.target.value })}
                        placeholder="Nhân viên văn phòng"
                    />
                </Field>
            </div>
        </SectionCard>
    );
}
