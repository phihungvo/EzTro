import React from 'react';
import classNames from 'classnames/bind';
import styles from './RoomCard.module.scss';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

// ─── HELPERS ───────────────────────────────────────────────

const formatCurrency = (n) =>
    n != null ? new Intl.NumberFormat('vi-VN').format(n) : '—';

const formatDate = (ts) => {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: '2-digit',
    });
};

/** Chuyển remainingDays → { label, cls }
 *  remainingDays: ngày còn lại tính từ server
 *    > 0  → còn hiệu lực
 *    <= 0 → đã hết / quá hạn
 */
const contractInfo = (days) => {
    if (days == null) return null;
    if (days < 0)   return { label: 'Hết HĐ',        cls: 'expired' };
    if (days <= 30) return { label: `${days} ngày`,   cls: 'warning' };
    const months = Math.round(days / 30);
    return { label: `${months} tháng`,  cls: 'good' };
};

/** Màu avatar tự động theo ký tự đầu */
const AVATAR_PALETTE = [
    '#1565c0','#6a1b9a','#00695c','#c62828',
    '#e65100','#2e7d32','#4527a0','#00838f',
    '#37474f','#4e342e','#283593','#558b2f',
];
const avatarColor = (name = '') =>
    name ? AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length] : '#374151';

const avatarLetter = (name = '') => name?.trim()?.[0]?.toUpperCase() ?? '?';

// ─── STATUS META ───────────────────────────────────────────
const STATUS = {
    OCCUPIED:    { label: 'Đang Thuê' },
    AVAILABLE:   { label: 'Còn Trống' },
    MAINTENANCE: { label: 'Bảo Trì'   },
};
const getStatus = (s) => STATUS[s?.toUpperCase()] ?? { label: s ?? 'Không rõ' };

// ─── SUB-COMPONENTS ────────────────────────────────────────

function StatusBadge({ status }) {
    const meta = getStatus(status);
    return (
        <span className={cx('statusBadge')} data-status={status}>
            <span className={cx('statusDot')} />
            {meta.label}
        </span>
    );
}

function Chip({ icon, label, value }) {
    return (
        <div className={cx('chip')}>
            <span className={cx('chipIcon')}>{icon}</span>
            <span>{label}</span>
            <span className={cx('chipVal')}>{value}</span>
        </div>
    );
}

function AmenityPill({ icon, label, active }) {
    return (
        <span className={cx('pill', { on: active })}>
            <span>{icon}</span>
            {label}
        </span>
    );
}

function TenantSection({ tenantName, tenantPhone, remainingDays, startDate, endDate }) {
    const hasTenant = !!tenantName;
    const contract  = contractInfo(remainingDays);

    if (!hasTenant) {
        return <div className={cx('emptyTenant')}>🔑 Chưa có người thuê</div>;
    }

    return (
        <>
            <div className={cx('tenantRow')}>
                {/* Avatar */}
                <div
                    className={cx('avatar')}
                    style={{ background: avatarColor(tenantName) }}
                >
                    {avatarLetter(tenantName)}
                </div>

                {/* Info */}
                <div className={cx('tenantInfo')}>
                    <div className={cx('tenantName')}>{tenantName}</div>
                    {tenantPhone && (
                        <div className={cx('tenantPhone')}>📱 {tenantPhone}</div>
                    )}
                </div>

                {/* Contract days */}
                {contract && (
                    <div className={cx('contractBadge')}>
                        <span className={cx('contractDays', contract.cls)}>
                            {contract.label}
                        </span>
                        <span className={cx('contractLabel')}>
                            {remainingDays < 0 ? 'quá hạn' : 'còn lại'}
                        </span>
                    </div>
                )}
            </div>

            {/* Contract period */}
            {(startDate || endDate) && (
                <div className={cx('periodBar')}>
                    <span>📋 Hợp đồng</span>
                    <div className={cx('periodDates')}>
                        <span className={cx('date')}>{formatDate(startDate) ?? '—'}</span>
                        <span className={cx('arrow')}>→</span>
                        <span className={cx('date')}>{formatDate(endDate) ?? '—'}</span>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── MAIN COMPONENT ────────────────────────────────────────

/**
 * RoomCard — hiển thị thông tin phòng từ API
 *
 * room shape (từ API):
 *   id, roomNumber, area, price, status,
 *   boardingHouseName, buildingName, floorNumber,
 *   maxOccupants, hasAirConditioner, hasBathroom, hasKitchen,
 *   tenantName, tenantPhone,
 *   startDate (timestamp ms), endDate (timestamp ms),
 *   remainingDays
 *
 * callbacks: onView, onEdit, onDelete
 */
const RoomCard = ({ room, onView, onEdit, onDelete }) => {
    const {
        roomNumber,
        area,
        price,
        status,
        boardingHouseName,
        buildingName,
        floorNumber,
        maxOccupants,
        hasAirConditioner,
        hasBathroom,
        hasKitchen,
        tenantName,
        tenantPhone,
        startDate,
        endDate,
        remainingDays,
    } = room;

    const statusKey = status?.toUpperCase() ?? 'AVAILABLE';

    // Tiện nghi — chỉ hiển thị khi có dữ liệu (không null)
    const amenities = [
        { icon: '❄️', label: 'Điều hoà',  val: hasAirConditioner },
        { icon: '🚿', label: 'Toilet',    val: hasBathroom },
        { icon: '🍳', label: 'Bếp',       val: hasKitchen },
    ].filter(a => a.val !== null && a.val !== undefined);

    return (
        <div
            className={cx('card')}
            data-status={statusKey}
            role="button"
            tabIndex={0}
        >
            {/* ── HEADER ── */}
            <div className={cx('header')}>
                <div className={cx('headerLeft')}>
                    <div className={cx('roomMeta')}>
                        <span className={cx('roomNumber')}>{roomNumber}</span>
                        {buildingName && (
                            <span className={cx('buildingTag')}>{buildingName}</span>
                        )}
                    </div>
                    {boardingHouseName && (
                        <div className={cx('boardingHouse')}>🏠 {boardingHouseName}</div>
                    )}
                </div>
                <StatusBadge status={statusKey} />
            </div>

            {/* ── BODY ── */}
            <div className={cx('body')}>

                {/* Chips: diện tích / sức chứa / tầng */}
                <div className={cx('chipRow')}>
                    {area != null && (
                        <Chip icon="📐" label="Diện tích" value={`${area} m²`} />
                    )}
                    {maxOccupants != null && (
                        <Chip icon="👥" label="Tối đa" value={`${maxOccupants} người`} />
                    )}
                    {floorNumber != null && (
                        <Chip icon="🏢" label="Tầng" value={floorNumber} />
                    )}
                </div>

                {/* Tiện nghi */}
                {amenities.length > 0 && (
                    <div className={cx('amenities')}>
                        {amenities.map(a => (
                            <AmenityPill
                                key={a.label}
                                icon={a.icon}
                                label={a.label}
                                active={a.val === true}
                            />
                        ))}
                    </div>
                )}

                <div className={cx('divider')} />

                {/* Tenant */}
                <TenantSection
                    tenantName={tenantName}
                    tenantPhone={tenantPhone}
                    remainingDays={remainingDays}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>

            {/* ── FOOTER ── */}
            <div className={cx('footer')}>
                <div className={cx('priceBlock')}>
                    <span className={cx('price')}>{formatCurrency(price)}</span>
                    <span className={cx('priceUnit')}>đ/th</span>
                </div>

                <div className={cx('footerActions')}>
                    <button
                        className={cx('iconBtn', 'view')}
                        title="Xem chi tiết"
                        onClick={(e) => { e.stopPropagation(); onView?.(room); }}
                    >
                        <EyeOutlined />
                    </button>
                    <button
                        className={cx('iconBtn', 'edit')}
                        title="Chỉnh sửa"
                        onClick={(e) => { e.stopPropagation(); onEdit?.(room); }}
                    >
                        <EditOutlined />
                    </button>
                    <button
                        className={cx('iconBtn', 'delete')}
                        title="Xoá"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(room); }}
                    >
                        <DeleteOutlined />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomCard;