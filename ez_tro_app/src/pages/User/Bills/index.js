import React, { useState } from "react";
import { message } from "antd";

import styles from "./Bills.module.scss";
import PaymentMethods from "~/components/Layout/UserLayout/components/PaymentMethods";
import UserTable from "src/components/Layout/UserLayout/components/UserTable";

const Bills = () => {
    // Mock data - replace with API call
    const [bills] = useState([
        {
            billId: "HD0001",
            type: "Tiền Thuê",
            amount: 3000000,
            createdDate: "01/12/2024",
            dueDate: "05/12/2024",
            status: "unpaid"
        },
        {
            billId: "HD0002",
            type: "Tiền Thuê",
            amount: 3000000,
            createdDate: "01/11/2024",
            dueDate: "05/11/2024",
            status: "paid"
        },
        {
            billId: "HD0003",
            type: "Dịch Vụ",
            amount: 150000,
            createdDate: "01/11/2024",
            dueDate: "05/11/2024",
            status: "paid"
        }
    ]);

    const paymentMethods = [
        {
            icon: "🏦",
            title: "Chuyển Khoản",
            method: "bank_transfer"
        },
        {
            icon: "📱",
            title: "Ví Điện Tử",
            method: "e_wallet"
        },
        {
            icon: "💰",
            title: "Tiền Mặt",
            method: "cash"
        }
    ];

    const handlePayment = (bill) => {
        message.info(`Thanh toán hóa đơn ${bill.billId}`);
        // Open payment modal or navigate to payment page
    };

    const handleViewDetail = (bill) => {
        message.info(`Xem chi tiết hóa đơn ${bill.billId}`);
        // Open detail modal or navigate to detail page
    };

    const handleSelectMethod = (method) => {
        message.info(`Chọn phương thức: ${method.title}`);
        // Handle payment method selection
    };

    return (
        <div className={styles.bills}>
            <div className={styles.header}>
                <h2 className={styles.title}>Danh Sách Hóa Đơn</h2>
            </div>

            {/* Bills Table */}
            <UserTable
                bills={bills}
                onPayment={handlePayment}
                onViewDetail={handleViewDetail}
            />

            {/* Payment Methods */}
            <PaymentMethods
                methods={paymentMethods}
                onSelectMethod={handleSelectMethod}
            />
        </div>
    );
};

export default Bills;