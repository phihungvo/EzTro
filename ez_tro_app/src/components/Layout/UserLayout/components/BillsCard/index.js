import React from "react";
import { Card, Empty } from "antd";

import styles from "./BillsCard.module.scss";
import BillItem from "~/components/Layout/UserLayout/components/BillItem";

const BillsCard = ({ bills, onViewAll }) => {
    const recentBills = Array.isArray(bills) ? bills.slice(0, 5) : [];

    return (
        <Card
            title={
                <>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>⚡</span>
                    Hóa Đơn Gần Đây
                </>
            }
            extra={(
                <button
                    type="button"
                    onClick={onViewAll}
                    style={{
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        color: "#1677ff",
                        cursor: "pointer",
                    }}
                >
                    Xem Tất Cả
                </button>
            )}
            className={styles.billsCard}
        >
            <div className={styles.billsList}>
                {recentBills.length > 0 ? (
                    recentBills.map((bill) => (
                        <BillItem key={bill?.id || bill?.billCode} bill={bill} />
                    ))
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có hóa đơn nào được phát hành"
                    />
                )}
            </div>
        </Card>
    );
};

export default BillsCard;
