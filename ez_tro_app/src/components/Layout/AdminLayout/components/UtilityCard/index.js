// UtilityCard.jsx
import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './UtilityCard.module.scss';
import { Card, Tag, Tooltip } from 'antd';
import {
    ThunderboltOutlined,
    DropboxOutlined,
    WifiOutlined,
    CarOutlined,
    AppstoreOutlined,
    EditOutlined,
    DeleteOutlined,
    PoweroffOutlined,
} from '@ant-design/icons';

const cx = classNames.bind(cardStyles);

const UtilityCard = ({ utility, onEdit, onDelete, onToggle }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
        }).format(amount);
    };

    const getUtilityIcon = (type) => {
        const icons = {
            ELECTRIC: <ThunderboltOutlined />,
            WATER: <DropboxOutlined />,
            INTERNET: <WifiOutlined />,
            PARKING: <CarOutlined />,
            USAGE_BASED: <ThunderboltOutlined />,
            FIXED: <AppstoreOutlined />,
        };
        return icons[type] || <AppstoreOutlined />;
    };

    const getHeaderClass = (type) => {
        const classes = {
            ELECTRIC: 'electric',
            WATER: 'water',
            INTERNET: 'internet',
            PARKING: 'parking',
        };
        return classes[type] || 'electric';
    };

    const boardingHouseLabel = (utility.boardingHouseNames && utility.boardingHouseNames.length > 0)
        ? utility.boardingHouseNames.join(', ')
        : 'Dùng chung (tất cả nhà trọ của bạn)';

    return (
        <div className={cx('utility-card', { 'inactive': !utility.isActive })}>
            {/* Header */}
            <div className={cx('card-header', getHeaderClass(utility.type))}>
                <div className={cx('icon-wrapper')}>
                    {getUtilityIcon(utility.type)}
                </div>
                <div className={cx('header-content')}>
                    <h3 className={cx('utility-title')}>{utility.name}</h3>
                    <span className={cx('type-tag', getHeaderClass(utility.type))}>
                        {utility.type}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                {/* Giá dịch vụ */}
                <div className={cx('price-section')}>
                    <span className={cx('price-label')}>Đơn giá:</span>
                    <div className={cx('price-main')}>
                        <span className={cx('price-amount')}>
                            {formatCurrency(utility.unitPrice)}
                        </span>
                        <span className={cx('price-currency')}>đ</span>
                    </div>
                </div>

                {/* Đơn vị */}
                {utility.unit && (
                    <div className={cx('info-row')}>
                        <span className={cx('info-label')}>Đơn vị tính:</span>
                        <span className={cx('info-value')}>{utility.unit}</span>
                    </div>
                )}

                {/* Nhà trọ */}
                <div className={cx('info-row')}>
                    <span className={cx('info-label')}>Nhà trọ:</span>
                    <Tooltip title={boardingHouseLabel}>
                        <span className={cx('info-value')}>
                            {boardingHouseLabel}
                        </span>
                    </Tooltip>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <button
                    className={cx('action-button', 'edit')}
                    onClick={() => onEdit(utility)}
                    // disabled={!utility.isActive}
                >
                    <EditOutlined />
                    Sửa
                </button>
                <button
                    className={cx('action-button', 'delete')}
                    onClick={() => onDelete(utility)}
                >
                    <DeleteOutlined />
                    Xóa
                </button>
                <button
                    className={cx('action-button', utility.isActive ? 'disable' : 'enable')}
                    onClick={() => onToggle(utility)}
                >
                    <PoweroffOutlined />
                    {utility.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                </button>
            </div>
        </div>
    );
};

export default UtilityCard;
