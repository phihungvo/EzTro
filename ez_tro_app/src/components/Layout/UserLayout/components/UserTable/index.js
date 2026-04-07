import React from "react";
import { Empty, Table, Tag, Button, Space } from "antd";
import styles from "./UserTable.module.scss";

const UserTable = ({ bills = [], onPayment, onViewDetail }) => {
    const normalizedBills = Array.isArray(bills) ? bills : [];
    const isPayable = (status) => ["UNPAID", "OVERDUE", "PARTIALLY_PAID"].includes(status);

    const columns = [
        {
            title: "Mã hóa đơn",
            dataIndex: "billCode",
            key: "billCode",
            align: "center",
        },
        {
            title: "Tiêu đề hóa đơn",
            dataIndex: "billTitle",
            key: "billTitle",
            align: "center",
        },
        {
            title: "Phòng",
            dataIndex: "roomNumber",
            key: "roomNumber",
            align: "center",
            render: (value) => value || "—",
        },
        {
            title: "Kỳ tính",
            key: "billingPeriod",
            align: "center",
            render: (_, record) =>
                record.billingPeriodStart && record.billingPeriodEnd
                    ? `${new Date(record.billingPeriodStart).toLocaleDateString("vi-VN")} - ${new Date(record.billingPeriodEnd).toLocaleDateString("vi-VN")}`
                    : "—",
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            align: "center",
            render: (value) => value?.toLocaleString("vi-VN") + " ₫",
        },
        {
            title: "Còn phải trả",
            dataIndex: "outstandingAmount",
            key: "outstandingAmount",
            align: "center",
            render: (value) => Number(value || 0).toLocaleString("vi-VN") + " ₫",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
        },
        {
            title: "Ngày thanh toán",
            dataIndex: "paymentDate",
            key: "paymentDate",
            align: "center",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa thanh toán",
        },
        {
            title: "Hạn thanh toán",
            dataIndex: "dueDate",
            key: "dueDate",
            align: "center",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status) => {
                switch (status) {
                    case "PAID":
                        return <Tag color="green">Đã thanh toán</Tag>;
                    case "PARTIALLY_PAID":
                        return <Tag color="blue">Thanh toán một phần</Tag>;
                    case "OVERDUE":
                        return <Tag color="orange">Quá hạn</Tag>;
                    case "CANCELLED":
                        return <Tag color="default">Đã hủy</Tag>;
                    default:
                        return <Tag color="red">Chưa thanh toán</Tag>;
                }
            },
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Space>
                    {isPayable(record.status) && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => onPayment(record)}
                        >
                            Gửi xác nhận
                        </Button>
                    )}
                    <Button
                        type="default"
                        size="small"
                        onClick={() => onViewDetail(record)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.dataTable}>
            <Table
                columns={columns}
                dataSource={normalizedBills}
                rowKey="id"
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Không có dữ liệu"
                        />
                    ),
                }}
                pagination={{
                    pageSize: 5,
                    showTotal: (total) => `Tổng ${total} hóa đơn`,
                }}
            />
        </div>
    );
};

export default UserTable;
