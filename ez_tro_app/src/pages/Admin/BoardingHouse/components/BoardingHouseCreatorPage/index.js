import {useEffect, useMemo, useState} from 'react';
import {message} from 'antd';
import {
    BankOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import {useLocation, useNavigate, useParams} from 'react-router-dom';

import {createBoardingHouse, getBoardingHouseById, updateBoardingHouse} from '~/service/admin/boarding_house';
import {getAllOwners} from '~/service/admin/user';
import {useAuth} from '~/routes/AuthContext';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';
import ActionBar from '~/pages/Admin/Contract/components/ActionBar';
import StepsBar from '~/pages/Admin/Contract/components/StepsBar';
import SectionCard from '~/pages/Admin/Contract/components/SectionCard/SectionCard';

import styles from './BoardingHouseCreatorPage.module.scss';

const INITIAL_STATE = {
    name: '',
    address: '',
    contactPhone: '',
    ownerId: '',
    totalBuildings: '0',
    totalRooms: '0',
    description: '',
};

const STEPS = [
    {label: 'Thông tin nhận diện'},
    {label: 'Quy mô vận hành'},
    {label: 'Rà soát trước khi lưu'},
];

const resolveBasePath = (pathname) =>
    pathname.startsWith('/admin') ? '/admin/boarding-houses' : '/owner/boarding-houses';

const extractErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

const toNonNegativeNumber = (value) => {
    const numericValue = Number(String(value ?? '').replace(/[^0-9]/g, ''));
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : 0;
};

export default function BoardingHouseCreatorPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();
    const {user} = useAuth();
    const invalidateQuota = useInvalidateQuota();
    const {data: quota} = useOwnerQuota();
    const isEditMode = Boolean(id);
    const isOwner = user?.isOwner || user?.role === 'OWNER';
    const basePath = resolveBasePath(location.pathname);

    const [state, setState] = useState(INITIAL_STATE);
    const [initialState, setInitialState] = useState(INITIAL_STATE);
    const [ownerOptions, setOwnerOptions] = useState([]);
    const [initializing, setInitializing] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    const currentBoardingHouses = quota?.currentBoardingHouses ?? 0;
    const maxBoardingHouses = quota?.maxBoardingHouses ?? 0;
    const isQuotaExceeded = !isEditMode && isOwner && maxBoardingHouses > 0 && currentBoardingHouses >= maxBoardingHouses;

    const patch = (updates) => setState((prev) => ({...prev, ...updates}));

    useEffect(() => {
        let ignore = false;

        const fetchContext = async () => {
            setInitializing(true);
            try {
                const requests = [
                    isEditMode ? getBoardingHouseById(id) : Promise.resolve(null),
                    isOwner ? Promise.resolve([]) : getAllOwners(),
                ];
                const [detailData, ownerData] = await Promise.all(requests);
                if (ignore) return;

                const nextOwnerOptions = Array.isArray(ownerData)
                    ? ownerData.map((item) => ({
                        value: String(item.id),
                        label: item.fullName || item.email || `Owner #${item.id}`,
                    }))
                    : [];
                setOwnerOptions(nextOwnerOptions);

                if (detailData) {
                    const nextState = {
                        name: detailData.name || '',
                        address: detailData.address || '',
                        contactPhone: detailData.contactPhone || '',
                        ownerId: detailData.ownerId ? String(detailData.ownerId) : '',
                        totalBuildings: String(detailData.totalBuildings ?? 0),
                        totalRooms: String(detailData.totalRooms ?? 0),
                        description: detailData.description || '',
                    };
                    setState(nextState);
                    setInitialState(nextState);
                } else {
                    const nextState = {
                        ...INITIAL_STATE,
                        ownerId: isOwner ? String(user?.userId || '') : '',
                    };
                    setState(nextState);
                    setInitialState(nextState);
                }
            } catch (error) {
                message.error(extractErrorMessage(error, 'Không thể tải dữ liệu khu trọ'));
                navigate(basePath);
            } finally {
                if (!ignore) {
                    setInitializing(false);
                }
            }
        };

        fetchContext();
        return () => {
            ignore = true;
        };
    }, [basePath, id, isEditMode, isOwner, navigate, user?.userId]);

    const selectedOwnerLabel = useMemo(() => {
        if (isOwner) {
            return user?.username || 'Tài khoản chủ trọ hiện tại';
        }

        return ownerOptions.find((item) => item.value === String(state.ownerId))?.label || 'Chưa chọn chủ sở hữu';
    }, [isOwner, ownerOptions, state.ownerId, user?.username]);

    const summaryStats = useMemo(() => ([
        {label: 'Quy mô tòa nhà', value: `${toNonNegativeNumber(state.totalBuildings)} tòa`},
        {label: 'Quy mô phòng', value: `${toNonNegativeNumber(state.totalRooms)} phòng`},
        {
            label: 'Trạng thái quota',
            value: isEditMode
                ? 'Đang cập nhật cấu hình hiện có'
                : (isOwner ? `${currentBoardingHouses}/${maxBoardingHouses || '∞'} khu trọ` : 'Quản trị viên phân quyền'),
        },
    ]), [currentBoardingHouses, isEditMode, isOwner, maxBoardingHouses, state.totalBuildings, state.totalRooms]);

    const validate = () => {
        if (isQuotaExceeded) {
            message.warning('Bạn đã đạt giới hạn số khu trọ của gói hiện tại.');
            return false;
        }
        if (!state.name.trim()) {
            message.error('Bạn cần nhập tên khu trọ.');
            return false;
        }
        if (!state.address.trim()) {
            message.error('Bạn cần nhập địa chỉ khu trọ.');
            return false;
        }
        if (!state.contactPhone.trim()) {
            message.error('Bạn cần nhập số điện thoại liên hệ.');
            return false;
        }
        if (!isOwner && !String(state.ownerId).trim()) {
            message.error('Bạn cần chọn chủ sở hữu cho khu trọ.');
            return false;
        }
        if (toNonNegativeNumber(state.totalBuildings) < 0 || toNonNegativeNumber(state.totalRooms) < 0) {
            message.error('Số lượng tòa nhà và phòng không được âm.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const payload = {
            name: state.name.trim(),
            address: state.address.trim(),
            contactPhone: state.contactPhone.trim(),
            ownerId: isOwner ? user?.userId : Number(state.ownerId),
            totalBuildings: toNonNegativeNumber(state.totalBuildings),
            totalRooms: toNonNegativeNumber(state.totalRooms),
            description: state.description.trim() || null,
        };

        setSubmitting(true);
        try {
            if (isEditMode) {
                await updateBoardingHouse(id, payload);
                message.success('Cập nhật khu trọ thành công');
            } else {
                await createBoardingHouse(payload);
                invalidateQuota();
                message.success('Tạo khu trọ thành công');
            }
            navigate(basePath);
        } catch (error) {
            message.error(extractErrorMessage(error, 'Không thể lưu khu trọ'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setState(initialState);
    };

    if (initializing) {
        return <div className={styles.pageLoading}>Đang tải dữ liệu khu trọ...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.mainContent}>
                <StepsBar
                    steps={STEPS}
                    activeStep={activeStep}
                    onChange={setActiveStep}
                />

                <div className={styles.contentGrid}>
                    <div className={styles.contentMain}>
                        <SectionCard
                            icon={<BankOutlined/>}
                            iconColor="green"
                            title="Nhận diện khu trọ"
                            desc="Thiết lập tên, vị trí và đầu mối quản lý cho khu trọ."
                        >
                            <div className={styles.formGrid}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Tên khu trọ</span>
                                    <input
                                        className={styles.input}
                                        value={state.name}
                                        onChange={(event) => patch({name: event.target.value})}
                                        placeholder="Ví dụ: Khu trọ Minh Anh"
                                    />
                                </label>

                                {!isOwner && (
                                    <label className={styles.field}>
                                        <span className={styles.label}>Chủ sở hữu</span>
                                        <select
                                            className={styles.input}
                                            value={state.ownerId}
                                            onChange={(event) => patch({ownerId: event.target.value})}
                                        >
                                            <option value="">Chọn chủ sở hữu</option>
                                            {ownerOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                <label className={`${styles.field} ${styles.fullWidth}`}>
                                    <span className={styles.label}>Địa chỉ</span>
                                    <input
                                        className={styles.input}
                                        value={state.address}
                                        onChange={(event) => patch({address: event.target.value})}
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.label}>Số điện thoại liên hệ</span>
                                    <input
                                        className={styles.input}
                                        value={state.contactPhone}
                                        onChange={(event) => patch({contactPhone: event.target.value})}
                                        placeholder="0909 000 000"
                                    />
                                </label>
                            </div>
                        </SectionCard>

                        <SectionCard
                            icon={<HomeOutlined/>}
                            iconColor="blue"
                            title="Quy mô vận hành"
                            desc="Thiết lập dữ liệu tổng quan để đồng bộ với màn hình danh sách khu trọ."
                        >
                            <div className={styles.formGrid}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Tổng số tòa nhà</span>
                                    <input
                                        className={styles.input}
                                        inputMode="numeric"
                                        value={state.totalBuildings}
                                        onChange={(event) => patch({totalBuildings: event.target.value})}
                                        placeholder="0"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.label}>Tổng số phòng</span>
                                    <input
                                        className={styles.input}
                                        inputMode="numeric"
                                        value={state.totalRooms}
                                        onChange={(event) => patch({totalRooms: event.target.value})}
                                        placeholder="0"
                                    />
                                </label>

                                <label className={`${styles.field} ${styles.fullWidth}`}>
                                    <span className={styles.label}>Mô tả vận hành</span>
                                    <textarea
                                        className={`${styles.input} ${styles.textarea}`}
                                        value={state.description}
                                        onChange={(event) => patch({description: event.target.value})}
                                        placeholder="Ghi chú thêm về khu trọ, quy định riêng hoặc định hướng khai thác"
                                    />
                                </label>
                            </div>
                        </SectionCard>
                    </div>

                    <div className={styles.contentAside}>
                        <SectionCard
                            icon={<InfoCircleOutlined/>}
                            iconColor="gold"
                            title="Tóm tắt cấu hình"
                            desc="Rà soát nhanh trước khi lưu."
                        >
                            <div className={styles.summaryList}>
                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryIconWrap}>
                                        <BankOutlined/>
                                    </div>
                                    <div>
                                        <div className={styles.summaryLabel}>Tên khu trọ</div>
                                        <div className={styles.summaryValue}>{state.name || 'Chưa nhập'}</div>
                                    </div>
                                </div>

                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryIconWrap}>
                                        <EnvironmentOutlined/>
                                    </div>
                                    <div>
                                        <div className={styles.summaryLabel}>Địa chỉ</div>
                                        <div className={styles.summaryValue}>{state.address || 'Chưa nhập'}</div>
                                    </div>
                                </div>

                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryIconWrap}>
                                        <PhoneOutlined/>
                                    </div>
                                    <div>
                                        <div className={styles.summaryLabel}>Liên hệ</div>
                                        <div className={styles.summaryValue}>{state.contactPhone || 'Chưa nhập'}</div>
                                    </div>
                                </div>

                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryIconWrap}>
                                        <TeamOutlined/>
                                    </div>
                                    <div>
                                        <div className={styles.summaryLabel}>Chủ sở hữu</div>
                                        <div className={styles.summaryValue}>{selectedOwnerLabel}</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.statGrid}>
                                {summaryStats.map((item) => (
                                    <div key={item.label} className={styles.statCard}>
                                        <div className={styles.statLabel}>{item.label}</div>
                                        <div className={styles.statValue}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {isQuotaExceeded && (
                                <div className={styles.warningBox}>
                                    Bạn đã dùng hết quota khu trọ hiện tại. Hãy nâng cấp gói trước khi tạo mới.
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>

                <ActionBar
                    onBack={() => navigate(basePath)}
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    submitLabel={isEditMode ? 'Lưu khu trọ' : 'Tạo khu trọ'}
                    submittingLabel={isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
                />
            </div>
        </div>
    );
}
