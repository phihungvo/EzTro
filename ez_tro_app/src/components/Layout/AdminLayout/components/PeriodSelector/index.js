import React from 'react';
import { Card, Button, List, Tag, Spin, Empty } from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './PeriodSelector.module.scss';

const cx = classNames.bind(styles);

function PeriodSelector({ periods, loading, onSelectPeriod, onCreateNew }) {
    console.log('PeriodSelector', periods);
    return (
        <Card title="Danh sách kỳ ghi điện nước" className={cx('period-selector-card')}>
            <div style={{ marginBottom: 20 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={onCreateNew}
                    className={cx('create-new-btn')}
                    size="large"
                >
                    Tạo kỳ ghi mới
                </Button>
            </div>

            {loading ? (
                <div className={cx('loading-container')}>
                    <Spin size="large" />
                </div>
            ) : periods.length === 0 ? (
                <div className={cx('empty-container')}>
                    <Empty
                        description="Chưa có kỳ ghi điện nước nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            ) : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                    dataSource={periods}
                    renderItem={(period) => (
                        <List.Item>
                            <Card
                                hoverable
                                onClick={() => onSelectPeriod(period)}
                                className={cx('period-item-card')}
                            >
                                <div className={cx('period-title-wrapper')}>
                                    <CalendarOutlined className={cx('period-icon')} />
                                    {period.name || `Tháng ${period.periodMonth || ''}/${period.periodYear || ''}`}
                                </div>

                                <div className={cx('period-description')}>
                                    <div className={cx('period-date')}>
                                        {period.startDate} → {period.endDate}
                                    </div>
                                    <Tag
                                        className={cx('status-tag')}
                                        color={
                                            period.status === 'ACTIVE'
                                                ? 'green'
                                                : period.status === 'COMPLETED'
                                                    ? 'blue'
                                                    : 'default'
                                        }
                                    >
                                        {period.status === 'ACTIVE'
                                            ? 'Đang ghi'
                                            : period.status === 'COMPLETED'
                                                ? 'Đã hoàn thành'
                                                : 'Chưa mở'}
                                    </Tag>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );
}

export default PeriodSelector;