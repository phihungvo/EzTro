import React from "react";
import {Badge} from "antd";
import styles from "./BillItem.module.scss";

const BillItem = ({bill}) => {
    const formatDate = (value) => {
        if (!value) {
            return null;
        }
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("vi-VN");
    };

    const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

    const isPaid = bill?.status === "PAID";
    const isPartial = bill?.status === "PARTIALLY_PAID";
    const isOverdue = bill?.status === "OVERDUE";
    const isCancelled = bill?.status === "CANCELLED";
    const displayAmount = bill?.outstandingAmount ?? bill?.amount;
    const badgeStatus = isPaid
        ? "success"
        : isPartial
            ? "processing"
            : isCancelled
                ? "default"
                : isOverdue
                    ? "warning"
                    : "error";
    const badgeText = isPaid
        ? "Đã thanh toán"
        : isPartial
            ? "Thanh toán một phần"
            : isOverdue
                ? "Quá hạn"
                : isCancelled
                    ? "Đã hủy"
                    : "Chưa thanh toán";
    const title = bill?.billTitle || bill?.billCode || "Hóa đơn";
    const billingPeriod = bill?.billingPeriodStart && bill?.billingPeriodEnd
        ? `${formatDate(bill.billingPeriodStart)} - ${formatDate(bill.billingPeriodEnd)}`
        : null;
    const dueDate = formatDate(bill?.dueDate);
    const paidDate = formatDate(bill?.paymentDate);
    const dateLabel = isPaid && paidDate
        ? `Thanh toán: ${paidDate}`
        : dueDate
            ? `Hạn thanh toán: ${dueDate}`
            : "Chưa có hạn thanh toán";
    const metaLine = [bill?.roomNumber ? `Phòng ${bill.roomNumber}` : null, billingPeriod]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className={styles.billItem}>
            <div className={styles.billInfo}>
                <h4 className={styles.billTitle}>{title}</h4>
                {metaLine && <p className={styles.date}>{metaLine}</p>}
                <p className={styles.date}>{dateLabel}</p>
            </div>
            <div className={styles.billRight}>
                <div className={styles.amount}>
                    {formatCurrency(displayAmount)} đ
                </div>
                <Badge
                    status={badgeStatus}
                    text={<span style={{color: '#fff'}}>{badgeText}</span>}
                />
            </div>
        </div>
    );
};

export default BillItem;
