import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './BoardingHousesCard.module.scss';
import { Card, Tag } from 'antd';
import {
    EnvironmentOutlined,
    HomeOutlined,
    UserOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';

const cx = classNames.bind(cardStyles);

const BoardingHousesCard = ({ boardingHouse, onView, onEdit, onDelete }) => {
    return (
        <Card
            hoverable
            className={cx('boarding-card')}
            bodyStyle={{ padding: 0 }}
        >
            {/* Header compact */}
            <div className={cx('card-header')}>
                <div className={cx('header-main')}>
                    <HomeOutlined className={cx('home-icon')} />
                    <h3 className={cx('house-name')}>{boardingHouse.name}</h3>
                </div>
                <Tag color="blue" className={cx('id-tag')}>ID: {boardingHouse.id}</Tag>
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                {/* Địa chỉ */}
                <div className={cx('info-row')}>
                    <EnvironmentOutlined className={cx('icon')} />
                    <span className={cx('text')}>{boardingHouse.address}</span>
                </div>

                {/* Thông tin tóm tắt */}
                <div className={cx('summary-row')}>
                    <div className={cx('summary-item')}>
                        <span className={cx('summary-label')}>Số phòng:</span>
                        <span className={cx('summary-value')}>{boardingHouse.totalRooms}</span>
                    </div>
                    <div className={cx('divider')}></div>
                    <div className={cx('summary-item')}>
                        <UserOutlined className={cx('owner-icon')} />
                        <span className={cx('owner-name')}>{boardingHouse.ownerName}</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <SmartButton
                    type="default"
                    icon={<EyeOutlined />}
                    buttonWidth={36}
                    onClick={() => onView(boardingHouse)}
                />
                <SmartButton
                    type="primary"
                    icon={<EditOutlined />}
                    buttonWidth={36}
                    onClick={() => onEdit(boardingHouse)}
                />
                <SmartButton
                    type="danger"
                    icon={<DeleteOutlined />}
                    buttonWidth={36}
                    onClick={() => onDelete(boardingHouse)}
                />
            </div>
        </Card>
    );
};

export default BoardingHousesCard;