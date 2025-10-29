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
} from '@ant-design/icons';

const cx = classNames.bind(cardStyles);

const UtilityCard = ({ utility, onEdit, onDelete }) => {
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
    // i love u Phi Hung hahhahaha; Toi la Truc Vy em be cua Phi Hung; Nho si quan khung
    // Will you marry me ? 💍💍💍💍💍💍💍🫦🤰
    const getHeaderClass = (type) => {
        const classes = {
            ELECTRIC: 'electric',
            WATER: 'water',
            INTERNET: 'internet',
            PARKING: 'parking',
        };
        return classes[type] || 'electric';
    };

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
                    <Tooltip title={utility.boardingHouseName}>
                        <span className={cx('info-value')}>
                            {utility.boardingHouseName}
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
            </div>
        </div>
    );
};

export default UtilityCard;