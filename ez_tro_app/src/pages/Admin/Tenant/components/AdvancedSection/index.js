import s from '../shared.module.scss';

/**
 * AdvancedSection
 * Card cài đặt nâng cao: toggles, nhãn khách, ghi chú nội bộ.
 *
 * Props:
 *  settings        object  - { notifyZalo, otpConfirm, viewInvoiceOnline, requireDeposit }
 *  onSetting       fn(key, bool)
 *  tags            Set<string>
 *  onToggleTag     fn(tag)
 *  note            string
 *  onNote          fn(val)
 */

const TOGGLES = [
    {
        key: 'notifyZalo',
        label: 'Gửi thông báo hóa đơn qua Zalo',
        hint: 'Tự động nhắc nhở khi đến kỳ thanh toán',
    },
    {
        key: 'otpConfirm',
        label: 'Gửi OTP xác nhận cho khách',
        hint: 'Khách nhận mã OTP để xác nhận thông tin hợp đồng',
    },
    {
        key: 'viewInvoiceOnline',
        label: 'Cho phép khách xem hóa đơn online',
        hint: 'Khách đăng nhập App để xem & thanh toán trực tuyến',
    },
    {
        key: 'requireDeposit',
        label: 'Yêu cầu đặt cọc khi ký hợp đồng',
        hint: 'Tự động tạo phiếu thu tiền cọc bước tiếp theo',
    },
];

const TAG_LIST = ['VIP', 'Ổn định', 'Cần theo dõi', 'Mới', 'Sinh viên', 'Công nhân'];

export default function AdvancedSection({
                                            settings,
                                            onSetting,
                                            tags,
                                            onToggleTag,
                                            note,
                                            onNote,
                                        }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* ── Toggles ── */}
            {TOGGLES.map(({ key, label, hint }) => (
                <div key={key} className={s.toggleWrap}>
                    <div className={s.toggleLabel}>
                        <strong>{label}</strong>
                        <span>{hint}</span>
                    </div>
                    <label className={s.switch}>
                        <input
                            type="checkbox"
                            checked={!!settings[key]}
                            onChange={(e) => onSetting(key, e.target.checked)}
                        />
                        <span className={s.slider} />
                    </label>
                </div>
            ))}

            {/* ── Nhãn / Nhóm ── */}
            <Divider label="Nhóm khách thuê" />

            <div className={s.formGroup}>
                <label className={s.formLabel}>Gắn nhãn / Nhóm</label>
                <div className={s.chipGroup}>
                    {TAG_LIST.map((tag) => (
                        <span
                            key={tag}
                            className={`${s.chip} ${tags.has(tag) ? s.active : ''}`}
                            onClick={() => onToggleTag(tag)}
                        >
              {tag}
            </span>
                    ))}
                </div>
            </div>

            {/* ── Ghi chú ── */}
            <Divider label="Ghi chú nội bộ" />

            <div className={s.formGroup}>
                <label className={s.formLabel}>Ghi chú cho nhân viên quản lý</label>
                <textarea
                    className={s.formControl}
                    placeholder="Khách thuê có thú cưng / Hay trễ hạn / Ưu tiên gia hạn hợp đồng…"
                    rows={3}
                    value={note}
                    onChange={(e) => onNote(e.target.value)}
                />
                <span className={s.formHint}>⚠️ Chỉ chủ trọ &amp; nhân viên thấy, khách không thấy được</span>
            </div>
        </div>
    );
}

function Divider({ label }) {
    return (
        <div className={s.sectionDivider} style={{ marginTop: 4 }}>
            <span className={s.sectionDividerLabel}>{label}</span>
            <span className={s.sectionDividerLine} />
        </div>
    );
}