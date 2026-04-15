import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './BoardingHousesCard.module.scss';
import {Card, Tag, Typography} from 'antd';
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

const formatNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

const BoardingHousesCard = ({ boardingHouse, onView, onEdit, onDelete }) => {
    const handleView = () => {
        if (typeof onView === 'function') {
            onView(boardingHouse);
            return;
        }

        if (typeof onEdit === 'function') {
            onEdit(boardingHouse);
        }
    };

    return (
        <Card
            hoverable
            className={cx('boarding-card')}
            bodyStyle={{ padding: 0 }}
        >
            <div className={cx('card-header')}>
                <div className={cx('header-main')}>
                    <HomeOutlined className={cx('home-icon')} />
                    <div>
                        <Typography.Text className={cx('card-kicker')}>Khu nhà trọ</Typography.Text>
                        <h3 className={cx('house-name')}>{boardingHouse.name || 'Chưa có tên'}</h3>
                    </div>
                </div>
                <Tag color="blue" className={cx('id-tag')}>ID: {boardingHouse.id}</Tag>
            </div>

            <div className={cx('card-body')}>
                <div className={cx('info-row')}>
                    <EnvironmentOutlined className={cx('icon')} />
                    <span className={cx('text')}>{boardingHouse.address || 'Chưa có địa chỉ'}</span>
                </div>

                <div className={cx('summary-row')}>
                    <div className={cx('summary-item')}>
                        <span className={cx('summary-label')}>Số phòng:</span>
                        <span className={cx('summary-value')}>{formatNumber(boardingHouse.totalRooms)}</span>
                    </div>
                    <div className={cx('divider')}></div>
                    <div className={cx('summary-item')}>
                        <UserOutlined className={cx('owner-icon')} />
                        <span className={cx('owner-name')}>{boardingHouse.ownerName || 'Chưa xác định'}</span>
                    </div>
                </div>
            </div>

            <div className={cx('card-footer')}>
                <SmartButton
                    type="default"
                    icon={<EyeOutlined />}
                    buttonWidth={36}
                    onClick={handleView}
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
