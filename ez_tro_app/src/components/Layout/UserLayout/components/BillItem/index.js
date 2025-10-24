import React from "react";
import {Badge} from "antd";
import styles from "./BillItem.module.scss";

const BillItem = ({ bill }) => {
    return (
        <div className={styles.billItem}>
            <div className={styles.billInfo}>
                <h4 className={styles.billTitle}>{bill.billTitle || "Không có tiêu đề"}</h4>
                <p className={styles.date}>
                    {bill.paid
                        ? `Thanh toán: ${new Date(bill.paymentDate).toLocaleDateString('vi-VN')}`
                        : `Hạn thanh toán: ${new Date(bill.dueDate).toLocaleDateString('vi-VN')}`
                    }
                </p>
            </div>
            <div className={styles.billRight}>
                <div className={styles.amount}>
                    {bill.amount?.toLocaleString('vi-VN')} đ
                </div>
                <Badge
                    status={bill.paid ? 'success' : 'error'}
                    text={bill.paid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                />
            </div>
        </div>
    );
};

export default BillItem;