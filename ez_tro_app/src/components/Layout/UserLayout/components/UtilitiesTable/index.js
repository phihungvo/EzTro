import React from "react";
import {BoltIcon, WaterDropIcon} from "~/components/Layout/UserLayout/components/Icons";
import UserTable from "~/components/Layout/UserLayout/components/UserTable";
import styles from "./UtilitiesTable.module.scss";

const UtilitiesTable = ({ data }) => {
    const columns = [
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type) => (
                <div className={styles.typeCell}>
                    {type === 'electric' ? (
                        <>
                            <BoltIcon className={styles.iconElectric} />
                            <span>Điện</span>
                        </>
                    ) : (
                        <>
                            <WaterDropIcon className={styles.iconWater} />
                            <span>Nước</span>
                        </>
                    )}
                </div>
            )
        },
        {
            title: 'Tháng',
            dataIndex: 'month',
            key: 'month',
            width: 120,
            render: (text) => <span className={styles.month}>{text}</span>
        },
        {
            title: 'Chỉ Số Cũ',
            dataIndex: 'oldReading',
            key: 'oldReading',
            width: 120,
            align: 'right',
            render: (value) => (
                <span className={styles.reading}>{value}</span>
            )
        },
        {
            title: 'Chỉ Số Mới',
            dataIndex: 'newReading',
            key: 'newReading',
            width: 120,
            align: 'right',
            render: (value) => (
                <span className={styles.reading}>{value}</span>
            )
        },
        {
            title: 'Sử Dụng',
            dataIndex: 'usage',
            key: 'usage',
            width: 120,
            align: 'right',
            render: (value, record) => (
                <span className={styles.usage}>
                    {value} {record.type === 'electric' ? 'kWh' : 'm³'}
                </span>
            )
        },
        {
            title: 'Đơn Giá',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 150,
            align: 'right',
            render: (value, record) => (
                <span className={styles.price}>
                    {value.toLocaleString('vi-VN')} đ/{record.type === 'electric' ? 'kWh' : 'm³'}
                </span>
            )
        },
        {
            title: 'Thành Tiền',
            dataIndex: 'total',
            key: 'total',
            width: 150,
            align: 'right',
            render: (value) => (
                <span className={styles.total}>
                    {value.toLocaleString('vi-VN')} đ
                </span>
            )
        }
    ];

    return (
        <div className={styles.utilitiesTable}>
            <h2 className={styles.title}>⚡ Tiêu Thụ Điện/Nước</h2>
            <UserTable
                columns={columns}
                dataSource={data}
                rowKey={(record) => `${record.type}-${record.month}`}
                scroll={{ x: 900 }}
            />
        </div>
    );
};

export default UtilitiesTable;