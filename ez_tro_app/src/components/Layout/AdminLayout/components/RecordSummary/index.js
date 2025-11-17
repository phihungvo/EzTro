
import React from 'react';
import classNames from 'classnames/bind';
import styles from './RecordSummary.module.scss';
import { Card, Row, Col, Statistic } from 'antd';
import { ThunderboltOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

const RecordSummary = ({ statistics }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const cards = [
        {
            title: 'Đã ghi',
            value: statistics.recordedRooms,
            suffix: 'phòng',
            color: '#52c41a',
            icon: <CheckCircleOutlined />,
        },
        {
            title: 'Chưa ghi',
            value: statistics.pendingRooms,
            suffix: 'phòng',
            color: '#faad14',
            icon: <ClockCircleOutlined />,
        },
        {
            title: 'Điện tiêu thụ',
            value: statistics.totalElectricUsage,
            suffix: 'kWh',
            color: '#faad14',
            icon: <ThunderboltOutlined />,
        },
        {
            title: 'Nước tiêu thụ',
            value: statistics.totalWaterUsage,
            suffix: 'm³',
            color: '#1890ff',
            icon: <ThunderboltOutlined />,
        },
        {
            title: 'Tổng tiền điện',
            value: formatCurrency(statistics.totalElectricAmount),
            color: '#faad14',
            icon: <ThunderboltOutlined />,
        },
        {
            title: 'Tổng tiền nước',
            value: formatCurrency(statistics.totalWaterAmount),
            color: '#1890ff',
            icon: <ThunderboltOutlined />,
        },
    ];

    return (
        <Row gutter={[16, 16]} className={cx('summary-section')}>
            {cards.map((card, index) => (
                <Col xs={24} sm={12} lg={8} xl={4} key={index}>
                    <Card className={cx('summary-card')} style={{ borderTop: `4px solid ${card.color}` }}>
                        <Statistic
                            title={<span className={cx('card-title')}>{card.title}</span>}
                            value={card.value}
                            suffix={card.suffix}
                            prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                            valueStyle={{
                                color: card.color,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                fontFamily: 'inherit'
                            }}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default RecordSummary;