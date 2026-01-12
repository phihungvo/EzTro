import React, {useState, useEffect, useCallback} from 'react';
import classNames from 'classnames/bind';
import styles from './ElectricWaterRecord.module.scss';
// import styles from './Bill.module.scss';

import {Steps, Card, message, Modal} from 'antd';
import {CalendarOutlined, FileTextOutlined, CheckCircleOutlined} from '@ant-design/icons';

// import PeriodSelector from './components/PeriodSelector';
// import PeriodCreateModal from './components/PeriodCreateModal';
// import PeriodInfo from './components/PeriodInfo';
// import StatisticsSummary from './components/StatisticsSummary';
// import FilterBar from './components/FilterBar';
// import RoomRecordGrid from './components/RoomRecordGrid';
// import ActionButtons from './components/ActionButtons';
//
// import RecordInputModal from './components/modals/RecordInputModal';
// import RecordHistoryModal from './components/modals/RecordHistoryModal';

// API services (bạn sẽ implement sau)
// import {
//     fetchPeriods,
//     createPeriod,
//     fetchRooms,
//     fetchRecordsByPeriod,
//     saveRoomRecord,
//     submitPeriodRecords,
// } from '@/services/electricWaterApi'; // ← bạn tạo file này

import {mockRooms, mockPeriods, mockRecords, electricPrice, waterPrice} from './mockData';
import PeriodSelector from "~/components/Layout/AdminLayout/components/PeriodSelector";
import PeriodInfo from "~/components/Layout/AdminLayout/components/PeriodInfo";
import StatisticsSummary from "~/components/Layout/AdminLayout/components/StatisticsSummary";
import FilterBar from "~/components/Layout/AdminLayout/components/FilterBar";
import RoomRecordGrid from "~/components/Layout/AdminLayout/components/RoomRecordGrid";
import ActionButtons from "~/components/Layout/AdminLayout/components/ActionButtons";
import PeriodCreateModal from "~/components/Layout/AdminLayout/components/PeriodCreateModal";
import RecordInputModal from "~/components/Layout/AdminLayout/components/RecordInputModal";
import RecordHistoryModal from "~/components/Layout/AdminLayout/components/RecordHistoryModal";
import {getAllPeriodNoPaging, createPeriod} from "~/service/admin/meter-reading-period";
import {getAllRoomNoPaged} from "~/service/admin/room";

const cx = classNames.bind(styles);

const steps = [
    {title: 'Chọn kỳ ghi', icon: <CalendarOutlined/>},
    {title: 'Ghi chỉ số', icon: <FileTextOutlined/>},
    {title: 'Hoàn thành', icon: <CheckCircleOutlined/>},
];

function ElectricWaterRecord() {
    const [currentStep, setCurrentStep] = useState(0);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [boardingHouseFilter, setBoardingHouseFilter] = useState('ALL');
    const [buildingFilter, setBuildingFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchText, setSearchText] = useState('');

    // Modals
    const [isCreatePeriodOpen, setIsCreatePeriodOpen] = useState(false);
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Statistics
    const [statistics, setStatistics] = useState({
        totalRooms: 0,
        recordedRooms: 0,
        pendingRooms: 0,
        completionRate: 0,
        totalElectricUsage: 0,
        totalWaterUsage: 0,
        totalElectricAmount: 0,
        totalWaterAmount: 0,
    });

    // Load danh sách kỳ hạn
    const loadPeriods = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllPeriodNoPaging();
            setPeriods(data || []);
        } catch (error) {
            message.error('Không tải được danh sách kỳ hạn');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPeriods();
    }, [loadPeriods]);

    // Khi chọn kỳ → load rooms + records
    useEffect(() => {
        if (!selectedPeriod) {
            setRooms([]);
            setRecords([]);
            setCurrentStep(0);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                const [roomsData, recordsData] = await Promise.all([
                    getAllRoomNoPaged(),
                    // fetchRecordsByPeriod(selectedPeriod.id),
                ]);

                setRooms(roomsData || []);
                setRecords(recordsData || []);
                setCurrentStep(1);
            } catch (err) {
                message.error('Lỗi khi tải dữ liệu phòng/kỳ');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedPeriod]);

    // Tính thống kê
    useEffect(() => {
        if (!rooms.length) return;

        const total = rooms.length;
        const recorded = records.filter(r => r.status === 'RECORDED').length;
        const pending = total - recorded;
        const completion = total > 0 ? (recorded / total) * 100 : 0;

        const totalElecUsage = records.reduce((sum, r) => sum + (r.electricUsage || 0), 0);
        const totalWaterUsage = records.reduce((sum, r) => sum + (r.waterUsage || 0), 0);
        const totalElecAmount = records.reduce((sum, r) => sum + (r.electricAmount || 0), 0);
        const totalWaterAmount = records.reduce((sum, r) => sum + (r.waterAmount || 0), 0);

        setStatistics({
            totalRooms: total,
            recordedRooms: recorded,
            pendingRooms: pending,
            completionRate: completion,
            totalElectricUsage: totalElecUsage,
            totalWaterUsage,
            totalElectricAmount: totalElecAmount,
            totalWaterAmount,
        });
    }, [rooms, records]);

    // Xử lý tạo kỳ mới
    const handleCreatePeriod = async (periodData) => {
        try {
            setLoading(true);
            const newPeriod = await createPeriod(periodData);
            // message.success('Tạo kỳ hạn mới thành công');
            setIsCreatePeriodOpen(false);

            // Reload danh sách kỳ & tự chọn kỳ vừa tạo
            await loadPeriods();
            setSelectedPeriod(newPeriod);
        } catch (err) {
            message.error('Tạo kỳ thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Chọn kỳ từ danh sách
    const handleSelectPeriod = (period) => {
        setSelectedPeriod(period);
        message.success(`Đã chọn kỳ: ${period.name}`);
    };

    // Lưu chỉ số 1 phòng
    const handleSaveRecord = async (recordData) => {
        try {
            // const savedRecord = await saveRoomRecord({
            //     ...recordData,
            //     periodId: selectedPeriod.id,
            // });
            //
            // setRecords(prev => {
            //     const exists = prev.find(r => r.roomId === recordData.roomId);
            //     if (exists) {
            //         return prev.map(r =>
            //             r.roomId === recordData.roomId ? { ...r, ...savedRecord } : r
            //         );
            //     }
            //     return [...prev, savedRecord];
            // });

            message.success('Lưu chỉ số thành công');
            setIsInputModalOpen(false);
        } catch (err) {
            message.error('Lưu chỉ số thất bại');
        }
    };

    // Gửi toàn bộ
    const handleSubmitAll = () => {
        if (statistics.pendingRooms > 0) {
            Modal.confirm({
                title: 'Còn phòng chưa ghi chỉ số',
                content: `Còn ${statistics.pendingRooms} phòng chưa ghi. Vẫn gửi?`,
                okText: 'Tiếp tục',
                cancelText: 'Hủy',
                onOk: () => setIsSubmitModalOpen(true),
            });
            return;
        }
        setIsSubmitModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        try {
            // await submitPeriodRecords(selectedPeriod.id);
            message.success('Gửi dữ liệu và tạo hóa đơn thành công!');
            setIsSubmitModalOpen(false);
            setSelectedPeriod(null);
            setCurrentStep(0);
            await loadPeriods();
        } catch (err) {
            message.error('Gửi dữ liệu thất bại');
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = rooms.filter(room => {
        const matchesBoarding =
            boardingHouseFilter === 'ALL' || room.boardingHouse === boardingHouseFilter;
        const matchesBuilding =
            buildingFilter === 'ALL' || room.building === buildingFilter;
        const record = records.find(r => r.roomId === room.id);
        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'RECORDED' && !!record) ||
            (statusFilter === 'PENDING' && !record);
        const matchesSearch =
            !searchText ||
            room.roomNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            (room.tenantName?.toLowerCase().includes(searchText.toLowerCase()) ?? false);

        return matchesBoarding && matchesBuilding && matchesStatus && matchesSearch;
    });

    //
    // Xử lý trường hợp selectedPeriod là mảng //// cần thiết
    const safeSelectedPeriod = Array.isArray(selectedPeriod) && selectedPeriod.length > 0
        ? selectedPeriod[0]
        : selectedPeriod;

    return (
        <div className={cx('record-wrapper')}>
            <Card className={cx('steps-card')}>
                <Steps current={currentStep} items={steps}/>
            </Card>

            {/* Bước 0 - Chọn kỳ */}
            {currentStep === 0 && (
                <PeriodSelector
                    periods={periods}
                    loading={loading}
                    onSelectPeriod={handleSelectPeriod}
                    onCreateNew={() => setIsCreatePeriodOpen(true)}
                />
            )}

            {/* Bước 1 - Ghi chỉ số */}
            {currentStep === 1 && selectedPeriod && (
                <>
                    <PeriodInfo period={safeSelectedPeriod}/>
                    <StatisticsSummary statistics={statistics}/>
                    <FilterBar
                        boardingHouseFilter={boardingHouseFilter}
                        setBoardingHouseFilter={setBoardingHouseFilter}
                        buildingFilter={buildingFilter}
                        setBuildingFilter={setBuildingFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        searchText={searchText}
                        setSearchText={setSearchText}
                    />
                    <RoomRecordGrid
                        rooms={filteredRooms}
                        records={records}
                        loading={loading}
                        onRoomClick={room => {
                            setSelectedRoom(room);
                            setIsInputModalOpen(true);
                        }}
                        onViewHistory={room => {
                            setSelectedRoom(room);
                            setIsHistoryModalOpen(true);
                        }}
                    />
                    <ActionButtons
                        onBack={() => {
                            setSelectedPeriod(null);
                            setCurrentStep(0);
                        }}
                        onSaveDraft={() => message.info('Đã lưu nháp (chưa implement)')}
                        onSubmit={handleSubmitAll}
                        disabledSubmit={statistics.recordedRooms === 0}
                        recordedCount={statistics.recordedRooms}
                    />
                </>
            )}

            {/* Modals */}
            <PeriodCreateModal
                open={isCreatePeriodOpen}
                onCancel={() => setIsCreatePeriodOpen(false)}
                onCreate={handleCreatePeriod}
                loading={loading}
            />

            <RecordInputModal
                isOpen={isInputModalOpen}
                onClose={() => setIsInputModalOpen(false)}
                room={selectedRoom}
                period={selectedPeriod}
                onSave={handleSaveRecord}
                electricPrice={electricPrice}
                waterPrice={waterPrice}
            />

            <RecordHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                room={selectedRoom}
            />

            {/* Modal xác nhận gửi */}
            {/* Bạn có thể giữ nguyên phần Modal submit như cũ hoặc tách thành component riêng */}
            {/* ... giữ nguyên code Modal submit của bạn ở đây ... */}
        </div>
    );
}

export default ElectricWaterRecord;