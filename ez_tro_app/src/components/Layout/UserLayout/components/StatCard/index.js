import React from "react";
import {Badge} from "antd";
import styles from "./StatCard.module.scss";

const StatCard = ({label, value, status}) => {
    return (
        <div className={styles.statCard}>
            <div className={styles.label}>{label}</div>
            <div className={`${styles.value} ${status === 'unpaid' ? styles.unpaid : ''}`}>
                {value}
            </div>
            {status && (
                <Badge
                    status={status === 'paid' ? 'success' : 'error'}
                    text={status === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                />
            )}
        </div>
    );
};

export default StatCard;