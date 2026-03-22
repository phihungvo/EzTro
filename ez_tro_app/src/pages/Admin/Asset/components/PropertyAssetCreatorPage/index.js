import {useEffect, useMemo, useState} from 'react';
import classNames from 'classnames/bind';
import {message} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';

import {getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';
import {getByBoardingHouse} from '~/service/admin/building';
import {getRoomsByBoardingHouse} from '~/service/admin/room';
import {createPropertyAsset} from '~/service/admin/property-asset';

import {
    CATEGORY_CODE_MAP,
    CATEGORY_OPTIONS,
    CONDITION_OPTIONS,
    INITIAL_FORM,
    STATUS_OPTIONS,
} from './constants';
import AssetIdentitySection from './components/AssetIdentitySection';
import AssetLifecycleSection from './components/AssetLifecycleSection';
import AssetNotesSection from './components/AssetNotesSection';
import AssetPlacementSection from './components/AssetPlacementSection';
import CreatorActionBar from './components/CreatorActionBar';
import styles from './PropertyAssetCreatorPage.module.scss';

const cx = classNames.bind(styles);

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
        return 'Chua khai bao';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
};

const optionLabel = (options, value, emptyLabel = 'Chua chon') =>
    options.find((item) => item.value === value)?.label || emptyLabel;

const toNullableNumber = (value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toNullableString = (value) => {
    const trimmed = String(value || '').trim();
    return trimmed ? trimmed : null;
};

const addMonths = (dateString, months) => {
    if (!dateString || !months || Number(months) <= 0) {
        return 'Chua tinh duoc';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return 'Chua tinh duoc';
    }

    date.setMonth(date.getMonth() + Number(months));
    return date.toLocaleDateString('vi-VN');
};

export default function PropertyAssetCreatorPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/admin') ? '/admin/assets' : '/owner/assets';

    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const patch = (field, value) => {
        setForm((prev) => {
            const next = {...prev, [field]: value};

            if (field === 'boardingHouseId') {
                next.buildingId = '';
                next.roomId = '';
            }

            if (field === 'roomId' && value && prev.status === 'STORED') {
                next.status = 'ACTIVE';
            }

            if (field === 'roomId' && !value && prev.status === 'ACTIVE') {
                next.status = 'STORED';
            }

            return next;
        });

        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            const next = {...prev};
            delete next[field];
            return next;
        });
    };

    useEffect(() => {
        const loadBoardingHouses = async () => {
            setLoadingMeta(true);
            try {
                const data = await getAllBoardingHousesNoPaged();
                setBoardingHouses(Array.isArray(data) ? data : []);
            } catch {
                message.error('Khong the tai danh sach khu tro');
            } finally {
                setLoadingMeta(false);
            }
        };

        loadBoardingHouses();
    }, []);

    useEffect(() => {
        if (!form.boardingHouseId) {
            setBuildings([]);
            setRooms([]);
            return;
        }

        let ignore = false;

        const loadContext = async () => {
            setLoadingMeta(true);
            try {
                const [buildingData, roomData] = await Promise.all([
                    getByBoardingHouse(Number(form.boardingHouseId)),
                    getRoomsByBoardingHouse(Number(form.boardingHouseId)),
                ]);

                if (ignore) {
                    return;
                }

                setBuildings(Array.isArray(buildingData) ? buildingData : []);
                setRooms(Array.isArray(roomData) ? roomData : []);
            } catch {
                if (!ignore) {
                    setBuildings([]);
                    setRooms([]);
                    message.error('Khong the tai toa nha hoac phong cua khu tro da chon');
                }
            } finally {
                if (!ignore) {
                    setLoadingMeta(false);
                }
            }
        };

        loadContext();

        return () => {
            ignore = true;
        };
    }, [form.boardingHouseId]);

    const selectedBoardingHouse = useMemo(
        () => boardingHouses.find((item) => String(item.id) === String(form.boardingHouseId)),
        [boardingHouses, form.boardingHouseId],
    );

    const selectedRoom = useMemo(
        () => rooms.find((item) => String(item.id) === String(form.roomId)),
        [rooms, form.roomId],
    );

    const summaryItems = useMemo(() => [
        {
            label: 'Loai tai san',
            value: optionLabel(CATEGORY_OPTIONS, form.category, 'Chua phan loai'),
        },
        {
            label: 'Diem dat hien tai',
            value: selectedRoom
                ? `Phong ${selectedRoom.roomNumber}`
                : selectedBoardingHouse?.name
                    ? `${selectedBoardingHouse.name} • Luu kho`
                    : 'Chua gan vi tri',
        },
        {
            label: 'Trang thai gui len',
            value: optionLabel(
                STATUS_OPTIONS,
                form.status || (form.roomId ? 'ACTIVE' : 'STORED'),
                'Tu suy ra',
            ),
        },
        {
            label: 'Tinh trang',
            value: optionLabel(CONDITION_OPTIONS, form.condition),
        },
        {
            label: 'Gia mua',
            value: formatCurrency(form.purchasePrice),
        },
        {
            label: 'Het bao hanh du kien',
            value: addMonths(form.purchaseDate, form.warrantyMonths),
        },
    ], [form, selectedBoardingHouse, selectedRoom]);

    const heroStats = useMemo(() => ([
        {
            label: 'Gia mua ban dau',
            value: formatCurrency(form.purchasePrice),
        },
        {
            label: 'Khau hao nam',
            value: form.depreciationRate ? `${form.depreciationRate}%` : 'Chua khai bao',
        },
        {
            label: 'Moc bao tri tiep theo',
            value: addMonths(form.lastMaintenanceDate || form.installDate, form.maintenanceCycle),
        },
    ]), [form]);

    const generateSuggestedCode = () => {
        const houseCode = selectedBoardingHouse?.name
            ?.split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 3)
            .toUpperCase() || 'KTR';
        const categoryCode = CATEGORY_CODE_MAP[form.category] || 'OT';
        const suffix = `${Date.now()}`.slice(-5);
        patch('assetCode', `TS-${categoryCode}-${houseCode}-${suffix}`);
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.assetCode.trim()) nextErrors.assetCode = 'Ma tai san la bat buoc.';
        if (!form.assetName.trim()) nextErrors.assetName = 'Ten tai san la bat buoc.';
        if (!form.category) nextErrors.category = 'Danh muc tai san la bat buoc.';
        if (!form.boardingHouseId) nextErrors.boardingHouseId = 'Can chon khu tro.';
        if (!form.roomId && form.status === 'ACTIVE') {
            nextErrors.roomId = 'Trang thai dang su dung can gan voi mot phong cu the.';
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            message.error('Vui long kiem tra lai cac truong bat buoc truoc khi tao tai san.');
            return false;
        }

        return true;
    };

    const buildPayload = () => ({
        assetCode: form.assetCode.trim(),
        assetName: form.assetName.trim(),
        category: form.category,
        boardingHouseId: Number(form.boardingHouseId),
        buildingId: toNullableNumber(form.buildingId),
        roomId: toNullableNumber(form.roomId),
        specification: toNullableString(form.specification),
        brand: toNullableString(form.brand),
        model: toNullableString(form.model),
        serialNumber: toNullableString(form.serialNumber),
        purchaseDate: form.purchaseDate || null,
        purchasePrice: toNullableNumber(form.purchasePrice),
        warrantyMonths: toNullableNumber(form.warrantyMonths),
        installDate: form.installDate || null,
        status: form.status || null,
        condition: form.condition || null,
        lastMaintenanceDate: form.lastMaintenanceDate || null,
        maintenanceCycle: toNullableNumber(form.maintenanceCycle),
        depreciationRate: toNullableNumber(form.depreciationRate),
        supplier: toNullableString(form.supplier),
        supplierPhone: toNullableString(form.supplierPhone),
        notes: toNullableString(form.notes),
        assignedTo: toNullableString(form.assignedTo),
        assignedDate: form.assignedDate || null,
    });

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setSubmitting(true);
        try {
            await createPropertyAsset(buildPayload());
            navigate(basePath);
        } catch {
            // Axios interceptor already surfaces the backend error.
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={cx('page')}>
            <div className={cx('shell')}>
                <div className={cx('hero')}>
                    <div className={cx('heroPanel')}>
                        <div className={cx('heroEyebrow')}>Property Asset Creator</div>
                        <h1 className={cx('heroTitle')}>Tao tai san khu tro voi du ho so van hanh</h1>
                        <p className={cx('heroDescription')}>
                            Man hinh nay bam theo luong creator cua hop dong: gom toan bo du lieu mua sam,
                            trien khai, bao hanh va bao tri vao mot form ro rang, sau do goi API backend
                            de tao moi tai san thuc te.
                        </p>
                        <div className={cx('heroChips')}>
                            <span className={cx('chip')}>Day du 20+ truong van hanh</span>
                            <span className={cx('chip')}>Tu suy ra trang thai theo vi tri</span>
                            <span className={cx('chip')}>San cho luu kho hoac ban giao phong</span>
                        </div>
                    </div>

                    <div className={cx('heroStats')}>
                        {heroStats.map((item) => (
                            <div key={item.label} className={cx('statBox')}>
                                <span className={cx('statLabel')}>{item.label}</span>
                                <strong className={cx('statValue')}>{item.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cx('content')}>
                    <AssetIdentitySection
                        form={form}
                        errors={errors}
                        onChange={patch}
                        onGenerateCode={generateSuggestedCode}
                    />

                    <AssetPlacementSection
                        form={form}
                        errors={errors}
                        boardingHouses={boardingHouses}
                        buildings={buildings}
                        rooms={rooms}
                        loadingMeta={loadingMeta}
                        onChange={patch}
                    />

                    <AssetLifecycleSection
                        form={form}
                        onChange={patch}
                    />

                    <AssetNotesSection
                        form={form}
                        onChange={patch}
                        summaryItems={summaryItems}
                    />
                </div>

                <CreatorActionBar
                    submitting={submitting}
                    onBack={() => navigate(basePath)}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
