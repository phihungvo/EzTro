import React from "react";
import {Badge} from "antd";
import styles from "./RoomInfoCard.module.scss";

const RoomInfoCard = ({roomData}) => {
    const {roomNumber, building, floor, area, price, status} = roomData;

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Đang Ở':
                return {color: 'success', text: 'Đang Ở'};
            case 'maintenance':
                return {color: 'warning', text: 'Bảo Trì'};
            case 'empty':
                return {color: 'default', text: 'Trống'};
            default:
                return {color: 'default', text: status};
        }
    };

    const statusConfig = getStatusConfig(status);

    return (
        <div className={styles.roomInfoCard}>
            <h2 className={styles.title}>Thông Tin Phòng</h2>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <div className={styles.label}>SỐ PHÒNG</div>
                    <div className={styles.value}>{roomNumber}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>TÒA NHÀ</div>
                    <div className={styles.value}>{building}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>TẦNG</div>
                    <div className={styles.value}>{floor}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>DIỆN TÍCH</div>
                    <div className={styles.value}>{area} m²</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>GIÁ THUÊ</div>
                    <div className={styles.value}>
                        {/*{price.toLocaleString('vi-VN')} đ*/}
                        {price }đ
                    </div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>TRẠNG THÁI</div>
                    <div className={styles.value}>
                        <Badge
                            status={statusConfig.color}
                            text={statusConfig.text}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomInfoCard;