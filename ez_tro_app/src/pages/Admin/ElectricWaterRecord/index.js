import React, {useState, useEffect} from 'react';
import classNames from 'classnames/bind';
import styles from './ElectricWaterRecord.module.scss';
import {
    Card,
    Row,
    Col,
    Button,
    Steps,
    message,
    Modal,
    Tag,
    Badge,
    Select,
    DatePicker,
    Space,
    Divider,
    Tooltip,
    Progress
} from 'antd';
import {
    ThunderboltOutlined,
    // WaterDropOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    SaveOutlined,
    SendOutlined,
    HistoryOutlined,
    FileTextOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {mockRooms, mockPeriods, mockRecords, electricPrice, waterPrice} from './mockData';
import RecordSummary from "~/components/Layout/AdminLayout/components/RecordSummary";
import RecordPeriodSelector from "~/components/Layout/AdminLayout/components/RecordPeriodSelector";
import RoomRecordGrid from "~/components/Layout/AdminLayout/components/RoomRecordGrid";
import RecordInputModal from "~/components/Layout/AdminLayout/components/RecordInputModal";
import RecordHistoryModal from "~/components/Layout/AdminLayout/components/RecordHistoryModal";

const cx = classNames.bind(styles);
const {Option} = Select;

function ElectricWaterRecord() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [records, setRecords] = useState([]);
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Filters
    const [boardingHouseFilter, setBoardingHouseFilter] = useState('ALL');
    const [buildingFilter, setBuildingFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchText, setSearchText] = useState('');

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

    useEffect(() => {
        loadRooms();
    }, [selectedPeriod]);

    useEffect(() => {
        calculateStatistics();
    }, [records]);

    const loadRooms = () => {
        setLoading(true);
        setTimeout(() => {
            const roomsData = [...mockRooms];

            // Load existing records for this period
            const periodRecords = selectedPeriod
                ? mockRecords.filter(r => r.periodId === selectedPeriod.id)
                : [];

            setRecords(periodRecords);
            setRooms(roomsData);
            setLoading(false);
        }, 500);
    };

    const calculateStatistics = () => {
        const total = rooms.length;
        const recorded = records.filter(r => r.status === 'RECORDED').length;
        const pending = total - recorded;
        const completionRate = total > 0 ? (recorded / total) * 100 : 0;

        const totalElectricUsage = records.reduce((sum, r) => sum + (r.electricUsage || 0), 0);
        const totalWaterUsage = records.reduce((sum, r) => sum + (r.waterUsage || 0), 0);
        const totalElectricAmount = records.reduce((sum, r) => sum + (r.electricAmount || 0), 0);
        const totalWaterAmount = records.reduce((sum, r) => sum + (r.waterAmount || 0), 0);

        setStatistics({
            totalRooms: total,
            recordedRooms: recorded,
            pendingRooms: pending,
            completionRate,
            totalElectricUsage,
            totalWaterUsage,
            totalElectricAmount,
            totalWaterAmount,
        });
    };

    const handleSelectPeriod = (period) => {
        setSelectedPeriod(period);
        setCurrentStep(1);
        message.success(`Đã chọn kỳ ghi: ${period.name}`);
    };

    const handleRoomClick = (room) => {
        if (!selectedPeriod) {
            message.warning('Vui lòng chọn kỳ ghi trước!');
            return;
        }

        const existingRecord = records.find(r => r.roomId === room.id);
        setSelectedRoom({...room, record: existingRecord});
        setIsInputModalOpen(true);
    };

    const handleSaveRecord = (recordData) => {
        const existingIndex = records.findIndex(r => r.roomId === recordData.roomId);

        let newRecords;
        if (existingIndex >= 0) {
            newRecords = [...records];
            newRecords[existingIndex] = {
                ...newRecords[existingIndex],
                ...recordData,
                status: 'RECORDED',
                recordedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            };
        } else {
            newRecords = [...records, {
                ...recordData,
                id: Date.now(),
                periodId: selectedPeriod.id,
                status: 'RECORDED',
                recordedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }];
        }

        setRecords(newRecords);
        setIsInputModalOpen(false);
        message.success('Lưu chỉ số thành công!');
    };

    const handleViewHistory = (room) => {
        setSelectedRoom(room);
        setIsHistoryModalOpen(true);
    };

    const handleSubmitAll = () => {
        if (statistics.pendingRooms > 0) {
            Modal.confirm({
                title: 'Còn phòng chưa ghi chỉ số',
                content: `Còn ${statistics.pendingRooms} phòng chưa được ghi. Bạn có muốn tiếp tục gửi không?`,
                okText: 'Tiếp tục',
                cancelText: 'Hủy',
                onOk: () => setIsSubmitModalOpen(true),
            });
        } else {
            setIsSubmitModalOpen(true);
        }
    };

    const handleConfirmSubmit = () => {
        setLoading(true);
        setTimeout(() => {
            message.success('Đã gửi dữ liệu thành công! Hóa đơn đã được tạo.');
            setIsSubmitModalOpen(false);
            setLoading(false);
            // Reset to new period
            setCurrentStep(0);
            setSelectedPeriod(null);
            setRecords([]);
        }, 1500);
    };

    const getFilteredRooms = () => {
        let filtered = [...rooms];

        if (boardingHouseFilter !== 'ALL') {
            filtered = filtered.filter(r => r.boardingHouse === boardingHouseFilter);
        }

        if (buildingFilter !== 'ALL') {
            filtered = filtered.filter(r => r.building === buildingFilter);
        }

        if (statusFilter !== 'ALL') {
            const hasRecord = statusFilter === 'RECORDED';
            filtered = filtered.filter(r => {
                const record = records.find(rec => rec.roomId === r.id);
                return hasRecord ? !!record : !record;
            });
        }

        if (searchText) {
            filtered = filtered.filter(r =>
                r.roomNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                r.tenantName?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        return filtered;
    };

    const steps = [
        {
            title: 'Chọn kỳ ghi',
            icon: <CalendarOutlined/>,
        },
        {
            title: 'Ghi chỉ số',
            icon: <FileTextOutlined/>,
        },
        {
            title: 'Hoàn thành',
            icon: <CheckCircleOutlined/>,
        },
    ];

    return (
        <div className={cx('record-wrapper')}>
            {/* Progress Steps */}
            <Card className={cx('steps-card')}>
                <Steps current={currentStep} items={steps}/>
            </Card>

            {/* Step 1: Period Selector */}
            {currentStep === 0 && (
                <RecordPeriodSelector
                    periods={mockPeriods}
                    onSelectPeriod={handleSelectPeriod}
                />
            )}

            {/* Step 2: Record Input */}
            {currentStep === 1 && selectedPeriod && (
                <>
                    {/* Period Info & Statistics */}
                    <Card className={cx('period-info-card')}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} lg={12}>
                                <div className={cx('period-info')}>
                                    <h3 className={cx('period-title')}>
                                        <CalendarOutlined className={cx('period-icon')}/>
                                        {selectedPeriod.name}
                                    </h3>
                                    <div className={cx('period-details')}>
                    <span className={cx('period-date')}>
                      {dayjs(selectedPeriod.startDate).format('DD/MM/YYYY')}
                        {' → '}
                        {dayjs(selectedPeriod.endDate).format('DD/MM/YYYY')}
                    </span>
                                        <Tag color={selectedPeriod.status === 'ACTIVE' ? 'green' : 'orange'}>
                                            {selectedPeriod.status === 'ACTIVE' ? 'Đang ghi' : 'Chờ ghi'}
                                        </Tag>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div className={cx('completion-progress')}>
                                    <div className={cx('progress-header')}>
                                        <span className={cx('progress-label')}>Tiến độ ghi:</span>
                                        <span className={cx('progress-value')}>
                      {statistics.recordedRooms}/{statistics.totalRooms} phòng
                    </span>
                                    </div>
                                    <Progress
                                        percent={statistics.completionRate}
                                        strokeColor={{
                                            '0%': '#722ed1',
                                            '100%': '#52c41a',
                                        }}
                                        format={(percent) => `${percent.toFixed(0)}%`}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* Summary Statistics */}
                    <RecordSummary statistics={statistics}/>

                    {/* Filters */}
                    <Card className={cx('filter-card')}>
                        <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    value={boardingHouseFilter}
                                    onChange={setBoardingHouseFilter}
                                    style={{width: '100%'}}
                                    placeholder="Khu trọ"
                                >
                                    <Option value="ALL">Tất cả khu trọ</Option>
                                    <Option value="Nhà trọ Sunshine">Nhà trọ Sunshine</Option>
                                    <Option value="Nhà trọ Green Park">Nhà trọ Green Park</Option>
                                    <Option value="Nhà trọ Sky View">Nhà trọ Sky View</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    value={buildingFilter}
                                    onChange={setBuildingFilter}
                                    style={{width: '100%'}}
                                    placeholder="Toà nhà"
                                >
                                    <Option value="ALL">Tất cả toà</Option>
                                    <Option value="Toà A">Toà A</Option>
                                    <Option value="Toà B">Toà B</Option>
                                    <Option value="Toà C">Toà C</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    style={{width: '100%'}}
                                    placeholder="Trạng thái"
                                >
                                    <Option value="ALL">Tất cả trạng thái</Option>
                                    <Option value="RECORDED">Đã ghi</Option>
                                    <Option value="PENDING">Chưa ghi</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Space.Compact style={{width: '100%'}}>
                                    <input
                                        type="text"
                                        placeholder="Tìm phòng, người thuê..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className={cx('search-input')}
                                    />
                                    <Button icon={<SearchOutlined/>}/>
                                </Space.Compact>
                            </Col>
                        </Row>
                    </Card>

                    {/* Room Grid */}
                    <RoomRecordGrid
                        rooms={getFilteredRooms()}
                        records={records}
                        onRoomClick={handleRoomClick}
                        onViewHistory={handleViewHistory}
                        loading={loading}
                    />

                    {/* Action Buttons */}
                    <Card className={cx('action-card')}>
                        <Row gutter={16} justify="space-between">
                            <Col>
                                <Button
                                    size="large"
                                    onClick={() => {
                                        setCurrentStep(0);
                                        setSelectedPeriod(null);
                                        setRecords([]);
                                    }}
                                >
                                    Chọn lại kỳ ghi
                                </Button>
                            </Col>
                            <Col>
                                <Space size="middle">
                                    <Button
                                        type="default"
                                        size="large"
                                        icon={<SaveOutlined/>}
                                        onClick={() => message.info('Đã lưu nháp!')}
                                    >
                                        Lưu nháp
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<SendOutlined/>}
                                        onClick={handleSubmitAll}
                                        disabled={statistics.recordedRooms === 0}
                                    >
                                        Gửi và Tạo hóa đơn ({statistics.recordedRooms})
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                </>
            )}

            {/* Modals */}
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

            {/* Submit Confirmation Modal */}
            <Modal
                title="Xác nhận gửi dữ liệu"
                open={isSubmitModalOpen}
                onCancel={() => setIsSubmitModalOpen(false)}
                onOk={handleConfirmSubmit}
                okText="Xác nhận gửi"
                cancelText="Hủy"
                confirmLoading={loading}
                width={600}
            >
                <div className={cx('submit-modal-content')}>
                    <div className={cx('warning-box')}>
                        <ExclamationCircleOutlined className={cx('warning-icon')}/>
                        <p>Sau khi gửi, hệ thống sẽ tự động tạo hóa đơn điện nước cho các phòng đã ghi.</p>
                    </div>

                    <Divider/>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div className={cx('summary-item')}>
                                <span className={cx('summary-label')}>Tổng số phòng:</span>
                                <span className={cx('summary-value')}>{statistics.totalRooms}</span>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className={cx('summary-item')}>
                                <span className={cx('summary-label')}>Đã ghi:</span>
                                <span className={cx('summary-value', 'success')}>{statistics.recordedRooms}</span>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className={cx('summary-item')}>
                                <span className={cx('summary-label')}>Chưa ghi:</span>
                                <span className={cx('summary-value', 'warning')}>{statistics.pendingRooms}</span>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className={cx('summary-item')}>
                                <span className={cx('summary-label')}>Hoàn thành:</span>
                                <span className={cx('summary-value', 'primary')}>
                  {statistics.completionRate.toFixed(0)}%
                </span>
                            </div>
                        </Col>
                    </Row>

                    <Divider/>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <div className={cx('amount-summary')}>
                                <div className={cx('amount-row')}>
                                    <ThunderboltOutlined className={cx('amount-icon', 'electric')}/>
                                    <span className={cx('amount-label')}>Tổng tiền điện:</span>
                                    <span className={cx('amount-value', 'electric')}>
                    {new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'})
                        .format(statistics.totalElectricAmount)}
                  </span>
                                </div>
                                <div className={cx('amount-row')}>
                                    <ThunderboltOutlined className={cx('amount-icon', 'water')}/>
                                    <span className={cx('amount-label')}>Tổng tiền nước:</span>
                                    <span className={cx('amount-value', 'water')}>
                    {new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'})
                        .format(statistics.totalWaterAmount)}
                  </span>
                                </div>
                                <Divider style={{margin: '12px 0'}}/>
                                <div className={cx('amount-row', 'total')}>
                                    <span className={cx('amount-label')}>Tổng cộng:</span>
                                    <span className={cx('amount-value', 'total')}>
                    {new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'})
                        .format(statistics.totalElectricAmount + statistics.totalWaterAmount)}
                  </span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Modal>
        </div>
    );
}

export default ElectricWaterRecord;

