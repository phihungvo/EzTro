// src/components/OperatingCostTracker/CostStatsOverview.jsx
import React from 'react';
import { Card, Row, Col, Statistic, Progress, Badge, Divider } from 'antd';
import {
    DollarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    AlertOutlined,
    TrophyOutlined,
    RiseOutlined,
    FallOutlined
} from '@ant-design/icons';
import styles from './CostStatsOverview.module.scss';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <Card className={styles.statCard}>
        <Statistic
            title={title}
            value={value}
            prefix={icon}
            valueStyle={{ color }}
            formatter={formatCurrency}
        />
        {trend && (
            <div className={styles.trend}>
                {trend === 'up' ? (
                    <span className={styles.up}>
            <RiseOutlined /> {trendValue}
          </span>
                ) : (
                    <span className={styles.down}>
            <FallOutlined /> {trendValue}
          </span>
                )}
                <span className={styles.label}>so với tháng trước</span>
            </div>
        )}
    </Card>
);

const CostStatsOverview = ({ statistics, categoryStats, mockBudgets, categoryConfig }) => {
    const totalBudget = Object.values(mockBudgets).reduce((sum, b) => sum + b.monthly, 0);

    return (
        <div className={styles.statsOverview}>
            {/* 4 card thống kê */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Tổng chi phí"
                        value={statistics.totalCost}
                        icon={<DollarOutlined />}
                        color="#ff4d4f"
                        trend={statistics.vsLastMonth > 0 ? 'up' : 'down'}
                        trendValue={`${Math.abs(statistics.vsLastMonth).toFixed(1)}%`}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard title="Đã thanh toán" value={statistics.paidCost} icon={<CheckCircleOutlined />} color="#52c41a" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard title="Chờ thanh toán" value={statistics.pendingCost} icon={<ClockCircleOutlined />} color="#faad14" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard title="Quá hạn" value={statistics.overdueCost} icon={<AlertOutlined />} color="#ff4d4f" />
                </Col>
            </Row>

            {/* Tổng quan ngân sách */}
            <Card className={styles.budgetCard}>
                <div className={styles.title}>
                    <TrophyOutlined className={styles.icon} />
                    Tổng quan Ngân sách
                </div>

                <div className={styles.budgetHeader}>
          <span className={styles.totalBudget}>
            Tổng ngân sách tháng: {formatCurrency(totalBudget)}
          </span>
                    <span className={`${styles.usedPercent} ${statistics.vsBudget > 100 ? styles.over : styles.safe}`}>
            Đã sử dụng: {statistics.vsBudget.toFixed(1)}%
          </span>
                </div>

                <Progress
                    percent={statistics.vsBudget}
                    strokeColor={statistics.vsBudget > 100 ? '#ff4d4f' : statistics.vsBudget > 90 ? '#faad14' : '#52c41a'}
                    status={statistics.vsBudget > 100 ? 'exception' : 'active'}
                />

                <Divider className={styles.divider} />

                <Row gutter={[16, 16]}>
                    {categoryStats.map((stat) => {
                        const config = categoryConfig[stat.category];
                        const isOver = stat.percentage > 100;
                        const isNear = stat.percentage > 90;

                        return (
                            <Col xs={24} sm={12} lg={8} key={stat.category}>
                                <div className={styles.categoryCard}>
                                    <div className={styles.header}>
                                        <span className={styles.icon}>{config.icon}</span>
                                        <span className={styles.label}>{config.label}</span>
                                        {isOver && <Badge count="Vượt" className={styles.badge} style={{ background: '#ff4d4f' }} />}
                                        {!isOver && isNear && <Badge count="Gần đạt" className={styles.badge} style={{ background: '#faad14' }} />}
                                    </div>

                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Đã dùng:</span>
                                        <span className={`${styles.value} ${isOver ? styles.over : ''}`}>
                      {formatCurrency(stat.total)}
                    </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Ngân sách:</span>
                                        <span className={styles.budget}>{formatCurrency(stat.budget)}</span>
                                    </div>

                                    <Progress
                                        percent={Math.min(stat.percentage, 100)}
                                        strokeColor={isOver ? '#ff4d4f' : isNear ? '#faad14' : '#52c41a'}
                                        showInfo={false}
                                        size="small"
                                        className={styles.progress}
                                    />

                                    <div className={`${styles.footer} ${isOver ? styles.over : styles.safe}`}>
                                        {isOver
                                            ? `Vượt ${formatCurrency(Math.abs(stat.remaining))}`
                                            : `Còn ${formatCurrency(stat.remaining)}`}
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </Card>
        </div>
    );
};

export default CostStatsOverview;