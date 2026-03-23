import {useEffect, useMemo, useState} from 'react';
import {message} from 'antd';
import {useLocation, useNavigate, useParams} from 'react-router-dom';

import {
    DEFAULT_ASSETS,
    DEFAULT_ASSETS_ACTIVE,
    DEFAULT_CLAUSES,
    INITIAL_STATE,
    STEPS,
    formatVND,
    nextId,
    resolveBasePath,
} from '../shared/constants';

import {getAllBoardingHousesNoPaged, getUtilityByBoardingHouse} from '~/service/admin/boarding_house';
import {getAllRoomAvailableByBoardingHouse, getRoomsByBoardingHouse} from '~/service/admin/room';
import {createContract, getContractById, updateContract} from '~/service/admin/contract';

import styles from './ContractCreatorPage.module.scss';
import StepsBar from "~/pages/Admin/Contract/components/StepsBar";
import TenantSection from "~/pages/Admin/Contract/components/TenantSection";
import FinanceSection from "~/pages/Admin/Contract/components/FinanceSection";
import AssetsSection from "~/pages/Admin/Contract/components/AssetsSection";
import ClausesSection from "~/pages/Admin/Contract/components/ClausesSection";
import ActionBar from "~/pages/Admin/Contract/components/ActionBar";
import ContractInfoSection from "~/pages/Admin/Contract/components/ContractInfoSection";

const SERVICE_TYPE_TO_DEFAULT = {
    FIXED: {unit: 'Tháng', qty: 1, byMeter: false},
    USAGE_BASED: {qty: 0, byMeter: true},
    PER_PERSON: {unit: 'Người', qty: 1, byMeter: false},
    PER_VEHICLE: {unit: 'Xe', qty: 1, byMeter: false},
};

const mapUtilityToServiceRow = (utility) => {
    const defaults = SERVICE_TYPE_TO_DEFAULT[utility?.type] || SERVICE_TYPE_TO_DEFAULT.FIXED;
    const unit = utility?.unit?.trim() || defaults.unit || 'Tháng';

    return {
        id: utility.id,
        utilityId: utility.id,
        name: utility.name || '',
        unit,
        price: Number(utility.unitPrice || 0),
        qty: defaults.qty,
        on: utility?.isActive !== false,
        byMeter: defaults.byMeter || unit === 'kWh' || unit === 'm³',
        type: utility?.type || 'FIXED',
        isSystem: true,
    };
};

const normalizeMoney = (value) => Number(String(value || '').replace(/[^0-9]/g, '')) || 0;

const normalizeDateInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    return new Date(value).toISOString().slice(0, 10);
};

const mapContractDetailToState = (detail) => {
    const rentPrice = Number(detail?.rentPrice || 0);
    const deposit = Number(detail?.deposit || 0);
    const depositMonths = rentPrice > 0 && deposit > 0
        ? String(Math.max(1, Math.round(deposit / rentPrice)))
        : '2';

    return {
        contractCode: detail?.contractCode || '',
        boardingHouseId: detail?.boardingHouseId ? String(detail.boardingHouseId) : '',
        roomId: detail?.roomId ? String(detail.roomId) : '',
        status: detail?.status || '',
        tenantFullName: detail?.tenantFullName || '',
        tenantPhoneNumber: detail?.tenantPhoneNumber || '',
        tenantEmail: detail?.tenantEmail || '',
        tenantPassword: '',
        tenantIdentityNumber: detail?.tenantIdentityNumber || '',
        tenantDateOfBirth: normalizeDateInput(detail?.tenantDateOfBirth),
        tenantOccupation: detail?.tenantOccupation || '',
        startDate: normalizeDateInput(detail?.startDate),
        endDate: normalizeDateInput(detail?.endDate),
        isOpenEnded: !detail?.endDate,
        rentPrice: detail?.rentPrice ? String(detail.rentPrice) : '',
        deposit: detail?.deposit ? String(detail.deposit) : '',
        depositMonths,
        depositReceivedAt: normalizeDateInput(detail?.depositReceivedAt),
        depositPaymentMethod: detail?.depositPaymentMethod || '',
        paymentCycleMonths: detail?.paymentCycleMonths || 1,
        monthlyPaymentDay: detail?.monthlyPaymentDay ? String(detail.monthlyPaymentDay) : '',
        note: detail?.note || '',
    };
};

const mergeServiceSelections = (utilityData, selectedUtilities) => {
    const normalizedSelected = Array.isArray(selectedUtilities) ? selectedUtilities : [];
    const mappedUtilities = Array.isArray(utilityData) ? utilityData.map(mapUtilityToServiceRow) : [];

    const selectedByUtilityId = new Map(
        normalizedSelected
            .filter((item) => item?.utilityId != null)
            .map((item) => [String(item.utilityId), item]),
    );

    const mergedServices = mappedUtilities.map((service) => {
        const selected = selectedByUtilityId.get(String(service.utilityId));
        if (!selected) {
            return {
                ...service,
                on: false,
            };
        }

        return {
            ...service,
            name: selected.name || service.name,
            unit: selected.unit || service.unit,
            price: Number(selected.unitPrice ?? service.price ?? 0),
            qty: selected.quantity ?? service.qty,
            on: true,
            byMeter: (selected.type || service.type) === 'USAGE_BASED' || service.byMeter,
            type: selected.type || service.type,
        };
    });

    const extraServices = normalizedSelected
        .filter((item) => !mappedUtilities.some((service) => String(service.utilityId) === String(item.utilityId)))
        .map((item) => ({
            id: item.utilityId || nextId(),
            utilityId: item.utilityId || null,
            name: item.name || '',
            unit: item.unit || 'Tháng',
            price: Number(item.unitPrice || 0),
            qty: item.quantity || 1,
            on: true,
            byMeter: item.type === 'USAGE_BASED' || item.unit === 'kWh' || item.unit === 'm³',
            type: item.type || mapUnitToServiceType(item),
            isSystem: Boolean(item.utilityId),
        }));

    return [...mergedServices, ...extraServices];
};

const mapUnitToServiceType = (service) => {
    if (service?.type) return service.type;
    if (service?.unit === 'kWh' || service?.unit === 'm³' || service?.byMeter) return 'USAGE_BASED';
    if (service?.unit === 'Người') return 'PER_PERSON';
    if (service?.unit === 'Xe') return 'PER_VEHICLE';
    return 'FIXED';
};

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(String(value || '').trim());

export default function ContractCreatorPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();
    const basePath = resolveBasePath(location.pathname);
    const isEditMode = Boolean(id);

    const [state, setState] = useState(INITIAL_STATE);
    const patch = (updates) => setState((prev) => ({...prev, ...updates}));

    const [boardingHouses, setBoardingHouses] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [contractDetail, setContractDetail] = useState(null);
    const [initialServicesHydrated, setInitialServicesHydrated] = useState(false);

    const [activeStep, setActiveStep] = useState(1);
    const [services, setServices] = useState([]);
    const [clauses, setClauses] = useState(DEFAULT_CLAUSES);
    const [activeAssets, setActiveAssets] = useState(DEFAULT_ASSETS_ACTIVE);
    const [extraNote, setExtraNote] = useState('- Được phép nuôi 1 mèo nhỏ có kiểm soát (theo thoả thuận).\n- Giờ giấc: Cổng đóng lúc 23h, mở lại 5h sáng.',);
    const [extraRows, setExtraRows] = useState([{id: 2, name: '', phone: '', idCard: '', relation: 'Bạn bè'},]);
    const selectedRoom = useMemo(() => rooms.find((i) => String(i.id) === String(state.roomId)) || null, [rooms, state.roomId],);

    useEffect(() => {
        (async () => {
            setInitializing(true);
            try {
                const [bhData, detailData] = await Promise.all([
                    getAllBoardingHousesNoPaged(),
                    isEditMode ? getContractById(id) : Promise.resolve(null),
                ]);
                setBoardingHouses(bhData || []);
                if (detailData) {
                    setContractDetail(detailData);
                    setInitialServicesHydrated(false);
                    setState((prev) => ({
                        ...prev,
                        ...mapContractDetailToState(detailData),
                    }));
                } else if (bhData?.length) {
                    patch({boardingHouseId: String(bhData[0].id)});
                }
            } catch {
                message.error(isEditMode ? 'Không thể tải dữ liệu hợp đồng' : 'Không thể tải dữ liệu tạo hợp đồng');
                navigate(basePath);
            } finally {
                setInitializing(false);
            }
        })();
    }, [basePath, id, isEditMode, navigate]);

    useEffect(() => {
        if (!state.boardingHouseId) {
            setRooms([]);
            setServices([]);
            setState((prev) => (prev.roomId ? {...prev, roomId: ''} : prev));
            return;
        }

        let ignore = false;

        const fetchBoardingHouseContext = async () => {
            setLoadingRooms(true);
            try {
                const [roomData, utilityData] = await Promise.all([
                    isEditMode
                        ? getRoomsByBoardingHouse(Number(state.boardingHouseId))
                        : getAllRoomAvailableByBoardingHouse(Number(state.boardingHouseId)),
                    getUtilityByBoardingHouse(state.boardingHouseId),
                ]);

                if (ignore) return;

                const currentRoomId = String(contractDetail?.roomId || '');
                const nextRooms = Array.isArray(roomData)
                    ? roomData.filter((room) =>
                        !isEditMode || room.status === 'AVAILABLE' || String(room.id) === currentRoomId)
                    : [];
                const shouldHydrateInitialServices = isEditMode
                    && !initialServicesHydrated
                    && String(contractDetail?.boardingHouseId || '') === String(state.boardingHouseId);
                const nextServices = shouldHydrateInitialServices
                    ? mergeServiceSelections(utilityData, contractDetail?.utilities || [])
                    : (Array.isArray(utilityData) ? utilityData.map(mapUtilityToServiceRow) : []);

                setRooms(nextRooms);
                setServices(nextServices);
                if (shouldHydrateInitialServices) {
                    setInitialServicesHydrated(true);
                }

                setState((prev) => nextRooms.some((i) => String(i.id) === String(prev.roomId))
                    ? prev
                    : {...prev, roomId: ''});
            } catch {
                if (!ignore) {
                    setRooms([]);
                    setServices([]);
                }
            } finally {
                if (!ignore) {
                    setLoadingRooms(false);
                }
            }
        };

        fetchBoardingHouseContext();

        return () => {
            ignore = true;
        };
    }, [contractDetail, initialServicesHydrated, isEditMode, state.boardingHouseId]);

    useEffect(() => {
        if (!selectedRoom) return;
        const today = new Date().getDate();
        setState((prev) => ({
            ...prev,
            rentPrice: selectedRoom.price ? String(selectedRoom.price) : '',
            monthlyPaymentDay: prev.monthlyPaymentDay || String(today > 28 ? 28 : today),
        }));
    }, [selectedRoom]);

    const validate = () => {
        const rentNum = normalizeMoney(state.rentPrice);
        if (!state.boardingHouseId) {
            message.error('Bạn cần chọn khu nhà trọ.');
            return false;
        }
        if (!state.roomId) {
            message.error('Bạn cần chọn phòng trống.');
            return false;
        }
        if (!state.tenantFullName.trim()) {
            message.error('Bạn cần nhập họ tên người thuê chính.');
            return false;
        }
        if (!state.tenantPhoneNumber.trim()) {
            message.error('Bạn cần nhập số điện thoại người thuê.');
            return false;
        }
        if (!state.tenantIdentityNumber.trim()) {
            message.error('Bạn cần nhập CCCD/CMT của người thuê.');
            return false;
        }
        if (!isValidEmail(state.tenantEmail)) {
            message.error('Email người thuê không hợp lệ.');
            return false;
        }
        if (!isEditMode && String(state.tenantPassword || '').trim().length < 6) {
            message.error('Mật khẩu người thuê phải có ít nhất 6 ký tự.');
            return false;
        }
        if (isEditMode && state.tenantPassword && String(state.tenantPassword).trim().length > 0
            && String(state.tenantPassword).trim().length < 6) {
            message.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return false;
        }
        if (!state.startDate) {
            message.error('Bạn cần nhập ngày bắt đầu.');
            return false;
        }
        if (!state.isOpenEnded && !state.endDate) {
            message.error('Bạn cần nhập ngày kết thúc hoặc bật không thời hạn.');
            return false;
        }
        if (!state.isOpenEnded && state.endDate < state.startDate) {
            message.error('Ngày kết thúc không hợp lệ.');
            return false;
        }
        if (rentNum <= 0) {
            message.error('Giá thuê phải lớn hơn 0.');
            return false;
        }
        if (Number(state.paymentCycleMonths || 0) < 1) {
            message.error('Chu kỳ thanh toán phải từ 1 tháng.');
            return false;
        }
        if (Number(state.monthlyPaymentDay || 0) < 1 || Number(state.monthlyPaymentDay || 0) > 28) {
            message.error('Ngày thanh toán phải nằm trong khoảng 1-28.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const rentNum = normalizeMoney(state.rentPrice);
        const depositNum = normalizeMoney(state.deposit) || rentNum * Number(state.depositMonths || 2);
        setSubmitting(true);
        try {
            const financialPayload = {
                roomId: Number(state.roomId),
                startDate: state.startDate,
                endDate: state.isOpenEnded ? null : state.endDate,
                rentPrice: rentNum,
                deposit: depositNum,
                depositReceivedAt: state.depositReceivedAt || null,
                depositPaymentMethod: state.depositPaymentMethod || null,
                paymentCycleMonths: Number(state.paymentCycleMonths || 1),
                monthlyPaymentDay: Number(state.monthlyPaymentDay),
                note: state.note?.trim() || null,
            };

            if (isEditMode) {
                await updateContract(id, financialPayload);
            } else {
                await createContract({
                    ...financialPayload,
                    tenant: {
                        fullName: state.tenantFullName.trim(),
                        phoneNumber: state.tenantPhoneNumber.trim(),
                        email: state.tenantEmail.trim(),
                        password: state.tenantPassword?.trim() || null,
                        identityNumber: state.tenantIdentityNumber.trim(),
                        dateOfBirth: state.tenantDateOfBirth || null,
                        occupation: state.tenantOccupation?.trim() || null,
                        note: state.note?.trim() || `Cập nhật từ màn hình hợp đồng cho phòng ${selectedRoom?.roomNumber || ''}`.trim(),
                    },
                    utilities: services
                        .filter((service) => service.on && service.name?.trim())
                        .map((service) => ({
                            utilityId: service.utilityId || null,
                            name: service.name.trim(),
                            type: mapUnitToServiceType(service),
                            unitPrice: Number(service.price || 0),
                            unit: service.unit || 'Tháng',
                            quantity: service.byMeter ? 1 : Math.max(1, Number(service.qty || 1)),
                            usageAmount: service.byMeter ? 0 : null,
                            note: `Tạo cùng hợp đồng cho phòng ${selectedRoom?.roomNumber || state.roomId}`,
                        })),
                });
            }
            navigate(basePath);
        } catch (error) {
            console.error('Contract submit flow failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        if (isEditMode && contractDetail) {
            setState((prev) => ({
                ...prev,
                ...mapContractDetailToState(contractDetail),
            }));
            setInitialServicesHydrated(false);
            return;
        }

        setState({
            ...INITIAL_STATE,
            boardingHouseId: boardingHouses?.[0]?.id ? String(boardingHouses[0].id) : '',
        });
        setServices([]);
    };

    const addExtraRow = () => setExtraRows((p) => [...p, {
        id: nextId(), name: '', phone: '', idCard: '', relation: 'Bạn bè'
    }]);
    const removeExtraRow = (id) => setExtraRows((p) => p.filter((r) => r.id !== id));
    const patchExtra = (id, f, v) => setExtraRows((p) => p.map((r) => r.id === id ? {...r, [f]: v} : r));

    /* ── Service handlers ── */
    const toggleService = (id) => setServices((p) => p.map((s) => s.id === id ? {...s, on: !s.on} : s));
    const patchService = (id, f, v) => setServices((p) => p.map((s) => s.id === id ? {...s, [f]: v} : s));
    const addServiceRow = () => setServices((p) => [...p, {
        id: nextId(), name: '', unit: 'Tháng', price: 0, qty: 1, on: true, byMeter: false
    }]);
    const removeService = (id) => setServices((p) => p.filter((s) => s.id !== id || s.isSystem));

    /* ── Clause handlers ── */
    const toggleClause = (id) => setClauses((p) => p.map((c) => c.id === id ? {...c, selected: !c.selected} : c));

    /* ── Asset handler ── */
    const toggleAsset = (name) => setActiveAssets((p) => {
        const next = new Set(p);
        next.has(name) ? next.delete(name) : next.add(name);
        return next;
    });

    if (initializing) {
        return <div className={styles.page}>Đang tải dữ liệu hợp đồng...</div>;
    }

    return (<div className={styles.page}>
        <div className={styles.mainContent}>

            {/* ── Thanh tiến trình ── */}
            <StepsBar
                steps={STEPS}
                activeStep={activeStep}
                onChange={setActiveStep}
            />

            {/* ── Các section ── */}
            <div className={styles.formBody}>
                <ContractInfoSection
                    state={state}
                    patch={patch}
                    boardingHouses={boardingHouses}
                    rooms={rooms}
                    loadingRooms={loadingRooms}
                    selectedRoom={selectedRoom}
                    isEditMode={isEditMode}
                />

                <TenantSection
                    state={state}
                    patch={patch}
                    extraRows={extraRows}
                    onAddExtra={addExtraRow}
                    onRemoveExtra={removeExtraRow}
                    onPatchExtra={patchExtra}
                    isEditMode={isEditMode}
                />

                <FinanceSection
                    state={state}
                    patch={patch}
                    services={services}
                    onToggleService={toggleService}
                    onPatchService={patchService}
                    onAddService={addServiceRow}
                    onRemoveService={removeService}
                    formatVND={formatVND}
                    isEditMode={isEditMode}
                />

                <AssetsSection
                    activeAssets={activeAssets}
                    onToggleAsset={toggleAsset}
                    defaultAssets={DEFAULT_ASSETS}
                />

                <ClausesSection
                    clauses={clauses}
                    onToggle={toggleClause}
                    extraNote={extraNote}
                    onExtraNote={setExtraNote}
                />
            </div>

            {/* ── Action bar cố định ── */}
            <ActionBar
                onBack={() => navigate(basePath)}
                onReset={handleReset}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitLabel={isEditMode ? 'Lưu cập nhật hợp đồng' : 'Tạo hợp đồng'}
                submittingLabel={isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
            />
        </div>
    </div>);
}
