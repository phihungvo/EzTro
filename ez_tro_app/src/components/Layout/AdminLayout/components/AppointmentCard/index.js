// src/components/Layout/AdminLayout/components/AppointmentCard/AppointmentCard.jsx
import React from 'react';
import classNames from 'classnames/bind';
import cardStyles from './AppointmentCard.module.scss';
import {Card} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined,
    MailOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import SmartButton from '~/components/Layout/AdminLayout/components/SmartButton';
import dayjs from 'dayjs';

const cx = classNames.bind(cardStyles);

const AppointmentCard = ({appointment, onView, onConfirm, onCancel, renderStatusTag}) => {
    return (
        <Card hoverable className={cx('appointment-card')}>
            {/* Header */}
            <div className={cx('card-header')}>
                <div className={cx('header-main')}>
                    <CalendarOutlined className={cx('calendar-icon')}/>
                    <h3 className={cx('appointment-code')}>{appointment.appointmentCode}</h3>
                </div>
                {renderStatusTag(appointment.status)}
            </div>

            {/* Body */}
            <div className={cx('card-body')}>
                {/* Khách hàng */}
                <div className={cx('info-row', 'highlight')}>
                    <UserOutlined className={cx('icon')}/>
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Khách hàng</span>
                        <span className={cx('value', 'primary')}>{appointment.visitorName}</span>
                    </div>
                </div>

                {/* Số điện thoại */}
                <div className={cx('info-row')}>
                    <PhoneOutlined className={cx('icon')}/>
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Số điện thoại</span>
                        <span className={cx('value')}>{appointment.visitorPhone}</span>
                    </div>
                </div>

                {/* Email */}
                <div className={cx('info-row')}>
                    <MailOutlined className={cx('icon')}/>
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Email</span>
                        <span className={cx('value', 'email')}>{appointment.visitorEmail}</span>
                    </div>
                </div>

                {/* Phòng */}
                <div className={cx('info-row')}>
                    <HomeOutlined className={cx('icon')}/>
                    <div className={cx('info-content')}>
                        <span className={cx('label')}>Phòng xem</span>
                        <span className={cx('value')}>
                            P.{appointment.roomNumber} - {appointment.buildingName}
                        </span>
                    </div>
                </div>

                {/* Khu trọ */}
                <div className={cx('info-item')}>
                    <span className={cx('label')}>Khu trọ</span>
                    <span className={cx('value')}>{appointment.boardingHouseName}</span>
                </div>

                {/* Ngày hẹn */}
                <div className={cx('date-box')}>
                    <CalendarOutlined className={cx('date-icon')}/>
                    <div className={cx('date-content')}>
                        <span className={cx('date-label')}>Thời gian hẹn</span>
                        <span className={cx('date-value')}>
                            {dayjs(appointment.appointmentDate).format('DD/MM/YYYY')}
                        </span>
                        <span className={cx('time-value')}>
                            {dayjs(appointment.appointmentDate).format('HH:mm')}
                        </span>
                    </div>
                </div>

                {/* Ghi chú */}
                {appointment.note && (
                    <div className={cx('info-item')}>
                        <span className={cx('label')}>Ghi chú</span>
                        <span className={cx('value', 'note')}>{appointment.note}</span>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className={cx('card-footer')}>
                <SmartButton
                    type="default"
                    icon={<EyeOutlined/>}
                    buttonWidth={36}
                    onClick={() => onView(appointment)}
                />
                {appointment.status === 'PENDING' && (
                    <>
                        <SmartButton
                            type="primary"
                            icon={<CheckOutlined/>}
                            buttonWidth={36}
                            onClick={() => onConfirm(appointment)}
                        />
                        <SmartButton
                            type="danger"
                            icon={<CloseOutlined/>}
                            buttonWidth={36}
                            onClick={() => onCancel(appointment)}
                        />
                    </>
                )}
            </div>
        </Card>
    );
};

export default AppointmentCard;