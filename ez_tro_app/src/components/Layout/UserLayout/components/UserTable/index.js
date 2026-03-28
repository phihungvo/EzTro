import React from "react";
import { Empty, Table, Tag, Button, Space } from "antd";
import styles from "./UserTable.module.scss";

const UserTable = ({ bills = [], onPayment, onViewDetail }) => {
    const normalizedBills = Array.isArray(bills) ? bills : [];
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
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            align: "center",
            render: (value) => value?.toLocaleString("vi-VN") + " ₫",
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
                    case "OVERDUE":
                        return <Tag color="orange">Quá hạn</Tag>;
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
                    {record.status === "UNPAID" && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => onPayment(record)}
                        >
                            Thanh toán
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
