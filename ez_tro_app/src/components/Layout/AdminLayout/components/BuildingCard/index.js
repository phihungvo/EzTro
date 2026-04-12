import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './BuildingCard.module.scss';
import {Card, Space, Typography} from 'antd';
import {
    HomeOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';

const cx = classNames.bind(cardStyles);

const formatDate = (value) => {
    if (!value) {
        return 'Chưa có';
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? 'Chưa có' : parsedDate.toLocaleDateString('vi-VN');
};

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
                <div className={cx('building-header-section')}>
                    <div>
                        <Typography.Text className={cx('building-kicker')}>Tòa nhà</Typography.Text>
                        <h3 className={cx('building-name')}>{building.name || 'Chưa có tên'}</h3>
                    </div>
                    <div className={cx('building-id')}>ID: {building.id}</div>
                </div>

                <div className={cx('building-info-section')}>
                    <div className={cx('address-row')}>
                        <HomeOutlined className={cx('building-icon', 'address-icon')} />
                        <span className={cx('address-text')}>
                            {building.boardingHouseName || 'Không có tên nhà trọ'}
                        </span>
                    </div>

                    <Space direction="vertical" size={8} className={cx('building-details-space')}>
                        <div className={cx('building-info-grid')}>
                            <div className={cx('building-info-item')} style={{ gridColumn: 'span 2' }}>
                                <span className={cx('building-label')}>Mô tả</span>
                                <span className={cx('building-value', {'empty': !building.description})}>
                                    {building.description || 'Không có mô tả'}
                                </span>
                            </div>
                        </div>

                        <div className={cx('building-info-grid')}>
                            <div className={cx('building-info-item')}>
                                <span className={cx('building-label')}>Số tầng</span>
                                <span className={cx('building-value')}>
                                    {building.totalFloors ?? 0}
                                </span>
                            </div>
                            <div className={cx('building-info-item')}>
                                <span className={cx('building-label')}>Ngày tạo</span>
                                <span className={cx('building-value')}>
                                    {formatDate(building.createdAt)}
                                </span>
                            </div>
                        </div>
                    </Space>
                </div>
            </div>

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
