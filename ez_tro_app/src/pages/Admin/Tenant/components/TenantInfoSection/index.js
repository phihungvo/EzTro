import { useRef } from 'react';
import s from '../shared.module.scss';
import cs from './TenantInfoSection.module.scss';

/**
 * TenantInfoSection
 * Card thông tin người đại diện (họ tên, liên hệ, giấy tờ, địa chỉ)
 * + danh sách người ở cùng có thể thêm/xoá.
 *
 * Props:
 *  state          object   - { fullname, gender, dob, phone, zalo, email,
 *                              idType, idNumber, idIssuedDate, idIssuedBy, taxCode,
 *                              province, district, ward, address,
 *                              frontPhoto(File|null), backPhoto(File|null) }
 *  patch          fn(obj)  - cập nhật từng field
 *  extraRows      array    - [{ id, name, gender, dob, phone, idCard, relation, occupation }]
 *  onAddExtra     fn()
 *  onRemoveExtra  fn(id)
 *  onPatchExtra   fn(id, field, value)
 *  errors         object   - { fullname: bool, phone: bool, idNumber: bool }
 */
export default function TenantInfoSection({
                                              state,
                                              patch,
                                              extraRows,
                                              onAddExtra,
                                              onRemoveExtra,
                                              onPatchExtra,
                                              errors = {},
                                              showExtraMembers = true,
                                          }) {
    const frontRef = useRef(null);
    const backRef  = useRef(null);

    const handlePhotoChange = (ref, field) => (e) => {
        const file = e.target.files?.[0];
        if (file) patch({ [field]: file });
    };

    const ID_LABEL_MAP = {
        cccd:     'Số CCCD / CMT',
        passport: 'Số hộ chiếu',
        other:    'Số giấy tờ',
    };

    return (
        <div>
            {/* ── Người đại diện ── */}
            <div className={s.personBlock}>
                <div className={s.personHeader}>
                    <span className={`${s.personTag} ${s.main}`}>👑 Người đại diện</span>
                    <span className={cs.personHeaderNote}>Ký hợp đồng &amp; thanh toán</span>
                </div>

                <div className={s.personBody}>
                    {/* Họ tên / Giới tính / Ngày sinh */}
                    <div className={`${s.grid} ${s.g4}`} style={{ marginBottom: 14 }}>
                        <div className={s.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label className={s.formLabel}>Họ và tên <span className={s.req}>*</span></label>
                            <div className={s.inputWithIcon}>
                                <input
                                    className={`${s.formControl} ${errors.fullname ? s.error : ''}`}
                                    placeholder="Nguyễn Văn A"
                                    value={state.fullname}
                                    onChange={(e) => patch({ fullname: e.target.value })}
                                />
                                <span className={s.inputIcon}>✏️</span>
                            </div>
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Giới tính <span className={s.req}>*</span></label>
                            <select
                                className={s.formControl}
                                value={state.gender}
                                onChange={(e) => patch({ gender: e.target.value })}
                            >
                                <option value="">— Chọn —</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Ngày sinh</label>
                            <input
                                type="date"
                                className={s.formControl}
                                value={state.dob}
                                onChange={(e) => patch({ dob: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Liên hệ */}
                    <Divider label="Liên hệ" />
                    <div className={`${s.grid} ${s.g3}`} style={{ marginBottom: 14 }}>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Số điện thoại <span className={s.req}>*</span></label>
                            <div className={s.inputWithIcon}>
                                <input
                                    className={`${s.formControl} ${errors.phone ? s.error : ''}`}
                                    placeholder="09xx xxx xxx"
                                    value={state.phone}
                                    onChange={(e) => patch({ phone: e.target.value })}
                                />
                                <span className={s.inputIcon}>📱</span>
                            </div>
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Zalo</label>
                            <input
                                className={s.formControl}
                                placeholder="Số Zalo (nếu khác SĐT)"
                                value={state.zalo}
                                onChange={(e) => patch({ zalo: e.target.value })}
                            />
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Email</label>
                            <div className={s.inputWithIcon}>
                                <input
                                    type="email"
                                    className={s.formControl}
                                    placeholder="example@email.com"
                                    value={state.email}
                                    onChange={(e) => patch({ email: e.target.value })}
                                />
                                <span className={s.inputIcon}>📧</span>
                            </div>
                        </div>
                    </div>

                    {/* Giấy tờ tuỳ thân */}
                    <Divider label="Giấy tờ tùy thân" />
                    <div className={`${s.grid} ${s.g3}`} style={{ marginBottom: 14 }}>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Loại giấy tờ <span className={s.req}>*</span></label>
                            <select
                                className={s.formControl}
                                value={state.idType}
                                onChange={(e) => patch({ idType: e.target.value })}
                            >
                                <option value="cccd">CCCD / CMND</option>
                                <option value="passport">Hộ chiếu</option>
                                <option value="other">Giấy tờ khác</option>
                            </select>
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>
                                {ID_LABEL_MAP[state.idType] || 'Số giấy tờ'} <span className={s.req}>*</span>
                            </label>
                            <input
                                className={`${s.formControl} ${errors.idNumber ? s.error : ''}`}
                                placeholder="012345678910"
                                value={state.idNumber}
                                onChange={(e) => patch({ idNumber: e.target.value })}
                            />
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Ngày cấp</label>
                            <input
                                type="date"
                                className={s.formControl}
                                value={state.idIssuedDate}
                                onChange={(e) => patch({ idIssuedDate: e.target.value })}
                            />
                        </div>

                        <div className={s.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label className={s.formLabel}>Nơi cấp</label>
                            <input
                                className={s.formControl}
                                placeholder="Cục cảnh sát quản lý hành chính về TTXH…"
                                value={state.idIssuedBy}
                                onChange={(e) => patch({ idIssuedBy: e.target.value })}
                            />
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Mã số thuế</label>
                            <input
                                className={s.formControl}
                                placeholder="(nếu có)"
                                value={state.taxCode}
                                onChange={(e) => patch({ taxCode: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Ảnh giấy tờ */}
                    <Divider label="Ảnh giấy tờ" />
                    <div className={s.photoUploadRow}>
                        <PhotoBox
                            label="Mặt trước CCCD"
                            file={state.frontPhoto}
                            inputRef={frontRef}
                            onChange={handlePhotoChange(frontRef, 'frontPhoto')}
                        />
                        <PhotoBox
                            label="Mặt sau CCCD"
                            file={state.backPhoto}
                            inputRef={backRef}
                            onChange={handlePhotoChange(backRef, 'backPhoto')}
                        />
                    </div>

                    {/* Địa chỉ thường trú */}
                    <Divider label="Địa chỉ thường trú / Quê quán" style={{ marginTop: 14 }} />
                    <div className={`${s.grid} ${s.g3}`}>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Tỉnh / Thành phố</label>
                            <select
                                className={s.formControl}
                                value={state.province}
                                onChange={(e) => patch({ province: e.target.value })}
                            >
                                <option value="">— Chọn —</option>
                                <option>TP. Hồ Chí Minh</option>
                                <option>Hà Nội</option>
                                <option>Đà Nẵng</option>
                                <option>Bình Dương</option>
                                <option>Đồng Nai</option>
                            </select>
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Quận / Huyện</label>
                            <select className={s.formControl} value={state.district} onChange={(e) => patch({ district: e.target.value })}>
                                <option value="">— Chọn —</option>
                            </select>
                        </div>

                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Phường / Xã</label>
                            <select className={s.formControl} value={state.ward} onChange={(e) => patch({ ward: e.target.value })}>
                                <option value="">— Chọn —</option>
                            </select>
                        </div>

                        <div className={s.formGroup} style={{ gridColumn: 'span 3' }}>
                            <label className={s.formLabel}>Địa chỉ cụ thể</label>
                            <input
                                className={s.formControl}
                                placeholder="Số nhà, tên đường, tổ, ấp…"
                                value={state.address}
                                onChange={(e) => patch({ address: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showExtraMembers && (
                <>
                    {/* ── Người ở cùng ── */}
                    {extraRows.map((row, idx) => (
                        <ExtraMemberRow
                            key={row.id}
                            row={row}
                            index={idx + 1}
                            onRemove={() => onRemoveExtra(row.id)}
                            onPatch={(field, value) => onPatchExtra(row.id, field, value)}
                        />
                    ))}

                    <button className={s.btnAddMember} onClick={onAddExtra}>
                        ＋ Thêm người ở cùng
                    </button>

                    <div className={s.infoBox}>
                        <span className={s.infoIcon}>ℹ️</span>
                        <div className={s.infoText}>
                            Người ở cùng không cần đầy đủ giấy tờ như người đại diện.
                            Thông tin cơ bản (họ tên, SĐT, CCCD) là đủ để khai báo tạm trú với địa phương.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Sub-components nội bộ (không export) ─── */

function Divider({ label, style }) {
    return (
        <div className={s.sectionDivider} style={style}>
            <span className={s.sectionDividerLabel}>{label}</span>
            <span className={s.sectionDividerLine} />
        </div>
    );
}

function PhotoBox({ label, file, inputRef, onChange }) {
    const previewUrl = file ? URL.createObjectURL(file) : null;
    return (
        <div
            className={s.photoUploadBox}
            style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            onClick={() => inputRef.current?.click()}
        >
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
            {!previewUrl && (
                <>
                    <div className="icon">🪪</div>
                    <p>{label}</p>
                    <small>Click để tải ảnh</small>
                </>
            )}
        </div>
    );
}

function ExtraMemberRow({ row, index, onRemove, onPatch }) {
    return (
        <div className={s.personBlock}>
            <div className={s.personHeader}>
                <span className={`${s.personTag} ${s.member}`}>👥 Người ở cùng #{index}</span>
                <div className={s.personHeaderRight}>
                    <button className={s.btnIcon} onClick={onRemove} title="Xoá">✕</button>
                </div>
            </div>

            <div className={s.personBody}>
                <div className={`${s.grid} ${s.g4}`}>
                    <div className={s.formGroup} style={{ gridColumn: 'span 2' }}>
                        <label className={s.formLabel}>Họ và tên</label>
                        <input
                            className={s.formControl}
                            placeholder="Nguyễn Thị B"
                            value={row.name}
                            onChange={(e) => onPatch('name', e.target.value)}
                        />
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Giới tính</label>
                        <select className={s.formControl} value={row.gender} onChange={(e) => onPatch('gender', e.target.value)}>
                            <option value="">— Chọn —</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Ngày sinh</label>
                        <input type="date" className={s.formControl} value={row.dob} onChange={(e) => onPatch('dob', e.target.value)} />
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Số điện thoại</label>
                        <input className={s.formControl} placeholder="09xx xxx xxx" value={row.phone} onChange={(e) => onPatch('phone', e.target.value)} />
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Số CCCD / CMT</label>
                        <input className={s.formControl} placeholder="012345678910" value={row.idCard} onChange={(e) => onPatch('idCard', e.target.value)} />
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Mối quan hệ</label>
                        <select className={s.formControl} value={row.relation} onChange={(e) => onPatch('relation', e.target.value)}>
                            <option>Bạn bè</option>
                            <option>Vợ / Chồng</option>
                            <option>Con cái</option>
                            <option>Anh / Chị / Em</option>
                            <option>Đồng nghiệp</option>
                            <option>Khác</option>
                        </select>
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.formLabel}>Nghề nghiệp</label>
                        <input className={s.formControl} placeholder="Sinh viên, công nhân…" value={row.occupation} onChange={(e) => onPatch('occupation', e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
