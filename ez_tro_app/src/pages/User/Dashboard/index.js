import React, { useEffect, useState, useCallback } from "react";
import { Alert, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import styles from "./Dashboard.module.scss";

import StatsGrid from "~/components/Layout/UserLayout/components/StatsGrid";
import BillsCard from "~/components/Layout/UserLayout/components/BillsCard";
import ServicesCard from "~/components/Layout/UserLayout/components/ServicesCard";

import { getMyBills, getSummaryInfo } from "src/service/user/dashboard";

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [bills, setBills] = useState([]);

    const fetchDashboardData = useCallback(async () => {
        try {
            const [summaryRes, billsRes] = await Promise.all([
                getSummaryInfo(),
                getMyBills(),
            ]);

            if (!summaryRes) {
                message.warning("Không thể lấy thông tin tổng quan");
            } else {
                setSummary(summaryRes);
            }

            setBills(billsRes?.result || []);
        } catch (error) {
            console.error("❌ Error fetching dashboard data:", error);
            message.error("Lỗi khi tải dữ liệu tổng quan");
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statsData = summary
        ? [
            { label: "PHÒNG HIỆN TẠI", value: summary.roomNumber },
            { label: "TIỀN THUÊ THÁNG NÀY", value: `${(summary.monthlyRent / 1_000_000).toFixed(1)}M đ` },
            {
                label: "TRẠNG THÁI THANH TOÁN",
                value: summary.paymentStatus,
                // status: summary.paymentStatus.includes("Chưa") ? "unpaid" : "paid",
            },
            {
                label: "NGÀY HẾT HẠN HĐ",
                value: new Date(summary.contractEndDate).toLocaleDateString("vi-VN"),
            },
        ]
        : [];

    const servicesData = [
        { icon: "⚡", label: "Xem Điện/Nước", onClick: () => console.log("Xem Điện/Nước") },
        { icon: "💰", label: "Thanh Toán", onClick: () => console.log("Thanh Toán") },
        { icon: "📝", label: "Hồ Sơ", onClick: () => console.log("Hồ Sơ") },
        { icon: "📞", label: "Liên Hệ", onClick: () => console.log("Liên Hệ") },
    ];

    const handleViewAllBills = () => {
        console.log("View all bills");
        // TODO: navigate('/user/bills');
    };

    return (
        <div className={styles.dashboard}>
            <Alert
                message="Chào mừng trở lại! Bạn có 1 hóa đơn chưa thanh toán"
                type="info"
                icon={<BellOutlined />}
                showIcon
                closable
                className={styles.alert}
            />

            {summary && <StatsGrid stats={statsData} />}

            <BillsCard bills={bills} onViewAll={handleViewAllBills} />

            <ServicesCard services={servicesData} />
        </div>
    );
};

export default Dashboard;