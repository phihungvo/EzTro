import React from "react";
import {Badge} from "antd";
import styles from "./BillItem.module.scss";

const BillItem = ({title, amount, dueDate, paidDate, status}) => {
    return (
        <div className={styles.billItem}>
            <div className={styles.billInfo}>
                <h4 className={styles.title}>{title}</h4>
                <p className={styles.date}>
                    {status === 'paid'
                        ? `Thanh toán: ${paidDate}`
                        : `Hạn thanh toán: ${dueDate}`
                    }
                </p>
            </div>
            <div className={styles.billRight}>
                <div className={styles.amount}>
                    {amount.toLocaleString('vi-VN')} đ
                </div>
                <Badge
                    status={status === 'paid' ? 'success' : 'error'}
                    text={status === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                />
            </div>
        </div>
    );
};

export default BillItem;