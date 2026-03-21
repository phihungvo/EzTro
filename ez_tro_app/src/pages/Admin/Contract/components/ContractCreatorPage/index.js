import {useEffect, useMemo, useState} from 'react';
import {message} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';

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
import {getAllRoomAvailableByBoardingHouse} from '~/service/admin/room';
import {createContract} from '~/service/admin/contract';

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
    const basePath = resolveBasePath(location.pathname);

    /* ── Form state ── */
    const [state, setState] = useState(INITIAL_STATE);
    const patch = (updates) => setState((prev) => ({...prev, ...updates}));

    /* ── Remote data ── */
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    /* ── UI state ── */
    const [activeStep, setActiveStep] = useState(1);
    const [services, setServices] = useState([]);
    const [clauses, setClauses] = useState(DEFAULT_CLAUSES);
    const [activeAssets, setActiveAssets] = useState(DEFAULT_ASSETS_ACTIVE);
    const [extraNote, setExtraNote] = useState('- Được phép nuôi 1 mèo nhỏ có kiểm soát (theo thoả thuận).\n- Giờ giấc: Cổng đóng lúc 23h, mở lại 5h sáng.',);
    const [extraRows, setExtraRows] = useState([{id: 2, name: '', phone: '', idCard: '', relation: 'Bạn bè'},]);
    /* ── Derived selections ── */
    const selectedRoom = useMemo(() => rooms.find((i) => String(i.id) === String(state.roomId)) || null, [rooms, state.roomId],);

    /* ── Load initial data ── */
    useEffect(() => {
        (async () => {
            try {
                const bhData = await getAllBoardingHousesNoPaged();
                setBoardingHouses(bhData || []);
                if (bhData?.length) patch({boardingHouseId: String(bhData[0].id)});
            } catch {
                message.error('Không thể tải dữ liệu tạo hợp đồng');
            }
        })();
    }, []);

    /* ── Load rooms when boarding house changes ── */
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
                const [availableRooms, utilityData] = await Promise.all([
                    getAllRoomAvailableByBoardingHouse(Number(state.boardingHouseId)),
                    getUtilityByBoardingHouse(state.boardingHouseId),
                ]);

                if (ignore) return;

                const nextRooms = Array.isArray(availableRooms) ? availableRooms : [];
                const nextServices = Array.isArray(utilityData)
                    ? utilityData.map(mapUtilityToServiceRow)
                    : [];

                setRooms(nextRooms);
                setServices(nextServices);

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
    }, [state.boardingHouseId]);

    /* ── Auto-fill price from selected room ── */
    useEffect(() => {
        if (!selectedRoom) return;
        const today = new Date().getDate();
        setState((prev) => ({
            ...prev,
            rentPrice: selectedRoom.price ? String(selectedRoom.price) : '',
            monthlyPaymentDay: prev.monthlyPaymentDay || String(today > 28 ? 28 : today),
        }));
    }, [selectedRoom]);

    /* ── Validation ── */
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
        if (String(state.tenantPassword || '').trim().length < 6) {
            message.error('Mật khẩu người thuê phải có ít nhất 6 ký tự.');
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

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        const rentNum = normalizeMoney(state.rentPrice);
        const depositNum = normalizeMoney(state.deposit) || rentNum * Number(state.depositMonths || 2);
        setSubmitting(true);
        try {
            await createContract({
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
                tenant: {
                    fullName: state.tenantFullName.trim(),
                    phoneNumber: state.tenantPhoneNumber.trim(),
                    email: state.tenantEmail.trim(),
                    password: state.tenantPassword,
                    identityNumber: state.tenantIdentityNumber.trim(),
                    dateOfBirth: state.tenantDateOfBirth || null,
                    occupation: state.tenantOccupation?.trim() || null,
                    note: `Tạo từ màn hình hợp đồng cho phòng ${selectedRoom?.roomNumber || ''}`.trim(),
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
            message.success('Tạo hợp đồng thành công!');
            navigate(basePath);
        } catch (error) {
            console.error('Create contract flow failed:', error);
        } finally {
            setSubmitting(false);
        }
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
                />

                <TenantSection
                    state={state}
                    patch={patch}
                    extraRows={extraRows}
                    onAddExtra={addExtraRow}
                    onRemoveExtra={removeExtraRow}
                    onPatchExtra={patchExtra}
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
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </div>
    </div>);
}
