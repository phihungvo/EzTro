import {useEffect, useMemo, useState} from 'react';
import {message} from 'antd';
import {useLocation, useNavigate, useParams} from 'react-router-dom';

import {getAllBoardingHousesNoPaged, getUtilityByBoardingHouse} from '~/service/admin/boarding_house';
import {getByBoardingHouse} from '~/service/admin/building';
import {createRoom, getRoomById, updateRoom} from '~/service/admin/room';
import {useAuth} from '~/routes/AuthContext';
import {useInvalidateQuota} from '~/hooks/useInvalidateQuota';
import {useOwnerQuota} from '~/hooks/useOwnerQuota';

import StepsBar from '~/pages/Admin/Contract/components/StepsBar';
import ActionBar from '~/pages/Admin/Contract/components/ActionBar';

import {INITIAL_STATE, STEPS} from './constants';
import {extractErrorMessage, mapRoomDetailToState, resolveBasePath} from './utils';
import HeroPanel from './components/HeroPanel';
import IdentitySection from './components/IdentitySection';
import OperationsSection from './components/OperationsSection';
import AmenitiesSection from './components/AmenitiesSection';
import SummarySidebar from './components/SummarySidebar';
import styles from './RoomCreatorPage.module.scss';

export default function RoomCreatorPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();
    const {user} = useAuth();
    const basePath = resolveBasePath(location.pathname);
    const isEditMode = Boolean(id);

    const [state, setState] = useState(INITIAL_STATE);
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [utilities, setUtilities] = useState([]);
    const [initializing, setInitializing] = useState(true);
    const [loadingContext, setLoadingContext] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [roomDetail, setRoomDetail] = useState(null);
    const invalidateQuota = useInvalidateQuota();
    const {data: quota} = useOwnerQuota();

    const patch = (updates) => setState((prev) => ({...prev, ...updates}));
    const isOwner = user?.isOwner || user?.role === 'OWNER';
    const currentRooms = quota?.currentRooms ?? 0;
    const maxRooms = quota?.maxRooms ?? 0;
    const isQuotaExceeded = !isEditMode && isOwner && maxRooms > 0 && currentRooms >= maxRooms;
    const hasActiveContract = isEditMode && state.status === 'OCCUPIED';

    const selectedBoardingHouse = useMemo(
        () => boardingHouses.find((item) => String(item.id) === String(state.boardingHouseId)) || null,
        [boardingHouses, state.boardingHouseId],
    );
    const selectedBuilding = useMemo(
        () => buildings.find((item) => String(item.id) === String(state.buildingId)) || null,
        [buildings, state.buildingId],
    );
    const selectedUtilities = useMemo(
        () => utilities.filter((item) => state.utilityIds.includes(String(item.id))),
        [utilities, state.utilityIds],
    );

    useEffect(() => {
        (async () => {
            setInitializing(true);
            try {
                const [boardingHouseData, detailData] = await Promise.all([
                    getAllBoardingHousesNoPaged(),
                    isEditMode ? getRoomById(id) : Promise.resolve(null),
                ]);

                const nextBoardingHouses = Array.isArray(boardingHouseData) ? boardingHouseData : [];
                setBoardingHouses(nextBoardingHouses);

                if (detailData) {
                    setRoomDetail(detailData);
                    setState(mapRoomDetailToState(detailData));
                } else if (nextBoardingHouses.length > 0) {
                    patch({boardingHouseId: String(nextBoardingHouses[0].id)});
                }
            } catch (error) {
                message.error(extractErrorMessage(error));
                navigate(basePath);
            } finally {
                setInitializing(false);
            }
        })();
    }, [basePath, id, isEditMode, navigate]);

    useEffect(() => {
        if (!state.boardingHouseId) {
            setBuildings([]);
            setUtilities([]);
            if (state.buildingId) {
                patch({buildingId: '', utilityIds: []});
            }
            return;
        }

        let ignore = false;

        const fetchContext = async () => {
            setLoadingContext(true);
            try {
                const [buildingData, utilityData] = await Promise.all([
                    getByBoardingHouse(Number(state.boardingHouseId)),
                    getUtilityByBoardingHouse(Number(state.boardingHouseId)),
                ]);

                if (ignore) return;

                const nextBuildings = Array.isArray(buildingData) ? buildingData : [];
                const nextUtilities = Array.isArray(utilityData) ? utilityData : [];

                setBuildings(nextBuildings);
                setUtilities(nextUtilities);

                setState((prev) => {
                    const nextState = {...prev};
                    if (!nextBuildings.some((item) => String(item.id) === String(prev.buildingId))) {
                        nextState.buildingId = nextBuildings[0]?.id ? String(nextBuildings[0].id) : '';
                    }

                    if (!isEditMode || String(roomDetail?.boardingHouseId || '') !== String(prev.boardingHouseId)) {
                        nextState.utilityIds = prev.utilityIds.filter((utilityId) =>
                            nextUtilities.some((item) => String(item.id) === String(utilityId)));
                    }

                    return nextState;
                });
            } catch (error) {
                if (!ignore) {
                    setBuildings([]);
                    setUtilities([]);
                    message.error('Khong the tai du lieu toa nha va utility cua khu tro');
                }
            } finally {
                if (!ignore) {
                    setLoadingContext(false);
                }
            }
        };

        fetchContext();
        return () => {
            ignore = true;
        };
    }, [isEditMode, roomDetail?.boardingHouseId, state.boardingHouseId, state.buildingId]);

    const validate = () => {
        if (isQuotaExceeded) {
            message.warning('Ban da dat gioi han so phong theo goi hien tai.');
            return false;
        }
        if (!state.boardingHouseId) {
            message.error('Ban can chon khu nha tro.');
            return false;
        }
        if (!state.buildingId) {
            message.error('Ban can chon toa nha.');
            return false;
        }
        if (Number(state.area || 0) <= 0) {
            message.error('Dien tich phong phai lon hon 0.');
            return false;
        }
        if (Number(state.price || 0) <= 0) {
            message.error('Gia thue phai lon hon 0.');
            return false;
        }
        if (Number(state.maxOccupants || 0) <= 0) {
            message.error('Suc chua toi da phai tu 1 nguoi.');
            return false;
        }
        if (state.floorNumber && Number(state.floorNumber) <= 0) {
            message.error('Tang phong phai lon hon 0.');
            return false;
        }
        if (selectedBuilding?.totalFloors && state.floorNumber
            && Number(state.floorNumber) > Number(selectedBuilding.totalFloors)) {
            message.error(`Tang phong khong duoc vuot qua ${selectedBuilding.totalFloors}.`);
            return false;
        }
        if (!hasActiveContract && state.status === 'OCCUPIED') {
            message.error('Phong chi duoc chuyen sang dang thue khi co hop dong hieu luc.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const payload = {
            boardingHouseId: Number(state.boardingHouseId),
            buildingId: Number(state.buildingId),
            roomNumber: state.roomNumber.trim() || null,
            area: Number(state.area),
            price: Number(state.price),
            status: hasActiveContract ? 'OCCUPIED' : state.status,
            note: state.note.trim() || null,
            utilityIds: state.utilityIds.map((item) => Number(item)),
            floorNumber: state.floorNumber ? Number(state.floorNumber) : null,
            maxOccupants: Number(state.maxOccupants),
            hasAirConditioner: Boolean(state.hasAirConditioner),
            hasBathroom: Boolean(state.hasBathroom),
            hasKitchen: Boolean(state.hasKitchen),
        };

        setSubmitting(true);
        try {
            if (isEditMode) {
                await updateRoom(id, payload);
                message.success('Cap nhat phong thanh cong');
            } else {
                await createRoom(payload);
                invalidateQuota();
                message.success('Tao phong thanh cong');
            }
            navigate(basePath);
        } catch (error) {
            message.error(extractErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        if (isEditMode && roomDetail) {
            setState(mapRoomDetailToState(roomDetail));
            return;
        }

        setState({
            ...INITIAL_STATE,
            boardingHouseId: boardingHouses[0]?.id ? String(boardingHouses[0].id) : '',
        });
    };

    if (initializing) {
        return <div className={styles.pageLoading}>Dang tai du lieu phong...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.mainContent}>
                {/*<HeroPanel*/}
                {/*    isEditMode={isEditMode}*/}
                {/*    selectedBoardingHouse={selectedBoardingHouse}*/}
                {/*    selectedBuilding={selectedBuilding}*/}
                {/*    currentRooms={currentRooms}*/}
                {/*    maxRooms={maxRooms}*/}
                {/*    selectedUtilitiesCount={selectedUtilities.length}*/}
                {/*    hasActiveContract={hasActiveContract}*/}
                {/*    roomNumber={state.roomNumber}*/}
                {/*/>*/}

                {/*<StepsBar*/}
                {/*    steps={STEPS}*/}
                {/*    activeStep={activeStep}*/}
                {/*    onChange={setActiveStep}*/}
                {/*/>*/}

                <div className={styles.contentGrid}>
                    <div className={styles.contentMain}>
                        <IdentitySection
                            state={state}
                            patch={patch}
                            boardingHouses={boardingHouses}
                            buildings={buildings}
                            loadingContext={loadingContext}
                            selectedBuilding={selectedBuilding}
                            isEditMode={isEditMode}
                        />

                        <OperationsSection
                            state={state}
                            patch={patch}
                            selectedBuilding={selectedBuilding}
                            statusLocked={hasActiveContract}
                        />

                        <AmenitiesSection
                            state={state}
                            patch={patch}
                            utilities={utilities}
                        />
                    </div>

                    <div className={styles.contentAside}>
                        <SummarySidebar
                            state={state}
                            boardingHouseName={selectedBoardingHouse?.name}
                            buildingName={selectedBuilding?.name}
                            selectedUtilities={selectedUtilities}
                            hasActiveContract={hasActiveContract}
                            selectedBuilding={selectedBuilding}
                            isQuotaExceeded={isQuotaExceeded}
                        />
                    </div>
                </div>

                <ActionBar
                    onBack={() => navigate(basePath)}
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    submitLabel={isEditMode ? 'Lưu cấu hình phòng' : 'Tạo phòng'}
                    submittingLabel={isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
                />
            </div>
        </div>
    );
}
