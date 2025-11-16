// src/components/Layout/AdminLayout/components/AssetCard/AssetCard.jsx
import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './AssetCard.module.scss';
import { Card, Progress, Badge } from 'antd';
import {
    ToolOutlined,
    HomeOutlined,
    EyeOutlined,
    UserOutlined,
    CalendarOutlined,
    SafetyOutlined,
    WarningOutlined,
    BarcodeOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import dayjs from 'dayjs';

const cx = classNames.bind(cardStyles);

const AssetCard = ({
                       asset,
                       onView,
                       renderStatusTag,
                       renderConditionTag,
                       renderCategoryTag,
                       formatCurrency
                   }) => {
    // Tính toán số ngày còn lại của bảo hành
    const warrantyDaysLeft = dayjs(asset.warrantyExpiry).diff(dayjs(), 'days');
    const isWarrantyValid = warrantyDaysLeft > 0;

    // Tính toán % giảm giá trị
    const depreciationPercent = Math.round(((asset.purchasePrice - asset.currentValue) / asset.purchasePrice) * 100);

    // Kiểm tra cần bảo trì gấp không
    const needMaintenance = asset.nextMaintenanceDate && dayjs(asset.nextMaintenanceDate).diff(dayjs(), 'days') < 30;

    return (
        <Card hoverable className={cx('asset-card')}>
            {/* Header */}
            <div className={cx('card-header', asset.status === 'BROKEN' ? 'broken' : asset.status === 'MAINTENANCE' ? 'maintenance' : '')}>
                <div className={cx('header-main')}>
                    <ToolOutlined className={cx('tool-icon')} />
                    <div className={cx('header-info')}>
                        <h3 className={cx('asset-code')}>{asset.assetCode}</h3>
                        {renderCategoryTag(asset.category)}
                    </div>
                </div>
                {renderStatusTag(asset.status)}
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                {/* Tên tài sản */}
                <div className={cx('asset-name')}>
                    <h4>{asset.assetName}</h4>
                    <div className={cx('asset-spec')}>
                        {asset.brand} {asset.model && `- ${asset.model}`}
                    </div>
                </div>

                {/* Vị trí & Người sử dụng */}
                <div className={cx('location-section')}>
                    <div className={cx('location-item')}>
                        <HomeOutlined className={cx('icon')} />
                        <div className={cx('location-info')}>
                            <span className={cx('label')}>Vị trí</span>
                            <span className={cx('value')}>
                                {asset.roomNumber} - {asset.buildingName}
                            </span>
                        </div>
                    </div>
                    {asset.assignedTo && (
                        <div className={cx('location-item')}>
                            <UserOutlined className={cx('icon')} />
                            <div className={cx('location-info')}>
                                <span className={cx('label')}>Người dùng</span>
                                <span className={cx('value')}>{asset.assignedTo}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Giá trị */}
                <div className={cx('value-section')}>
                    <div className={cx('value-item')}>
                        <span className={cx('value-label')}>Giá mua</span>
                        <span className={cx('value-amount', 'original')}>
                            {formatCurrency(asset.purchasePrice)}
                        </span>
                    </div>
                    <div className={cx('arrow')}>→</div>
                    <div className={cx('value-item')}>
                        <span className={cx('value-label')}>Hiện tại</span>
                        <span className={cx('value-amount', 'current')}>
                            {formatCurrency(asset.currentValue)}
                        </span>
                    </div>
                </div>

                {/* Depreciation Progress */}
                <div className={cx('depreciation-section')}>
                    <div className={cx('depreciation-label')}>
                        <span>Khấu hao: {depreciationPercent}%</span>
                        <span className={cx('rate')}>{asset.depreciationRate}%/năm</span>
                    </div>
                    <Progress
                        percent={depreciationPercent}
                        strokeColor={{
                            '0%': '#52c41a',
                            '50%': '#faad14',
                            '100%': '#ff4d4f',
                        }}
                        showInfo={false}
                    />
                </div>

                {/* Tình trạng */}
                <div className={cx('condition-section')}>
                    <span className={cx('label')}>Tình trạng:</span>
                    {renderConditionTag(asset.condition)}
                </div>

                {/* Thông tin bảo hành & bảo trì */}
                <div className={cx('info-grid')}>
                    <div className={cx('info-box', 'warranty', isWarrantyValid ? 'valid' : 'expired')}>
                        <SafetyOutlined className={cx('info-icon')} />
                        <div>
                            <span className={cx('info-label')}>Bảo hành</span>
                            <span className={cx('info-value')}>
                                {isWarrantyValid ? `Còn ${warrantyDaysLeft} ngày` : 'Hết hạn'}
                            </span>
                        </div>
                    </div>
                    {asset.nextMaintenanceDate && (
                        <div className={cx('info-box', 'maintenance', needMaintenance ? 'urgent' : '')}>
                            <CalendarOutlined className={cx('info-icon')} />
                            <div>
                                <span className={cx('info-label')}>Bảo trì tiếp</span>
                                <span className={cx('info-value')}>
                                    {dayjs(asset.nextMaintenanceDate).format('DD/MM/YY')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Serial Number */}
                {asset.serialNumber && (
                    <div className={cx('serial-section')}>
                        <BarcodeOutlined className={cx('serial-icon')} />
                        <span className={cx('serial-text')}>S/N: {asset.serialNumber}</span>
                    </div>
                )}

                {/* Cảnh báo */}
                {(needMaintenance || !isWarrantyValid || asset.status === 'BROKEN') && (
                    <div className={cx('alert-section')}>
                        {needMaintenance && (
                            <Badge status="warning" text="Sắp tới hạn bảo trì" />
                        )}
                        {!isWarrantyValid && (
                            <Badge status="error" text="Hết bảo hành" />
                        )}
                        {asset.status === 'BROKEN' && (
                            <Badge status="error" text="Cần sửa chữa ngay" />
                        )}
                    </div>
                )}

                {/* Ghi chú */}
                {asset.notes && (
                    <div className={cx('note-section')}>
                        <span className={cx('note-icon')}>📝</span>
                        <p className={cx('note-text')}>{asset.notes}</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <SmartButton
                    title="Xem chi tiết"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => onView(asset)}
                    style={{ width: '100%' }}
                />
            </div>
        </Card>
    );
};

export default AssetCard;