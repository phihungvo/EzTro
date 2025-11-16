import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './RequestCard.module.scss';
import { Card } from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import dayjs from 'dayjs';

const cx = classNames.bind(cardStyles);

const RequestCard = ({ request, onView, onApprove, onReject, renderStatusTag, renderTypeTag }) => {
    return (
        <Card hoverable className={cx('request-card')}>
            {/* Header */}
            <div className={cx('card-header')}>
                <div className={cx('header-main')}>
                    <ClockCircleOutlined className={cx('clock-icon')} />
                    <h3 className={cx('request-code')}>{request.requestCode}</h3>
                </div>
                {renderTypeTag(request.type)}
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                {/* Người thuê */}
                <div className={cx('info-row')}>
                    <UserOutlined className={cx('icon')} />
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Người thuê</span>
                        <span className={cx('value')}>{request.tenantName}</span>
                    </div>
                </div>

                {/* Số điện thoại */}
                <div className={cx('info-row')}>
                    <PhoneOutlined className={cx('icon')} />
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>SĐT</span>
                        <span className={cx('value')}>{request.tenantPhone}</span>
                    </div>
                </div>

                {/* Địa chỉ */}
                <div className={cx('info-row')}>
                    <HomeOutlined className={cx('icon')} />
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Vị trí</span>
                        <span className={cx('value')}>
                            P.{request.roomNumber} - {request.buildingName}
                        </span>
                    </div>
                </div>

                {/* Khu trọ */}
                <div className={cx('info-item')}>
                    <span className={cx('label')}>Khu trọ</span>
                    <span className={cx('value')}>{request.boardingHouseName}</span>
                </div>

                {/* Nội dung */}
                <div className={cx('info-item')}>
                    <span className={cx('label')}>Nội dung</span>
                    <span className={cx('value', 'description')}>{request.description}</span>
                </div>

                {/* Trạng thái */}
                <div className={cx('status-row')}>
                    <span className={cx('label')}>Trạng thái</span>
                    {renderStatusTag(request.status)}
                </div>

                {/* Ngày tạo */}
                <div className={cx('info-item')}>
                    <span className={cx('label')}>Ngày tạo</span>
                    <span className={cx('value')}>
                        {dayjs(request.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <SmartButton
                    type="default"
                    icon={<EyeOutlined />}
                    buttonWidth={36}
                    onClick={() => onView(request)}
                />
                {request.status === 'PENDING' && (
                    <>
                        <SmartButton
                            type="primary"
                            icon={<CheckOutlined />}
                            buttonWidth={36}
                            onClick={() => onApprove(request)}
                        />
                        <SmartButton
                            type="danger"
                            icon={<CloseOutlined />}
                            buttonWidth={36}
                            onClick={() => onReject(request)}
                        />
                    </>
                )}
            </div>
        </Card>
    );
};

export default RequestCard;