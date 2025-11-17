import React from 'react';
import classNames from 'classnames/bind';
import styles from './RoomRecordGrid.module.scss';
import {Card, Row, Col, Badge, Empty, Spin, Button, Tooltip} from 'antd';
import {
    ThunderboltOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    HistoryOutlined,
    EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

const RoomRecordGrid = ({rooms, records, onRoomClick, onViewHistory, loading}) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getRoomRecord = (roomId) => {
        return records.find(r => r.roomId === roomId);
    };

    if (loading) {
        return (
            <Card className={cx('loading-card')}>
                <Spin size="large" tip="Đang tải dữ liệu..."/>
            </Card>
        );
    }

    if (!rooms || rooms.length === 0) {
        return (
            <Card className={cx('empty-card')}>
                <Empty description="Không có phòng nào"/>
            </Card>
        );
    }

    return (
        <div className={cx('room-grid')}>
            <Row gutter={[16, 16]}>
                {rooms.map((room) => {
                    const record = getRoomRecord(room.id);
                    const hasRecord = !!record;

                    return (
                        <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
                            <Card
                                hoverable
                                className={cx('room-card', hasRecord ? 'recorded' : 'pending')}
                                onClick={() => onRoomClick(room)}
                            >
                                {/* Header */}
                                <div className={cx('room-header')}>
                                    <div className={cx('room-number')}>
                                        <span className={cx('room-text')}>Phòng</span>
                                        <span className={cx('room-num')}>{room.roomNumber}</span>
                                    </div>
                                    <Badge
                                        status={hasRecord ? 'success' : 'warning'}
                                        text={hasRecord ? 'Đã ghi' : 'Chưa ghi'}
                                    />
                                </div>

                                {/* Location */}
                                <div className={cx('room-location')}>
                  <span className={cx('location-text')}>
                    {room.building} - {room.boardingHouse}
                  </span>
                                </div>

                                {/* Tenant */}
                                {room.tenantName && (
                                    <div className={cx('room-tenant')}>
                                        <UserOutlined className={cx('tenant-icon')}/>
                                        <span className={cx('tenant-name')}>{room.tenantName}</span>
                                    </div>
                                )}

                                {/* Records Display */}
                                {hasRecord ? (
                                    <div className={cx('record-display')}>
                                        {/* Electric */}
                                        <div className={cx('utility-row')}>
                                            <div className={cx('utility-header')}>
                                                <ThunderboltOutlined className={cx('utility-icon', 'electric')}/>
                                                <span className={cx('utility-label')}>Điện</span>
                                            </div>
                                            <div className={cx('utility-details')}>
                                                <div className={cx('reading-row')}>
                                                    <span className={cx('reading-label')}>Cũ:</span>
                                                    <span
                                                        className={cx('reading-value')}>{record.electricOldIndex || 0}</span>
                                                </div>
                                                <div className={cx('reading-row')}>
                                                    <span className={cx('reading-label')}>Mới:</span>
                                                    <span
                                                        className={cx('reading-value', 'new')}>{record.electricNewIndex || 0}</span>
                                                </div>
                                                <div className={cx('usage-row')}>
                                                    <span className={cx('usage-label')}>Tiêu thụ:</span>
                                                    <span
                                                        className={cx('usage-value')}>{record.electricUsage || 0} kWh</span>
                                                </div>
                                                <div className={cx('amount-row')}>
                                                    <span className={cx('amount-label')}>Thành tiền:</span>
                                                    <span className={cx('amount-value', 'electric')}>
                            {formatCurrency(record.electricAmount || 0)}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Water */}
                                        <div className={cx('utility-row')}>
                                            <div className={cx('utility-header')}>
                                                <ThunderboltOutlined className={cx('utility-icon', 'water')}/>
                                                <span className={cx('utility-label')}>Nước</span>
                                            </div>
                                            <div className={cx('utility-details')}>
                                                <div className={cx('reading-row')}>
                                                    <span className={cx('reading-label')}>Cũ:</span>
                                                    <span
                                                        className={cx('reading-value')}>{record.waterOldIndex || 0}</span>
                                                </div>
                                                <div className={cx('reading-row')}>
                                                    <span className={cx('reading-label')}>Mới:</span>
                                                    <span
                                                        className={cx('reading-value', 'new')}>{record.waterNewIndex || 0}</span>
                                                </div>
                                                <div className={cx('usage-row')}>
                                                    <span className={cx('usage-label')}>Tiêu thụ:</span>
                                                    <span
                                                        className={cx('usage-value')}>{record.waterUsage || 0} m³</span>
                                                </div>
                                                <div className={cx('amount-row')}>
                                                    <span className={cx('amount-label')}>Thành tiền:</span>
                                                    <span className={cx('amount-value', 'water')}>
                            {formatCurrency(record.waterAmount || 0)}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className={cx('total-row')}>
                                            <span className={cx('total-label')}>Tổng cộng:</span>
                                            <span className={cx('total-value')}>
                        {formatCurrency((record.electricAmount || 0) + (record.waterAmount || 0))}
                      </span>
                                        </div>

                                        {/* Recorded Time */}
                                        <div className={cx('recorded-time')}>
                                            <CheckCircleOutlined className={cx('time-icon')}/>
                                            <span className={cx('time-text')}>
                        Đã ghi: {dayjs(record.recordedAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={cx('empty-record')}>
                                        <ClockCircleOutlined className={cx('empty-icon')}/>
                                        <p className={cx('empty-text')}>Chưa ghi chỉ số</p>
                                        <p className={cx('empty-hint')}>Nhấn vào để ghi chỉ số điện nước</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className={cx('room-actions')}>
                                    <Tooltip title="Xem lịch sử">
                                        <Button
                                            type="text"
                                            icon={<HistoryOutlined/>}
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewHistory(room);
                                            }}
                                            className={cx('action-btn')}
                                        >
                                            Lịch sử
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={hasRecord ? 'Chỉnh sửa' : 'Ghi chỉ số'}>
                                        <Button
                                            type="primary"
                                            icon={hasRecord ? <EditOutlined/> : <ThunderboltOutlined/>}
                                            size="small"
                                            onClick={() => onRoomClick(room)}
                                            className={cx('action-btn', 'primary')}
                                        >
                                            {hasRecord ? 'Sửa' : 'Ghi'}
                                        </Button>
                                    </Tooltip>
                                </div>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default RoomRecordGrid;