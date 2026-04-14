import { useRef } from 'react';
import cs from './AvatarSection.module.scss';

/**
 * AvatarSection
 * Card đầu tiên: upload ảnh đại diện + chọn loại khách + nguồn giới thiệu
 *
 * Props:
 *  avatarInitials  string   - chữ viết tắt hiển thị khi chưa có ảnh ("NV")
 *  avatarUrl       string   - data URL ảnh preview (hoặc null)
 *  onAvatarChange  fn(file) - gọi khi người dùng chọn ảnh
 *  tenantType      string   - loại đang chọn ('individual' | 'family' | 'company' | 'student')
 *  onTenantType    fn(type) - callback khi chọn loại
 *  referralSource  string   - giá trị select nguồn giới thiệu
 *  onReferralSource fn(val) - callback
 */
export default function AvatarSection({
                                          avatarInitials = 'NV',
                                          avatarUrl,
                                          onAvatarChange,
                                          tenantType,
                                          onTenantType,
                                          referralSource,
                                          onReferralSource,
                                      }) {
    const fileRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (file) onAvatarChange?.(file);
    };

    return (
        <>
            {/* ── Avatar upload ── */}
            <div className={cs.avatarSection}>
                <div
                    className={cs.avatarPreview}
                    style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                    onClick={() => fileRef.current?.click()}
                >
                    {!avatarUrl && avatarInitials}
                    <div className={cs.avatarOverlay}>📷</div>
                </div>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFile}
                />

                <div className={cs.avatarInfo}>
                    <h4>Ảnh đại diện người đại diện</h4>
                    <p>PNG, JPG dưới 5MB. Giúp nhận dạng nhanh khi cần</p>
                </div>

                <button className={cs.btnAvatar} onClick={() => fileRef.current?.click()}>
                    📎 Tải ảnh lên
                </button>
            </div>
        </>
    );
}
