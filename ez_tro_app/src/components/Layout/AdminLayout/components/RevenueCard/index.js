// src/components/Layout/AdminLayout/components/RevenueCard/RevenueCard.jsx
import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './RevenueCard.module.scss';
import { Card, Progress } from 'antd';
import {
    DollarOutlined,
    HomeOutlined,
    UserOutlined,
    EyeOutlined,
    CalendarOutlined,
    ThunderboltOutlined,
    FireOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import dayjs from 'dayjs';

const cx = classNames.bind(cardStyles);

const RevenueCard = ({ revenue, onView, renderStatusTag, formatCurrency }) => {
    const paymentPercentage = (revenue.paidAmount / revenue.totalRevenue) * 100;
    const remaining = revenue.totalRevenue - revenue.paidAmount;

    return (
        <Card hoverable className={cx('revenue-card')}>
            {/* Header */}
            <div className={cx('card-header')}>
                <div className={cx('header-main')}>
                    <DollarOutlined className={cx('dollar-icon')} />
                    <div>
                        <h3 className={cx('revenue-code')}>{revenue.revenueCode}</h3>
                        <span className={cx('month-label')}>
                            <CalendarOutlined style={{ marginRight: '4px' }} />
                            Tháng {dayjs(revenue.month).format('MM/YYYY')}
                        </span>
                    </div>
                </div>
                {renderStatusTag(revenue.status)}
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                {/* Người thuê */}
                <div className={cx('info-row', 'highlight')}>
                    <UserOutlined className={cx('icon')} />
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Người thuê</span>
                        <span className={cx('value', 'primary')}>{revenue.tenantName}</span>
                    </div>
                </div>

                {/* Phòng */}
                <div className={cx('info-row')}>
                    <HomeOutlined className={cx('icon')} />
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Phòng</span>
                        <span className={cx('value')}>
                            P.{revenue.roomNumber} - {revenue.buildingName}
                        </span>
                    </div>
                </div>

                {/* Khu trọ */}
                <div className={cx('info-item')}>
                    <span className={cx('label')}>Khu trọ</span>
                    <span className={cx('value')}>{revenue.boardingHouseName}</span>
                </div>

                {/* Các khoản phí */}
                <div className={cx('fees-section')}>
                    <h4 className={cx('section-title')}>Chi tiết phí</h4>
                    <div className={cx('fee-grid')}>
                        <div className={cx('fee-item')}>
                            <span className={cx('fee-label')}>Tiền phòng</span>
                            <span className={cx('fee-value')}>{formatCurrency(revenue.roomPrice)}</span>
                        </div>
                        <div className={cx('fee-item')}>
                            <ThunderboltOutlined className={cx('fee-icon', 'electric')} />
                            <span className={cx('fee-label')}>Điện</span>
                            <span className={cx('fee-value')}>{formatCurrency(revenue.electricityFee)}</span>
                        </div>
                        <div className={cx('fee-item')}>
                            <FireOutlined className={cx('fee-icon', 'water')} />
                            <span className={cx('fee-label')}>Nước</span>
                            <span className={cx('fee-value')}>{formatCurrency(revenue.waterFee)}</span>
                        </div>
                        <div className={cx('fee-item')}>
                            <span className={cx('fee-label')}>Khác</span>
                            <span className={cx('fee-value')}>
                                {formatCurrency(revenue.internetFee + revenue.parkingFee + revenue.cleaningFee + revenue.otherFees)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tổng tiền */}
                <div className={cx('total-section')}>
                    <div className={cx('total-row')}>
                        <span className={cx('total-label')}>Tổng cộng</span>
                        <span className={cx('total-value')}>{formatCurrency(revenue.totalRevenue)}</span>
                    </div>
                    <div className={cx('paid-row')}>
                        <span className={cx('paid-label')}>Đã thanh toán</span>
                        <span className={cx('paid-value', revenue.status === 'PAID' ? 'full' : '')} >
                            {formatCurrency(revenue.paidAmount)}
                        </span>
                    </div>
                    {remaining > 0 && (
                        <div className={cx('remaining-row')}>
                            <span className={cx('remaining-label')}>Còn thiếu</span>
                            <span className={cx('remaining-value')}>{formatCurrency(remaining)}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className={cx('progress-section')}>
                    <Progress
                        percent={Math.round(paymentPercentage)}
                        strokeColor={{
                            '0%': '#ff4d4f',
                            '50%': '#faad14',
                            '100%': '#52c41a',
                        }}
                        status={revenue.status === 'PAID' ? 'success' : 'active'}
                    />
                </div>

                {/* Ngày thanh toán */}
                {revenue.paymentDate && (
                    <div className={cx('info-item', 'payment-date')}>
                        <span className={cx('label')}>Ngày thanh toán</span>
                        <span className={cx('value')}>
                            {dayjs(revenue.paymentDate).format('DD/MM/YYYY HH:mm')}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <SmartButton
                    type="default"
                    icon={<EyeOutlined />}
                    title="Chi tiết"
                    onClick={() => onView(revenue)}
                    style={{ width: '100%' }}
                />
            </div>
        </Card>
    );
};

export default RevenueCard;