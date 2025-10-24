import React from "react";
import { Card } from "antd";

import styles from "./BillsCard.module.scss";
import BillItem from "~/components/Layout/UserLayout/components/BillItem";

const BillsCard = ({ bills, onViewAll }) => {
    return (
        <Card
            title={
                <>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>⚡</span>
                    Hóa Đơn Gần Đây
                </>
            }
            extra={<a onClick={onViewAll}>Xem Tất Cả</a>}
            className={styles.billsCard}
        >
            <div className={styles.billsList}>
                {bills.map((bill, index) => (
                    <BillItem key={index} bill={bill} />
                ))}
            </div>
        </Card>
    );
};

export default BillsCard;
