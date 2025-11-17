import React from 'react';
import classNames from 'classnames/bind';
import styles from './RecordHistoryModal.module.scss';
import {Modal, Timeline, Empty, Tag} from 'antd';
import {ThunderboltOutlined, CalendarOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

// Mock history data
const mockHistory = [
    {
        id: 1,
        date: '2024-11-01',
        electricOld: 1250,
        electricNew: 1450,
        electricUsage: 200,
        waterOld: 45,
        waterNew: 52,
        waterUsage: 7,
    },
    {
        id: 2,
        date: '2024-10-01',
        electricOld: 1050,
        electricNew: 1250,
        electricUsage: 200,
        waterOld: 38,
        waterNew: 45,
        waterUsage: 7,
    },
    {
        id: 3,
        date: '2024-09-01',
        electricOld: 870,
        electricNew: 1050,
        electricUsage: 180,
        waterOld: 32,
        waterNew: 38,
        waterUsage: 6,
    },
];

const RecordHistoryModal = ({isOpen, onClose, room}) => {
    if (!room) return null;

    return (
        <Modal
            title={
                <div className={cx('modal-title')}>
                    <CalendarOutlined className={cx('title-icon')}/>
                    Lịch sử ghi chỉ số - Phòng {room.roomNumber}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            className={cx('history-modal')}
        >
            <div className={cx('modal-content')}>
                {mockHistory.length > 0 ? (
                    <Timeline
                        items={mockHistory.map((record) => ({
                            color: 'green',
                            children: (
                                <div className={cx('history-item')}>
                                    <div className={cx('history-header')}>
                    <span className={cx('history-date')}>
                      {dayjs(record.date).format('DD/MM/YYYY')}
                    </span>
                                        <Tag color="green">Đã ghi</Tag>
                                    </div>

                                    <div className={cx('history-details')}>
                                        <div className={cx('utility-record')}>
                                            <ThunderboltOutlined className={cx('utility-icon', 'electric')}/>
                                            <div className={cx('utility-info')}>
                                                <div className={cx('reading-line')}>
                          <span className={cx('reading-text')}>
                            {record.electricOld} → {record.electricNew}
                          </span>
                                                    <Tag color="orange">{record.electricUsage} kWh</Tag>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={cx('utility-record')}>
                                            <CalendarOutlined className={cx('utility-icon', 'water')}/>
                                            <div className={cx('utility-info')}>
                                                <div className={cx('reading-line')}>
                          <span className={cx('reading-text')}>
                            {record.waterOld} → {record.waterNew}
                          </span>
                                                    <Tag color="blue">{record.waterUsage} m³</Tag>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ),
                        }))}
                    />
                ) : (
                    <Empty description="Chưa có lịch sử ghi chỉ số"/>
                )}
            </div>
        </Modal>
    );
};

export default RecordHistoryModal;