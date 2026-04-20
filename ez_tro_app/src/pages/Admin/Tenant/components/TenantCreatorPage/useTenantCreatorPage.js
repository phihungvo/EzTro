import {useCallback, useEffect, useState} from 'react';
import {message} from 'antd';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {createTenant, tenantDetail, updateTenant} from '~/service/admin/tenant';
import {getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';
import {getByBoardingHouse} from '~/service/admin/building';

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
    id: Date.now(),
    name: '',
    gender: '',
    dob: '',
    phone: '',
    idCard: '',
    relation: 'Bạn bè',
    occupation: '',
});

const mapGender = (value) => {
    if (!value) return null;
    const genderMap = {
        male: 'MALE',
        female: 'FEMALE',
        other: 'OTHER',
    };
    return genderMap[value] || null;
};

const buildPermanentAddress = (tenant) => [
    tenant.address?.trim(),
    tenant.ward?.trim(),
    tenant.district?.trim(),
    tenant.province?.trim(),
].filter(Boolean).join(', ');

export const useTenantCreatorPage = () => {
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
    const removeExtra = (rowId) => setExtraRows((prev) => prev.filter((row) => row.id !== rowId));
    const patchExtra = (rowId, field, value) =>
        setExtraRows((prev) => prev.map((row) => (row.id === rowId ? {...row, [field]: value} : row)));
    const onSetting = (key, val) => setSettings((prev) => ({...prev, [key]: val}));
    const toggleTag = (tag) => setTags((prev) => {
        const next = new Set(prev);
        next.has(tag) ? next.delete(tag) : next.add(tag);
        return next;
    });

    useEffect(() => {
        if (isEditMode) return;

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
        if (isEditMode) return;

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
        if (!isEditMode || !id) return;

        const loadTenant = async () => {
            setLoadingTenant(true);
            try {
                const data = await tenantDetail(id);
                if (!data) return;

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
        message.success('Đã lưu bản nháp cục bộ.');
    };

    const handleBack = () => {
        navigate(isEditMode ? `${basePath}/${id}` : basePath);
    };

    const handleSubmit = async () => {
        if (!validate()) {
            message.error(`Vui lòng nhập đủ các trường bắt buộc trước khi ${isEditMode ? 'cập nhật' : 'tạo'} người thuê.`);
            return;
        }

        setSubmitting(true);
        try {
            if (isEditMode) {
                await updateTenant(id, buildPayload());
                message.success('Cập nhật người thuê thành công.');
                navigate(`${basePath}/${id}`);
            } else {
                await createTenant(buildPayload());
                message.success('Tạo người thuê thành công.');
                navigate(basePath);
            }
        } catch (error) {
            // service layer shows error toast
        } finally {
            setSubmitting(false);
        }
    };

    return {
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
        basePath,
    };
};
