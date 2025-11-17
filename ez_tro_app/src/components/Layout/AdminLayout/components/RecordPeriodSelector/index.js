import React from 'react';
import classNames from 'classnames/bind';
import styles from './RecordPeriodSelector.module.scss';
import {Card, Row, Col, Tag, Empty} from 'antd';
import {CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

const RecordPeriodSelector = ({periods, onSelectPeriod}) => {
    if (!periods || periods.length === 0) {
        return (
            <Card className={cx('empty-card')}>
                <Empty description="Không có kỳ ghi nào"/>
            </Card>
        );
    }

    return (
        <div className={cx('period-selector')}>
            <h3 className={cx('section-title')}>
                <CalendarOutlined className={cx('section-icon')}/>
                Chọn kỳ ghi điện nước
            </h3>

            <Row gutter={[16, 16]}>
                {periods.map((period) => (
                    <Col xs={24} sm={12} lg={8} key={period.id}>
                        <Card
                            hoverable
                            className={cx('period-card', period.status === 'ACTIVE' ? 'active' : 'pending')}
                            onClick={() => onSelectPeriod(period)}
                        >
                            <div className={cx('period-header')}>
                                <div className={cx('period-name')}>{period.name}</div>
                                <Tag
                                    icon={period.status === 'ACTIVE' ? <CheckCircleOutlined/> : <ClockCircleOutlined/>}
                                    color={period.status === 'ACTIVE' ? 'success' : 'warning'}
                                >
                                    {period.status === 'ACTIVE' ? 'Đang ghi' : 'Chờ ghi'}
                                </Tag>
                            </div>

                            <div className={cx('period-dates')}>
                                <div className={cx('date-row')}>
                                    <span className={cx('date-label')}>Từ ngày:</span>
                                    <span
                                        className={cx('date-value')}>{dayjs(period.startDate).format('DD/MM/YYYY')}</span>
                                </div>
                                <div className={cx('date-row')}>
                                    <span className={cx('date-label')}>Đến ngày:</span>
                                    <span
                                        className={cx('date-value')}>{dayjs(period.endDate).format('DD/MM/YYYY')}</span>
                                </div>
                            </div>

                            <div className={cx('period-stats')}>
                                <div className={cx('stat-item')}>
                                    <span className={cx('stat-label')}>Số phòng:</span>
                                    <span className={cx('stat-value')}>{period.totalRooms}</span>
                                </div>
                                <div className={cx('stat-item')}>
                                    <span className={cx('stat-label')}>Đã ghi:</span>
                                    <span className={cx('stat-value', 'recorded')}>{period.recordedRooms || 0}</span>
                                </div>
                            </div>

                            {period.description && (
                                <div className={cx('period-description')}>
                                    {period.description}
                                </div>
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default RecordPeriodSelector;

