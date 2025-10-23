import React from "react";
import {Badge} from "antd";
import styles from "./IncidentItem.module.scss";

const IncidentItem = ({type, description, date, status, icon}) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'resolved':
                return {color: 'success', text: 'Đã Xử Lý'};
            case 'pending':
                return {color: 'warning', text: 'Đang Xử Lý'};
            case 'new':
                return {color: 'error', text: 'Mới'};
            default:
                return {color: 'default', text: status};
        }
    };

    const statusConfig = getStatusConfig(status);

    return (
        <div className={styles.incidentItem}>
            <div className={styles.left}>
                <div className={styles.iconWrapper}>
                    <span className={styles.icon}>{icon}</span>
                </div>
                <div className={styles.info}>
                    <div className={styles.type}>{type}</div>
                    <div className={styles.description}>{description}</div>
                </div>
            </div>
            <div className={styles.right}>
                <div className={styles.date}>{date}</div>
                <Badge
                    status={statusConfig.color}
                    text={statusConfig.text}
                />
            </div>
        </div>
    );
};

export default IncidentItem;