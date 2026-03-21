import React from 'react';
import {HomeOutlined, ApartmentOutlined, PlusOutlined} from '@ant-design/icons';
import { Button, Tooltip, message } from 'antd';
import styles from './RemainingQuotaIndicator.module.scss';
import {getRemaining, useOwnerQuota} from "~/hooks/useOwnerQuota";

const RemainingQuotaIndicator = ({ pageType, onAddClick }) => {
    const { data: quota, isLoading } = useOwnerQuota();

    if (isLoading || !quota) {
        return null;
    }

    let current, max, label, icon, unit;

    switch (pageType) {
        case 'boardingHouse':
            current = quota.currentBoardingHouses;
            max = quota.maxBoardingHouses;
            label = 'khu nhà';
            icon = <HomeOutlined />;
            unit = 'khu';
            break;
        case 'building':
            current = quota.currentBuildings;
            max = quota.maxBuildings;
            label = 'tòa';
            icon = <HomeOutlined />;
            unit = 'tòa';
            break;
        case 'room':
            current = quota.currentRooms;
            max = quota.maxRooms;
            label = 'phòng';
            icon = <ApartmentOutlined />;
            unit = 'phòng';
            break;
        default:
            return null;
    }

    const remaining = getRemaining(current, max);
    const isMaxed = remaining === 0;

    const handleClick = () => {
        if (isMaxed) {
            message.warning(`Bạn đã đạt giới hạn ${max} ${unit}. Vui lòng nâng cấp gói!`);
        } else if (onAddClick) {
            onAddClick();
        }
    };

    return (
        <div className={styles.container}>
            <Tooltip title={`Còn lại: ${remaining} ${unit}`}>
        <span className={`${styles.text} ${isMaxed ? styles.maxed : ''}`}>
          {icon} {current}/{max} {unit}
        </span>
            </Tooltip>
        </div>
    );
};

export default RemainingQuotaIndicator;