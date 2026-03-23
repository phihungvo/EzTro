import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './BuildingCard.module.scss';
import { Card, Space } from 'antd';
import {
    HomeOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';

const cx = classNames.bind(cardStyles);

const BuildingCard = ({ building, onView, onEdit, onDelete }) => {
    const handleView = () => {
        if (typeof onView === 'function') {
            onView(building);
            return;
        }

        if (typeof onEdit === 'function') {
            onEdit(building);
        }
    };

    return (
        <Card hoverable className={cx('building-card')}>
            <div className={cx('building-card-content')}>
                {/* Header */}
                <div className={cx('building-header-section')}>
                    <h3 className={cx('building-name')}>{building.name || 'Chưa có tên'}</h3>
                    <div className={cx('building-id')}>ID: {building.id}</div>
                </div>

                {/* Thông tin chi tiết */}
                <div className={cx('building-info-section')}>
                    {/* Tên nhà trọ */}
                    <div className={cx('address-row')}>
                        <HomeOutlined className={cx('building-icon', 'address-icon')} />
                        <span className={cx('address-text')}>
                            {building.boardingHouseName || 'Không có tên nhà trọ'}
                        </span>
                    </div>

                    <Space direction="vertical" size={8} className={cx('building-details-space')}>
                        {/* Mô tả */}
                        <div className={cx('building-info-grid')}>
                            <div className={cx('building-info-item')} style={{ gridColumn: 'span 2' }}>
                                <span className={cx('building-label')}>Mô tả</span>
                                <span className={cx('building-value')}>
                                    {building.description || 'Không có mô tả'}
                                </span>
                            </div>
                        </div>

                        {/* Thông tin tầng và ngày tạo */}
                        <div className={cx('building-info-grid')}>
                            <div className={cx('building-info-item')}>
                                <span className={cx('building-label')}>Số tầng</span>
                                <span className={cx('building-value')}>
                                    {building.totalFloors || 0}
                                </span>
                            </div>
                            <div className={cx('building-info-item')}>
                                <span className={cx('building-label')}>Ngày tạo</span>
                                <span className={cx('building-value')}>
                                    {new Date(building.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </Space>
                </div>
            </div>

            {/* Hành động */}
            <div className={cx('building-action-section')}>
                <SmartButton
                    type="default"
                    icon={<EyeOutlined />}
                    buttonWidth={40}
                    onClick={handleView}
                />
                <SmartButton
                    type="primary"
                    icon={<EditOutlined />}
                    buttonWidth={40}
                    onClick={() => onEdit(building)}
                />
                <SmartButton
                    type="danger"
                    icon={<DeleteOutlined />}
                    buttonWidth={40}
                    onClick={() => onDelete(building)}
                />
            </div>
        </Card>
    );
};

export default BuildingCard;
