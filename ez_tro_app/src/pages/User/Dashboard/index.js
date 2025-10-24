import React, {useEffect} from "react";
import { Alert } from "antd";
import { BellOutlined } from "@ant-design/icons";

import styles from "./Dashboard.module.scss";
import StatsGrid from "~/components/Layout/UserLayout/components/StatsGrid";
import BillsCard from "~/components/Layout/UserLayout/components/BillsCard";
import ServicesCard from "~/components/Layout/UserLayout/components/ServicesCard";

import {getMyBills} from "~/service/user/bill";

const Dashboard = () => {

    const [myBills, setMyBills] = React.useState([]);

    const handleGetMyBills = async () => {
        try {
            const response = await getMyBills();
            setMyBills(response.result);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMyBills([]);
        }
    };

    useEffect(() => {
        handleGetMyBills();
    }, []);

    const statsData = [
        { label: "PHÒNG HIỆN TẠI", value: "101" },
        { label: "TIỀN THUÊ THÁNG NÀY", value: "3.0M đ" },
        { label: "TRẠNG THÁI THANH TOÁN", value: "Chưa Thanh", status: "unpaid" },
        { label: "NGÀY HẾT HẠN HĐ", value: "01/01/2025" },
    ];

    const billsData = [
        {
            title: "Tiền Thuê Phòng - Tháng 12/2024",
            amount: 3000000,
            dueDate: "05/12/2024",
            status: "unpaid"
        },
        {
            title: "Tiền Thuê Phòng - Tháng 11/2024",
            amount: 3000000,
            paidDate: "01/11/2024",
            status: "paid"
        }
    ];

    const servicesData = [
        {
            icon: "⚡",
            label: "Xem Điện/Nước",
            onClick: () => console.log("Xem Điện/Nước")
        },
        {
            icon: "💰",
            label: "Thanh Toán",
            onClick: () => console.log("Thanh Toán")
        },
        {
            icon: "📝",
            label: "Hỗ Sơ",
            onClick: () => console.log("Hỗ Sơ")
        },
        {
            icon: "📞",
            label: "Liên Hệ",
            onClick: () => console.log("Liên Hệ")
        },
    ];

    const handleViewAllBills = () => {
        console.log("View all bills");
        // Navigate to bills page or show modal
    };

    return (
        <div className={styles.dashboard}>
            {/* Alert */}
            <Alert
                message="Chào mừng trở lại! Bạn có 1 hóa đơn chưa thanh toán"
                type="info"
                icon={<BellOutlined />}
                showIcon
                closable
                className={styles.alert}
            />

            {/* Stats Grid */}
            <StatsGrid stats={statsData} />

            {/* Bills Card */}
            <BillsCard
                bills={myBills}
                onViewAll={handleViewAllBills}
            />

            {/* Services Card */}
            <ServicesCard services={servicesData} />
        </div>
    );
};

export default Dashboard;