import React from "react";
import { Badge } from "antd";
import styles from "./ContractInfoCard.module.scss";

const ContractInfoCard = ({ contract }) => {
    const { contractId, startDate, endDate, status } = contract;

    const getStatusConfig = (status) => {
        switch (status) {
            case 'active':
                return { color: 'success', text: 'Còn Hiệu Lực' };
            case 'expired':
                return { color: 'error', text: 'Hết Hạn' };
            case 'expiring_soon':
                return { color: 'warning', text: 'Sắp Hết Hạn' };
            default:
                return { color: 'default', text: status };
        }
    };

    const statusConfig = getStatusConfig(status);

    return (
        <div className={styles.contractInfoCard}>
            <h2 className={styles.title}>Hợp Đồng Hiện Tại</h2>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <div className={styles.label}>MÃ HỢP ĐỒNG</div>
                    <div className={styles.value}>{contractId}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>NGÀY BẮT ĐẦU</div>
                    <div className={styles.value}>{startDate}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>NGÀY KẾT THÚC</div>
                    <div className={styles.value}>{endDate}</div>
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

export default ContractInfoCard;