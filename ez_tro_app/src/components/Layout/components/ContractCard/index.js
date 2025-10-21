import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './ContractCard.module.scss';
import { Card, Tag } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PrinterOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/components/SmartButton';

const cx = classNames.bind(cardStyles);

const ContractCard = ({ contract, onView, onEdit, onDelete }) => {
    // Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
        }).format(amount) + ' ₫';
    };

    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return 'Không rõ';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <Card
            hoverable
            className={cx('contract-card')}
            bodyStyle={{ padding: 0 }}
        >
            {/* Header */}
            <div className={cx('card-header')}>
                <div className={cx('header-main')}>
                    <HomeOutlined className={cx('home-icon')} />
                    <h3 className={cx('contract-id')}>{contract.contractCode || 'P01'}</h3>
                </div>
                <Tag color="cyan" className={cx('status-tag')}>Tạo giữ chỗ</Tag>
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                <div className={cx('info-row')}>
                    <HomeOutlined className={cx('icon')} />
                    <span className={cx('text')}>{contract.boardingHouseName}</span>
                </div>

                {/* Đại diện */}
                <div className={cx('info-row')}>
                    <UserOutlined className={cx('icon')} />
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Đại diện: </span>
                        <span className={cx('value')}>{contract.representative || 'hung'}</span>
                    </div>
                </div>

                {/* Hiệu lực */}
                <div className={cx('info-row')}>
                    <CalendarOutlined className={cx('icon')} />
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Hiệu lực: </span>
                        <span className={cx('value')}>
                            {formatDate(contract.endDate) || '01/11/2025'} - {contract.status || 'Không thời hạn'}
                        </span>
                    </div>
                </div>

                {/* Giá thuê & Tiền cọc */}
                <div className={cx('price-section')}>
                    <div className={cx('price-item')}>
                        <span className={cx('price-label')}>Giá thuê</span>
                        <span className={cx('price-value')}>
                            {formatCurrency(contract.rentPrice || 3500000)}
                        </span>
                    </div>
                    <div className={cx('divider')}></div>
                    <div className={cx('price-item')}>
                        <span className={cx('price-label')}>Tiền cọc</span>
                        <span className={cx('price-value')}>
                            {formatCurrency(contract.deposit || 1000000)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <SmartButton
                    type="default"
                    icon={<EyeOutlined />}
                    buttonWidth={36}
                    onClick={() => onView(contract)}
                />
                <SmartButton
                    type="default"
                    icon={<PrinterOutlined />}
                    buttonWidth={36}
                />
                <SmartButton
                    type="primary"
                    icon={<EditOutlined />}
                    buttonWidth={36}
                    onClick={() => onEdit(contract)}
                />
                <SmartButton
                    type="danger"
                    icon={<DeleteOutlined />}
                    buttonWidth={36}
                    onClick={() => onDelete(contract)}
                />
            </div>
        </Card>
    );
};

export default ContractCard;