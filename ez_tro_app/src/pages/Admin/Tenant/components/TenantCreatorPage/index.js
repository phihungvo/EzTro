import React from 'react';
import styles from './TenantCreatorPage.module.scss';
import s from '../shared.module.scss';
import TenantInfoSection from '~/pages/Admin/Tenant/components/TenantInfoSection';
import AvatarSection from '~/pages/Admin/Tenant/components/AvatarSection';
import AdvancedSection from '~/pages/Admin/Tenant/components/AdvancedSection';
import ActionBar from '~/pages/Admin/Tenant/components/ActionBar';
import {useTenantCreatorPage} from './useTenantCreatorPage';

export default function TenantCreatorPage() {
    const {
        avatarUrl,
        tenantType,
        referralSource,
        tenant,
        extraRows,
        settings,
        tags,
        note,
        errors,
        boardingHouses,
        buildings,
        boardingHouseId,
        buildingId,
        loadingMeta,
        loadingTenant,
        submitting,
        patchTenant,
        addExtra,
        removeExtra,
        patchExtra,
        onSetting,
        toggleTag,
        setTenantType,
        setReferralSource,
        setNote,
        setBoardingHouseId,
        setBuildingId,
        handleAvatarChange,
        handleDraft,
        handleSubmit,
        handleBack,
        isEditMode,
    } = useTenantCreatorPage();

    if (loadingTenant) {
        return <div className={styles.page}>Đang tải thông tin người thuê...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.pageWrap}>
                <div className={styles.progressHeader}>
                    <div>
                        <div className={styles.progressTitle}>{isEditMode ? 'Cập nhật người thuê' : 'Thêm mới người thuê'}</div>
                        <div className={styles.progressSub}>
                            {isEditMode
                                ? 'Chỉnh sửa các trường tenant đang được backend hỗ trợ cập nhật'
                                : 'Tạo người thuê mới với đúng các trường backend hiện đang hỗ trợ'}
                        </div>
                    </div>
                    <div className={styles.progressMeta}>
                        <span className={styles.progressPct}><b>Thông tin tenant</b></span>
                        <div className={styles.progressTrack}>
                            <div className={`${styles.progressSeg} ${styles.fillDone}`}/>
                            <div className={`${styles.progressSeg} ${styles.fillDone}`}/>
                            <div className={`${styles.progressSeg} ${styles.fill}`}/>
                            <div className={styles.progressSeg}/>
                            <div className={styles.progressSeg}/>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.orange}`}>🏠</div>
                        <div className={styles.cardTitleWrap}>
                            <div className={styles.cardTitle}>{isEditMode ? 'Thông tin tài khoản' : 'Thông tin tạo tenant'}</div>
                            <div className={styles.cardSubtitle}>
                                {isEditMode
                                    ? 'Cập nhật thông tin đăng nhập và liên hệ mở rộng'
                                    : 'Chọn khu nhà trọ, toà nhà và thông tin tài khoản trước khi tạo'}
                            </div>
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={`${s.grid} ${s.g3}`}>
                            {!isEditMode && (
                                <>
                                    <div className={s.formGroup}>
                                        <label className={s.formLabel}>Khu nhà trọ <span className={s.req}>*</span></label>
                                        <select
                                            className={`${s.formControl} ${errors.boardingHouseId ? s.error : ''}`}
                                            value={boardingHouseId}
                                            onChange={(e) => setBoardingHouseId(e.target.value)}
                                            disabled={loadingMeta}
                                        >
                                            <option value="">-- Chọn khu nhà trọ --</option>
                                            {boardingHouses.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={s.formGroup}>
                                        <label className={s.formLabel}>Toà nhà <span className={s.req}>*</span></label>
                                        <select
                                            className={`${s.formControl} ${errors.buildingId ? s.error : ''}`}
                                            value={buildingId}
                                            onChange={(e) => setBuildingId(e.target.value)}
                                            disabled={!boardingHouseId || loadingMeta || buildings.length === 0}
                                        >
                                            <option value="">-- Chọn toà nhà --</option>
                                            {buildings.map((building) => (
                                                <option key={building.id} value={building.id}>
                                                    {building.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className={s.formGroup}>
                                <label className={s.formLabel}>
                                    Mật khẩu đăng nhập {!isEditMode && <span className={s.req}>*</span>}
                                </label>
                                <input
                                    type="password"
                                    className={`${s.formControl} ${errors.password ? s.error : ''}`}
                                    placeholder={isEditMode ? 'Để trống nếu không đổi mật khẩu' : 'Tạo mật khẩu cho tenant'}
                                    value={tenant.password}
                                    onChange={(e) => patchTenant({password: e.target.value})}
                                />
                            </div>

                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Nghề nghiệp</label>
                                <input
                                    className={s.formControl}
                                    placeholder="Sinh viên, nhân viên văn phòng..."
                                    value={tenant.occupation}
                                    onChange={(e) => patchTenant({occupation: e.target.value})}
                                />
                            </div>

                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Người liên hệ khẩn cấp</label>
                                <input
                                    className={s.formControl}
                                    placeholder="Tên người liên hệ"
                                    value={tenant.emergencyContact}
                                    onChange={(e) => patchTenant({emergencyContact: e.target.value})}
                                />
                            </div>

                            <div className={s.formGroup}>
                                <label className={s.formLabel}>SĐT khẩn cấp</label>
                                <input
                                    className={s.formControl}
                                    placeholder="09xx xxx xxx"
                                    value={tenant.emergencyPhone}
                                    onChange={(e) => patchTenant({emergencyPhone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.blue}`}>👤</div>
                        <div className={styles.cardTitleWrap}>
                            <div className={styles.cardTitle}>Ảnh đại diện &amp; Phân loại</div>
                            <div className={styles.cardSubtitle}>Thông tin hiển thị ban đầu</div>
                        </div>
                        <div className={styles.cardBadge}>
                            <span className={styles.dot}/>{isEditMode ? 'Chế độ chỉnh sửa' : 'Bản tạo mới'}
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        <AvatarSection
                            avatarInitials="NT"
                            avatarUrl={avatarUrl}
                            onAvatarChange={handleAvatarChange}
                            tenantType={tenantType}
                            onTenantType={setTenantType}
                            referralSource={referralSource}
                            onReferralSource={setReferralSource}
                        />
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.blue}`}>🪪</div>
                        <div className={styles.cardTitleWrap}>
                            <div className={styles.cardTitle}>Thông tin người đại diện</div>
                            <div className={styles.cardSubtitle}>Chỉ submit các field backend hiện đang lưu</div>
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        <TenantInfoSection
                            state={tenant}
                            patch={patchTenant}
                            extraRows={extraRows}
                            onAddExtra={addExtra}
                            onRemoveExtra={removeExtra}
                            onPatchExtra={patchExtra}
                            errors={errors}
                            showExtraMembers={false}
                        />
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.cardIcon} ${styles.purple}`}>⚙️</div>
                        <div className={styles.cardTitleWrap}>
                            <div className={styles.cardTitle}>Ghi chú nội bộ</div>
                            <div className={styles.cardSubtitle}>Các tuỳ chọn khác hiện chỉ lưu ghi chú</div>
                        </div>
                    </div>
                    <div className={styles.cardBody}>
                        <AdvancedSection
                            settings={settings}
                            onSetting={onSetting}
                            tags={tags}
                            onToggleTag={toggleTag}
                            note={note}
                            onNote={setNote}
                        />
                    </div>
                </div>
            </div>

            <ActionBar
                onBack={handleBack}
                onDraft={handleDraft}
                onNext={handleSubmit}
                submitting={submitting}
                primaryLabel={isEditMode ? 'Cập nhật người thuê' : 'Tạo người thuê'}
                autoSaveAt={new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
            />
        </div>
    );
}
