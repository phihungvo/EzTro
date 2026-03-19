import SectionCard from '../SectionCard/SectionCard';
import { Field } from '../shared/FormFields';
import sharedStyles from '../shared/FormFields.module.scss';
import styles from './TenantSection.module.scss';

export default function TenantSection({
                                          state, patch,
                                          extraRows, onAddExtra, onRemoveExtra, onPatchExtra,
                                      }) {
    return (
        <SectionCard
            icon="👤"
            iconColor="gold"
            title="Thông tin người thuê"
            desc="Chỉ xử lý người thuê chính khi tạo hợp đồng"
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
                            onChange={(e) => patch({ tenantFullName: e.target.value })}
                        />
                    </Field>

                    <Field label="Số điện thoại" required>
                        <input
                            className={sharedStyles.input}
                            type="tel"
                            placeholder="0901 234 567"
                            value={state.tenantPhoneNumber}
                            onChange={(e) => patch({ tenantPhoneNumber: e.target.value })}
                        />
                    </Field>

                    <Field label="CCCD / CMT" required>
                        <input
                            className={sharedStyles.input}
                            type="text"
                            placeholder="012345678910"
                            value={state.tenantIdentityNumber}
                            onChange={(e) => patch({ tenantIdentityNumber: e.target.value })}
                        />
                    </Field>

                    <Field label="Ngày sinh">
                        <input
                            className={sharedStyles.input}
                            type="date"
                            value={state.tenantDateOfBirth}
                            onChange={(e) => patch({ tenantDateOfBirth: e.target.value })}
                        />
                    </Field>

                    <div />
                </div>

                {extraRows.map((row, idx) => (
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

            <button className={styles.addTenantBtn} onClick={onAddExtra}>
                ＋ Thêm người ở cùng
            </button>

            <div className={sharedStyles.sectionDivider} />

            <div className={sharedStyles.formGrid2}>
                <Field label="Email liên hệ" required>
                    <input
                        className={sharedStyles.input}
                        type="email"
                        value={state.tenantEmail}
                        onChange={(e) => patch({ tenantEmail: e.target.value })}
                        placeholder="email@example.com"
                    />
                </Field>
                <Field label="Mật khẩu đăng nhập" required>
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={state.tenantPassword}
                        onChange={(e) => patch({ tenantPassword: e.target.value })}
                        placeholder="Tối thiểu 6 ký tự"
                    />
                </Field>
                <Field label="Nghề nghiệp">
                    <input
                        className={sharedStyles.input}
                        type="text"
                        value={state.tenantOccupation}
                        onChange={(e) => patch({ tenantOccupation: e.target.value })}
                        placeholder="Nhân viên văn phòng"
                    />
                </Field>
            </div>
        </SectionCard>
    );
}
