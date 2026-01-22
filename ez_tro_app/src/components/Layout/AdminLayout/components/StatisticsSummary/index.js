import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { ThunderboltOutlined, DropboxOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './StatisticsSummary.module.scss';

const cx = classNames.bind(styles);

function StatisticsSummary({ statistics }) {
    const {
        totalRooms,
        recordedRooms,
        pendingRooms,
        completionRate,
        totalElectricUsage,
        totalWaterUsage,
        totalElectricAmount,
        totalWaterAmount,
    } = statistics;

    return (
        <Card title="Tổng quan kỳ ghi" className={cx('summary-card')}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Statistic title="Tổng phòng" value={totalRooms} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Statistic title="Đã ghi" value={recordedRooms} valueStyle={{ color: '#3f8600' }} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Statistic title="Chưa ghi" value={pendingRooms} valueStyle={{ color: '#cf1322' }} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Statistic
                        title="Tiến độ"
                        value={completionRate}
                        suffix="%"
                        valueStyle={{ color: completionRate > 80 ? '#3f8600' : '#faad14' }}
                    />
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Statistic
                        title="Tổng điện dùng (kWh)"
                        value={totalElectricUsage}
                        precision={2}
                        prefix={<ThunderboltOutlined />}
                    />
                    <Statistic
                        title="Tổng tiền điện"
                        value={totalElectricAmount}
                        precision={0}
                        prefix="₫"
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Col>
                <Col span={12}>
                    <Statistic
                        title="Tổng nước dùng (m³)"
                        value={totalWaterUsage}
                        precision={2}
                        prefix={<DropboxOutlined />}
                    />
                    <Statistic
                        title="Tổng tiền nước"
                        value={totalWaterAmount}
                        precision={0}
                        prefix="₫"
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Col>
            </Row>

            <Progress
                percent={completionRate}
                status={completionRate === 100 ? 'success' : 'active'}
                strokeColor={{
                    '0%': '#722ed1',
                    '100%': '#52c41a',
                }}
                style={{ marginTop: 24 }}
            />
        </Card>
    );
}

export default StatisticsSummary;