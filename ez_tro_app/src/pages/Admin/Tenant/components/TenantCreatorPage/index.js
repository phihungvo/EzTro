import {useState, useCallback, useEffect} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {message} from 'antd';

import styles from './TenantCreatorPage.module.scss';
import s from '../shared.module.scss';
import TenantInfoSection from "~/pages/Admin/Tenant/components/TenantInfoSection";
import AvatarSection from "~/pages/Admin/Tenant/components/AvatarSection";
import AdvancedSection from "~/pages/Admin/Tenant/components/AdvancedSection";
import ActionBar from "~/pages/Admin/Tenant/components/ActionBar";
import {createTenant, tenantDetail, updateTenant} from '~/service/admin/tenant';
import {getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';
import {getByBoardingHouse} from '~/service/admin/building';

let _uid = 100;
const nextId = () => ++_uid;

const INITIAL_TENANT = {
    fullname: '',
    gender: '',
    dob: '',
    phone: '',
    zalo: '',
    email: '',
    password: '',
    idType: 'cccd',
    idNumber: '',
    idIssuedDate: '',
    idIssuedBy: '',
    taxCode: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    occupation: '',
    emergencyContact: '',
    emergencyPhone: '',
    frontPhoto: null,
    backPhoto: null,
};

const INITIAL_SETTINGS = {
    notifyZalo: true,
    otpConfirm: false,
    viewInvoiceOnline: true,
    requireDeposit: true,
};

const defaultExtraRow = () => ({
    id: nextId(), name: '', gender: '', dob: '',
    phone: '', idCard: '', relation: 'Bạn bè', occupation: '',
});

function showToast(msg, type = 'success') {
    message[type](msg);
}

function mapGender(value) {
    if (!value) {
        return null;
    }

    const genderMap = {
        male: 'MALE',
        female: 'FEMALE',
        other: 'OTHER',
    };

    return genderMap[value] || null;
}

function buildPermanentAddress(tenant) {
    return [
        tenant.address?.trim(),
        tenant.ward?.trim(),
        tenant.district?.trim(),
        tenant.province?.trim(),
    ]
        .filter(Boolean)
        .join(', ');
}

export default function TenantCreatorPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/admin') ? '/admin/tenants' : '/owner/tenants';
    const isEditMode = Boolean(id);

    const [avatarUrl, setAvatarUrl] = useState(null);
    const [tenantType, setTenantType] = useState('individual');
    const [referralSource, setReferralSource] = useState('');
    const [tenant, setTenant] = useState(INITIAL_TENANT);
    const [extraRows, setExtraRows] = useState([defaultExtraRow()]);
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [tags, setTags] = useState(new Set(['Sinh viên']));
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState({});
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [boardingHouseId, setBoardingHouseId] = useState('');
    const [buildingId, setBuildingId] = useState('');
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [loadingTenant, setLoadingTenant] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const patchTenant = useCallback(
        (updates) => setTenant((prev) => ({...prev, ...updates})),
        [],
    );

    const addExtra = () => setExtraRows((prev) => [...prev, defaultExtraRow()]);
    const removeExtra = (id) => setExtraRows((prev) => prev.filter((row) => row.id !== id));
    const patchExtra = (id, field, value) =>
        setExtraRows((prev) => prev.map((row) => (row.id === id ? {...row, [field]: value} : row)));
    const onSetting = (key, val) => setSettings((prev) => ({...prev, [key]: val}));
    const toggleTag = (tag) => setTags((prev) => {
        const next = new Set(prev);
        next.has(tag) ? next.delete(tag) : next.add(tag);
        return next;
    });

    useEffect(() => {
        if (isEditMode) {
            return;
        }

        const loadBoardingHouses = async () => {
            setLoadingMeta(true);
            try {
                const response = await getAllBoardingHousesNoPaged();
                setBoardingHouses(response || []);
            } finally {
                setLoadingMeta(false);
            }
        };

        loadBoardingHouses();
    }, [isEditMode]);

    useEffect(() => {
        if (isEditMode) {
            return;
        }

        const loadBuildings = async () => {
            if (!boardingHouseId) {
                setBuildings([]);
                setBuildingId('');
                return;
            }

            setLoadingMeta(true);
            try {
                const response = await getByBoardingHouse(boardingHouseId);
                setBuildings(response || []);
                setBuildingId('');
            } finally {
                setLoadingMeta(false);
            }
        };

        loadBuildings();
    }, [boardingHouseId, isEditMode]);

    useEffect(() => {
        if (!isEditMode || !id) {
            return;
        }

        const loadTenant = async () => {
            setLoadingTenant(true);
            try {
                const data = await tenantDetail(id);
                if (!data) {
                    return;
                }

                patchTenant({
                    fullname: data.fullName || '',
                    gender: data.gender ? data.gender.toLowerCase() : '',
                    dob: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : '',
                    phone: data.phoneNumber || '',
                    zalo: '',
                    email: data.email || '',
                    password: '',
                    idNumber: data.identityNumber || '',
                    idIssuedDate: data.issueDate ? new Date(data.issueDate).toISOString().slice(0, 10) : '',
                    idIssuedBy: data.issuePlace || '',
                    address: data.permanentAddress || '',
                    occupation: data.occupation || '',
                    emergencyContact: data.emergencyContact || '',
                    emergencyPhone: data.emergencyPhone || '',
                });
                setNote(data.note || '');
            } catch (error) {
                message.error(error.response?.data?.message || 'Lỗi khi tải thông tin người thuê');
                navigate(basePath);
            } finally {
                setLoadingTenant(false);
            }
        };

        loadTenant();
    }, [basePath, id, isEditMode, navigate, patchTenant]);

    const handleAvatarChange = (file) => {
        setAvatarUrl(URL.createObjectURL(file));
    };

    const validate = () => {
        const nextErrors = {};

        if (!isEditMode && !boardingHouseId) nextErrors.boardingHouseId = true;
        if (!isEditMode && !buildingId) nextErrors.buildingId = true;
        if (!tenant.fullname.trim()) nextErrors.fullname = true;
        if (!tenant.phone.trim()) nextErrors.phone = true;
        if (!tenant.email.trim()) nextErrors.email = true;
        if (!isEditMode && !tenant.password.trim()) nextErrors.password = true;
        if (!tenant.idNumber.trim()) nextErrors.idNumber = true;

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildPayload = () => ({
        fullName: tenant.fullname.trim(),
        phoneNumber: tenant.phone.trim(),
        email: tenant.email.trim(),
        ...(tenant.password.trim() ? {password: tenant.password.trim()} : {}),
        identityNumber: tenant.idNumber.trim(),
        issueDate: tenant.idIssuedDate || null,
        issuePlace: tenant.idIssuedBy?.trim() || null,
        dateOfBirth: tenant.dob || null,
        gender: mapGender(tenant.gender),
        occupation: tenant.occupation?.trim() || null,
        permanentAddress: buildPermanentAddress(tenant) || null,
        emergencyContact: tenant.emergencyContact?.trim() || null,
        emergencyPhone: tenant.emergencyPhone?.trim() || null,
        note: note?.trim() || null,
        ...(!isEditMode ? {
            boardingHouseId: Number(boardingHouseId),
            buildingId: Number(buildingId),
        } : {}),
    });

    const handleDraft = () => {
        showToast('Đã lưu bản nháp cục bộ.', 'success');
    };

    const handleSubmit = async () => {
        if (!validate()) {
            showToast(`Vui lòng nhập đủ các trường bắt buộc trước khi ${isEditMode ? 'cập nhật' : 'tạo'} người thuê.`, 'error');
            return;
        }

        setSubmitting(true);
        try {
            if (isEditMode) {
                await updateTenant(id, buildPayload());
                showToast('Cập nhật người thuê thành công.', 'success');
                navigate(`${basePath}/${id}`);
            } else {
                await createTenant(buildPayload());
                showToast('Tạo người thuê thành công.', 'success');
                navigate(basePath);
            }
        } catch (error) {
            // Service layer already displays the API error message.
        } finally {
            setSubmitting(false);
        }
    };

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
                onBack={() => navigate(isEditMode ? `${basePath}/${id}` : basePath)}
                onDraft={handleDraft}
                onNext={handleSubmit}
                submitting={submitting}
                primaryLabel={isEditMode ? 'Cập nhật người thuê' : 'Tạo người thuê'}
                autoSaveAt={new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
            />
        </div>
    );
}
