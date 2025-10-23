import React from "react";
import { Table, Tag, Button, Space } from "antd";
import styles from "./UserTable.module.scss";

const UserTable = ({ bills = [], onPayment, onViewDetail }) => {
    const columns = [
        {
            title: "Mã Hóa Đơn",
            dataIndex: "billId",
            key: "billId",
            align: "center",
        },
        {
            title: "Loại Hóa Đơn",
            dataIndex: "type",
            key: "type",
            align: "center",
        },
        {
            title: "Số Tiền",
            dataIndex: "amount",
            key: "amount",
            align: "right",
            render: (value) => value.toLocaleString("vi-VN") + "₫",
        },
        {
            title: "Ngày Tạo",
            dataIndex: "createdDate",
            key: "createdDate",
            align: "center",
        },
        {
            title: "Hạn Thanh Toán",
            dataIndex: "dueDate",
            key: "dueDate",
            align: "center",
        },
        {
            title: "Trạng Thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status) =>
                status === "paid" ? (
                    <Tag color="green">Đã Thanh Toán</Tag>
                ) : (
                    <Tag color="red">Chưa Thanh Toán</Tag>
                ),
        },
        {
            title: "Hành Động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        disabled={record.status === "paid"}
                        onClick={() => onPayment(record)}
                    >
                        Thanh Toán
                    </Button>
                    <Button
                        type="default"
                        size="small"
                        onClick={() => onViewDetail(record)}
                    >
                        Chi Tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.dataTable}>
            <Table
                columns={columns}
                dataSource={bills}
                rowKey="billId"
                pagination={{
                    pageSize: 5,
                    showTotal: (total) => `Tổng ${total} hóa đơn`,
                }}
            />
        </div>
    );
};

export default UserTable;
