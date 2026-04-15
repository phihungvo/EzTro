import {useEffect, useMemo, useState} from 'react';
import {message} from 'antd';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {createBoardingHouse, getBoardingHouseById, updateBoardingHouse} from '~/service/admin/boarding_house';
import {getAllOwners} from '~/service/admin/user';
import {useAuth} from '~/routes/AuthContext';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';

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

export const useBoardingHouseCreatorPage = () => {
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

    const handleBack = () => {
        navigate(basePath);
    };

    return {
        state,
        patch,
        ownerOptions,
        initializing,
        submitting,
        activeStep,
        setActiveStep,
        isEditMode,
        isOwner,
        basePath,
        selectedOwnerLabel,
        summaryStats,
        isQuotaExceeded,
        handleSubmit,
        handleReset,
        handleBack,
        steps: STEPS,
    };
};
