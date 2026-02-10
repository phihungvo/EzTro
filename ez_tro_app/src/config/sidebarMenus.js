import {
    DashboardOutlined,
    AppstoreOutlined,
    BankOutlined,
    HomeOutlined,
    UserSwitchOutlined,
    TeamOutlined,
    ToolOutlined,
    DollarOutlined,
    FileTextOutlined,
    SettingOutlined,
    AlertOutlined,
    BarChartOutlined,
    GoldOutlined,
    CalendarOutlined,
    CrownOutlined,
    UserOutlined,
} from "@ant-design/icons";
import React from "react";

export const MENU_CONFIG = {
    // ADMIN: [
    //     {
    //         group: "Tổng quan",
    //         items: [
    //             {
    //                 key: "dashboard",
    //                 label: "Dashboard",
    //                 icon: <DashboardOutlined/>,
    //                 path: "/admin/dashboard",
    //                 color: "#3b82f6"
    //             },
    //         ],
    //     },
    //     {
    //         group: "Quản lý khu trọ",
    //         items: [
    //             {
    //                 key: "boarding-houses",
    //                 label: "Khu trọ",
    //                 title: "Quản lý khu trọ",
    //                 icon: <AppstoreOutlined/>,
    //                 path: "/admin/boarding-houses",
    //                 color: "#10b981"
    //             },
    //             {
    //                 key: "buildings",
    //                 label: "Tòa nhà",
    //                 title: "Quản lý tòa nhà",
    //                 icon: <BankOutlined/>,
    //                 path: "/admin/buildings",
    //                 color: "#14b8a6"
    //             },
    //             {
    //                 key: "rooms",
    //                 label: "Phòng",
    //                 title: "Quản lý phòng trọ",
    //                 icon: <HomeOutlined/>,
    //                 path: "/admin/rooms",
    //                 color: "#ec4899"
    //             },
    //             {
    //                 key: "owners",
    //                 label: "Chủ trọ",
    //                 title: "Quản lý chủ trọ",
    //                 icon: <CrownOutlined/>,
    //                 path: "/admin/owners",
    //                 color: "#f59e0b"
    //             },
    //             {
    //                 key: "tenants",
    //                 label: "Khách thuê",
    //                 title: "Quản lý người thuê",
    //                 icon: <UserOutlined/>,
    //                 path: "/admin/tenants",
    //                 color: "#f59e0b"
    //             },
    //             {
    //                 key: "appointments",
    //                 label: "Chỉ số điện nước",
    //                 title: "Ghi chỉ số điện nước hàng tháng cho từng phòng trọ",
    //                 icon: <CalendarOutlined/>,
    //                 color: "#3b82f6",
    //                 path: "/admin/electric-water-record",
    //             },
    //         ],
    //     },
    //     {
    //         group: "Hợp đồng & Dịch vụ",
    //         items: [
    //             {
    //                 key: "contracts",
    //                 label: "Hợp đồng",
    //                 title: "Quản lý thông tin hợp đồng thuê trọ",
    //                 icon: <FileTextOutlined/>,
    //                 path: "/admin/contracts",
    //                 color: "#8b5cf6"
    //             },
    //             {
    //                 key: "bills",
    //                 label: "Hoá đơn",
    //                 title: "Quản lý hoá đơn tiền phòng và dịch vụ của người thuê",
    //                 icon: <FileTextOutlined/>,
    //                 path: "/admin/bills",
    //                 color: "#f59e0b"
    //             },
    //             {
    //                 key: "utilities",
    //                 label: "Dịch vụ phòng trọ",
    //                 title: "Quản lý các dịch vụ đi kèm (điện, nước, internet, vệ sinh...)",
    //                 icon: <ToolOutlined/>,
    //                 path: "/admin/utilities",
    //                 color: "#6366f1"
    //             },
    //         ],
    //     },
    //
    //     {
    //         group: "Tài chính & tài sản",
    //         items: [
    //             {
    //                 key: "revenues",
    //                 label: "Doanh thu",
    //                 title: "Thống kê doanh thu và lợi nhuận",
    //                 icon: <DollarOutlined/>,
    //                 color: "#16a34a",
    //                 path: "/admin/revenues",
    //             },
    //             {
    //                 key: "assets",
    //                 label: "Tài sản",
    //                 title: "Quản lý tài sản, thiết bị trong khu trọ",
    //                 icon: <GoldOutlined/>,
    //                 color: "#ca8a04",
    //                 path: "/admin/assets",
    //             },
    //             {
    //                 key: "expenses",
    //                 label: "Chi phí",
    //                 title: "Theo dõi chi phí vận hành",
    //                 icon: <BankOutlined/>,
    //                 color: "#22d3ee",
    //                 path: "/admin/expenses",
    //             },
    //         ],
    //     },
    //     {
    //         group: "Vận hành & hỗ trợ",
    //         items: [
    //             {
    //                 key: "room-requests",
    //                 label: "Yêu cầu dọn phòng / trả phòng",
    //                 title: "Xử lý yêu cầu dọn phòng, trả phòng từ người thuê",
    //                 icon: <AlertOutlined/>,
    //                 color: "#ef4444",
    //                 path: "/admin/room-requests",
    //             },
    //             {
    //                 key: "appointments",
    //                 label: "Lịch hẹn xem phòng",
    //                 title: "Quản lý lịch hẹn và khách xem phòng",
    //                 icon: <CalendarOutlined/>,
    //                 color: "#3b82f6",
    //                 path: "/admin/appointments",
    //             },
    //             {
    //                 key: "incidents",
    //                 label: "Báo cáo sự cố",
    //                 title: "Quản lý và xử lý sự cố phòng trọ",
    //                 icon: <AlertOutlined/>,
    //                 color: "#f97316",
    //                 path: "/admin/incidents",
    //             },
    //         ],
    //     },
    //
    //     {
    //         group: "Báo cáo & người dùng",
    //         items: [
    //             {
    //                 key: "reports",
    //                 label: "Báo cáo",
    //                 title: "Tổng hợp và xuất báo cáo thống kê",
    //                 icon: <BarChartOutlined/>,
    //                 color: "#a855f7",
    //                 path: "/admin/reports",
    //             },
    //             {
    //                 key: "users",
    //                 label: "Người dùng",
    //                 icon: <TeamOutlined/>,
    //                 path: "/admin/users",
    //                 color: "#0ea5e9"
    //             },
    //             {
    //                 key: "settings",
    //                 label: "Cấu hình hệ thống",
    //                 title: "Thiết lập và tùy chỉnh hệ thống",
    //                 icon: <SettingOutlined/>,
    //                 color: "#475569",
    //                 path: "/admin/settings",
    //             },
    //         ],
    //     },
    // ],

    OWNER: [
        {
            group: "Tổng quan",
            items: [
                {
                    key: "dashboard",
                    label: "Dashboard",
                    icon: <DashboardOutlined/>,
                    path: "/owner/dashboard",
                    color: "#3b82f6"
                },
            ],
        },
        {
            group: "Quản lý khu trọ",
            items: [
                {
                    key: "boarding-houses",
                    label: "Khu trọ",
                    icon: <AppstoreOutlined/>,
                    path: "/owner/boarding-houses",
                    color: "#10b981"
                },
                {
                    key: "buildings",
                    label: "Tòa nhà",
                    icon: <BankOutlined/>,
                    path: "/owner/buildings",
                    color: "#14b8a6"
                },
                {
                    key: "rooms",
                    label: "Phòng",
                    icon: <HomeOutlined/>,
                    path: "/owner/rooms",
                    color: "#ec4899"
                },
                {
                    key: "tenants",
                    label: "Khách thuê",
                    icon: <UserSwitchOutlined/>,
                    path: "/owner/tenants",
                    color: "#f59e0b"
                },
            ],
        },
        {
            group: "Hợp đồng & Thanh toán",
            items: [
                {
                    key: "contracts",
                    label: "Hợp đồng",
                    icon: <FileTextOutlined/>,
                    path: "/owner/contracts",
                    color: "#8b5cf6"
                },
                {
                    key: "bills",
                    label: "Hoá đơn",
                    icon: <FileTextOutlined/>,
                    path: "/owner/bills",
                    color: "#f59e0b"
                },
            ],
        },
        {
            group: "Tài chính & tài sản",
            items: [
                {
                    key: "revenues",
                    label: "Doanh thu",
                    title: "Thống kê doanh thu và lợi nhuận",
                    icon: <DollarOutlined/>,
                    color: "#16a34a",
                    path: "/owner/revenues",
                },
                {
                    key: "assets",
                    label: "Tài sản",
                    title: "Quản lý tài sản, thiết bị trong khu trọ",
                    icon: <GoldOutlined/>,
                    color: "#ca8a04",
                    path: "/owner/assets",
                },
                {
                    key: "expenses",
                    label: "Chi phí",
                    title: "Theo dõi chi phí vận hành",
                    icon: <BankOutlined/>,
                    color: "#22d3ee",
                    path: "/owner/expenses",
                },
            ],
        },
        {
            group: "Báo cáo và gói dịch vụ",
            items: [
                {
                    key: "reports",
                    label: "Thống kê",
                    icon: <BarChartOutlined/>,
                    path: "/owner/reports",
                    color: "#a855f7"
                },
                {
                    key: "owner-subscription",
                    label: "Gói dịch vụ của tôi",
                    icon: <DollarOutlined />,
                    path: "/owner/owner-subscription",
                },
            ],
        },
    ],
};