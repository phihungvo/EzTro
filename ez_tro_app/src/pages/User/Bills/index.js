import React, {useCallback, useEffect, useState} from "react";
import { Empty, message } from "antd";
import styles from "./Bills.module.scss";
import PaymentMethods from "~/components/Layout/UserLayout/components/PaymentMethods";
import UserTable from "src/components/Layout/UserLayout/components/UserTable";
import {getMyBills} from "~/service/user/my-bill";

const Bills = () => {

    const [myBills, setMyBills] = useState(null);

    const fetchMyBills = useCallback(async () => {
        try {
            const response = await getMyBills();

            if (!response?.content) {
                message.warning("Không thể lấy thông tin phòng của bạn");
                return;
            }

            setMyBills(response.content);
        } catch (error) {
            console.error("❌ Error fetching room info:", error);
            message.error("Lỗi khi tải dữ liệu phòng");
        }
    }, []);

    useEffect(() => {
        fetchMyBills();
    }, [fetchMyBills]);

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
            {Array.isArray(myBills) && myBills.length > 0 ? (
                <UserTable
                    bills={myBills}
                    onPayment={handlePayment}
                    onViewDetail={handleViewDetail}
                />
            ) : (
                <Empty description="Bạn chưa có hóa đơn nào" />
            )}

            {/* Payment Methods */}
            <PaymentMethods
                methods={paymentMethods}
                onSelectMethod={handleSelectMethod}
            />
        </div>
    );
};

export default Bills;
