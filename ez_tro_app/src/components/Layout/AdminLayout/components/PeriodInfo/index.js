import React from 'react';
import { Card, Row, Col, Tag, Progress } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import styles from './PeriodInfo.module.scss';

const cx = classNames.bind(styles);

function PeriodInfo({ period }) {
    if (!period) return null;
    console.log('period', period);

    return (
        <Card className={cx('period-info-card')}>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <div className={cx('period-info')}>
                        <h3 className={cx('period-title')}>
                            <CalendarOutlined className={cx('period-icon')} />
                            {period.name}
                        </h3>
                        <div className={cx('period-details')}>
              <span className={cx('period-date')}>
                {dayjs(period.startDate).format('DD/MM/YYYY')} →{' '}
                  {dayjs(period.endDate).format('DD/MM/YYYY')}
              </span>
                            <Tag color={period.status === 'ACTIVE' ? 'green' : 'orange'}>
                                {period.status === 'ACTIVE' ? 'Đang ghi' : 'Chờ ghi'}
                            </Tag>
                        </div>
                    </div>
                </Col>

                {/* Bạn có thể thêm progress nếu đã có statistics ở đây,
            nhưng thường progress nằm ở StatisticsSummary */}
            </Row>
        </Card>
    );
}

export default PeriodInfo;