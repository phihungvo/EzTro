import React from "react";
import {Badge} from "antd";
import styles from "./IncidentItem.module.scss";

const IncidentItem = ({type, description, date, status, icon}) => {
    const STATUS_CONFIG = {
        PENDING:     { color: 'warning', text: 'Chờ tiếp nhận' },
        IN_PROGRESS: { color: 'info', text: 'Đang Xử Lý' },
        RESOLVED:    { color: 'success', text: 'Đã Xử Lý Xong' },
        REJECTED:    { color: 'error', text: 'Từ Chối Xử Lý' },
    };

    const getStatusConfig = (status) => STATUS_CONFIG[status] ?? { color: 'default', text: status };

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