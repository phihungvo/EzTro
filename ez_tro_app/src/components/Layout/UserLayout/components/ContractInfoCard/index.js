import React from "react";
import {Button, Tag} from "antd";
import {
    DownloadOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    DiffOutlined, SwapOutlined
} from "@ant-design/icons";
import styles from "./ContractInfoCard.module.scss";

const formatMoney = (value) => new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(Number(value || 0));

const ContractInfoCard = ({
    contract,
    progressPercent = 0,
    periodLabel = 'Đang cập nhật',
    periodMeta = '',
    daysPassed = 0,
    daysLeft = null,
    onDownload,
    onRenew,
    onTerminate,
}) => {
    if (!contract) return null;

    const statusMeta = {
        active: {color: 'success', text: 'Còn hiệu lực'},
        expired: {color: 'error', text: 'Hết hạn'},
        expiring_soon: {color: 'warning', text: 'Sắp hết hạn'},
    }[contract.status] || {color: 'default', text: contract.status || '—'};

    const fields = [
        {label: 'Bên thuê', value: contract.tenantName},
        {label: 'Bên cho thuê', value: contract.landlordName},
        {label: 'Phòng thuê', value: `${contract.roomName} – ${contract.floorLabel}, ${contract.buildingName}`},
        {label: 'Giá thuê / tháng', value: formatMoney(contract.rentPrice), highlight: true},
        {label: 'Đặt cọc', value: `${formatMoney(contract.deposit)} (${contract.depositMonths || 2} tháng)`},
        {label: 'Ngày thanh toán', value: contract.paymentDay},
        {label: 'Điện', value: `${formatMoney(contract.electricPrice)} / kWh`},
        {label: 'Nước', value: `${formatMoney(contract.waterPrice)} / m³`},
    ];

    return (
        <section className={styles.contractInfoCard}>
            <div className={styles.header}>
                <div>
                    <div className={styles.title}>Hợp đồng thuê phòng</div>
                    <div className={styles.subTitle}>{contract.contractId}</div>
                </div>
                <div className={styles.headerActions}>
                    <Button icon={<DownloadOutlined />} onClick={onDownload}>Tải PDF</Button>
                    <Tag color={statusMeta.color} className={styles.statusTag}>
                        {statusMeta.text}
                    </Tag>
                </div>
            </div>

            <div className={styles.progressBox}>
                <div className={styles.progressLabel}>Thời hạn hợp đồng</div>
                <div className={styles.progressRange}>
                    <div className={styles.progressText}>
                        {periodLabel} <span>{periodMeta}</span>
                    </div>
                    <div className={styles.progressWrap}>
                        <div className={styles.progressBar} style={{width: `${progressPercent}%`}} />
                    </div>
                    <div className={styles.progressMeta}>
                        <span>Đã qua: {daysPassed} ngày</span>
                        <span>
                            Còn lại: {daysLeft != null ? `${daysLeft} ngày` : '—'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.contractGrid}>
                {fields.map((field) => (
                    <div key={field.label} className={styles.contractField}>
                        <div className={styles.contractLabel}>{field.label}</div>
                        <div className={`${styles.contractValue} ${field.highlight ? styles.highlight : ''}`}>
                            {field.value || '—'}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.noticeBox}>
                <div className={styles.noticeTitle}>
                    <ExclamationCircleOutlined />
                    Điều khoản báo trước
                </div>
                <div className={styles.noticeText}>
                    Cần thông báo trước <strong>{contract.noticeDays || 30} ngày</strong> nếu muốn chấm dứt hợp đồng trước hạn.
                </div>
            </div>

            <div className={styles.actionRow}>
                <Button icon={<ReloadOutlined />} onClick={onRenew}>Yêu cầu gia hạn</Button>
                <Button ghost icon={<SwapOutlined />} onClick={onRenew}>Yêu cầu chuyển phòng</Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={onTerminate}>Chấm dứt HĐ</Button>
            </div>
        </section>
    );
};

export default ContractInfoCard;
