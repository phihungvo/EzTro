import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './AmenityCard.module.scss';
import { Card, Tag } from 'antd';
import {
    ThunderboltOutlined,
    DollarOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';

const cx = classNames.bind(cardStyles);

const AmenityCard = ({ amenity, onEdit, onDelete }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
        }).format(amount);
    };

    // Lấy icon theo loại dịch vụ
    const getAmenityIcon = (type) => {
        return <ThunderboltOutlined className={cx('amenity-icon')} />;
    };

    // Lấy màu tag theo loại
    const getTagColor = (type) => {
        const colors = {
            electricity: 'gold',
            water: 'blue',
            internet: 'cyan',
            cleaning: 'green',
            parking: 'purple',
            default: 'geekblue'
        };
        return colors[type] || colors.default;
    };

    return (
        <Card
            hoverable
            className={cx('amenity-card')}
            bodyStyle={{ padding: 0 }}
        >
            {/* Header */}
            <div className={cx('card-header')}>
                <div className={cx('header-main')}>
                    {getAmenityIcon(amenity.type)}
                    <h3 className={cx('amenity-name')}>{amenity.name}</h3>
                </div>
                <Tag color={getTagColor(amenity.type)} className={cx('status-tag')}>
                    {amenity.type}
                </Tag>
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                {/* Giá dịch vụ */}
                <div className={cx('price-section')}>
                    <div className={cx('price-main')}>
                        <span className={cx('price-amount')}>
                            {formatCurrency(amenity.price)}
                        </span>
                        <span className={cx('price-currency')}>VNĐ</span>
                    </div>
                    {amenity.unit && (
                        <span className={cx('price-unit')}>/ {amenity.unit || 'kWh'}</span>
                    )}
                </div>

                {/* Mô tả */}
                {amenity.description && (
                    <div className={cx('description')}>
                        <span className={cx('description-text')}>{amenity.description || 'Theo đồng hồ'}</span>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <SmartButton
                    type="primary"
                    icon={<EditOutlined />}
                    buttonWidth={36}
                    onClick={() => onEdit(amenity)}
                />
                <SmartButton
                    type="danger"
                    icon={<DeleteOutlined />}
                    buttonWidth={36}
                    onClick={() => onDelete(amenity)}
                />
            </div>
        </Card>
    );
};

export default AmenityCard;