import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './RoomCard.module.scss';
import { Card, Tag } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    CalendarOutlined,
    DollarOutlined,
    TeamOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';

const cx = classNames.bind(cardStyles);

const RoomCard = ({ room, onView, onEdit, onDelete, onHold }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
        }).format(amount) + 'đ';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không rõ';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return 'blue';
            case 'OCCUPIED':
                return 'green';
            case 'MAINTENANCE':
                return 'orange';
            default:
                return 'default';
        }
    };

    return (
        <Card
            hoverable
            className={cx('room-card')}
            bodyStyle={{ padding: 0 }}
        >
            {/* Header */}
            <div className={cx('card-header')}>
                <div className={cx('header-content')}>
                    <h3 className={cx('room-id')}>{room.roomNumber}</h3>
                    <span className={cx('room-id-label')}>ID: {room.id || '302'}</span>
                </div>
                <Tag color={getStatusColor(room.status)} className={cx('status-tag')}>
                    {room.status || 'Đang Thuê'}
                </Tag>
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                {/* Tên người thuê */}
                <div className={cx('info-row')}>
                    <UserOutlined className={cx('icon')} />
                    <span className={cx('text')}>{room.tenantName || 'hung'}</span>
                </div>

                {/* Số điện thoại */}
                <div className={cx('info-row')}>
                    <PhoneOutlined className={cx('icon')} />
                    <span className={cx('text')}>{room.phoneNumber || '9876543456'}</span>
                </div>

                {/* Thời gian thuê */}
                <div className={cx('info-row')}>
                    <CalendarOutlined className={cx('icon')} />
                    <span className={cx('text')}>
                        {formatDate(room.startDate) || '18/10/25'} - {formatDate(room.endDate) || '31/10/25'}
                    </span>
                </div>

                {/* Giá phòng & Số người */}
                <div className={cx('bottom-info')}>
                    <div className={cx('price-info')}>
                        <DollarOutlined className={cx('price-icon')} />
                        <span className={cx('price-value')}>
                            {formatCurrency(room.price || 3500000)}
                        </span>
                    </div>
                    <div className={cx('capacity-info')}>
                        <TeamOutlined className={cx('capacity-icon')} />
                        <span className={cx('capacity-value')}>
                            {room.currentCapacity || '1'}/{room.maxCapacity || '4'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <SmartButton
                    type="default"
                    icon={<span className={cx('hold-icon')}>📋</span>}
                    buttonWidth={80}
                    className={cx('hold-button')}
                    onClick={() => onHold && onHold(room)}
                >
                    Giữ Chỗ
                </SmartButton>
                <SmartButton
                    type="primary"
                    icon={<EyeOutlined />}
                    buttonWidth={36}
                    onClick={() => onView && onView(room)}
                />
                <SmartButton
                    type="primary"
                    icon={<EditOutlined />}
                    buttonWidth={36}
                    onClick={() => onEdit && onEdit(room)}
                />
                <SmartButton
                    type="danger"
                    icon={<DeleteOutlined />}
                    buttonWidth={36}
                    onClick={() => onDelete && onDelete(room)}
                />
            </div>
        </Card>
    );
};

export default RoomCard;