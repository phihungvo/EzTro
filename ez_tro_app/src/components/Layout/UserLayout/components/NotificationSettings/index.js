import React, {useEffect, useMemo, useState} from "react";
import {Button, Checkbox, Space, Typography} from "antd";
import styles from "./NotificationSettings.module.scss";

const CHANNEL_COLUMNS = [
    {key: "inApp", label: "In-app"},
    {key: "email", label: "Email"},
    {key: "sms", label: "SMS"},
    {key: "zalo", label: "Zalo"},
];

const EVENT_GROUPS = [
    {key: "billingIssue", label: "Billing / hóa đơn"},
    {key: "contractExpiring", label: "Hợp đồng sắp hết hạn"},
    {key: "incidentUpdates", label: "Sự cố / bảo trì"},
    {key: "announcements", label: "Announcement / tin tức"},
    {key: "paymentUpdates", label: "Thanh toán"},
    {key: "securityAlerts", label: "Bảo mật"},
    {key: "subscriptionAlerts", label: "Gói dịch vụ / quota"},
];

const buildDefaultSettings = (settings = {}) => EVENT_GROUPS.reduce((accumulator, item) => {
    const nextValue = settings?.[item.key] || {};
    accumulator[item.key] = {
        inApp: nextValue?.inApp ?? false,
        email: nextValue?.email ?? false,
        sms: nextValue?.sms ?? false,
        zalo: nextValue?.zalo ?? false,
        mandatoryChannels: nextValue?.mandatoryChannels || [],
    };
    return accumulator;
}, {});

const NotificationSettings = ({
    settings,
    onSave,
    loading = false,
    title = "Cài đặt thông báo",
    description = "Tùy chỉnh từng loại notification theo kênh nhận phù hợp với nhu cầu của bạn.",
    submitLabel = "Lưu cài đặt",
    embedded = false,
}) => {
    const [notifications, setNotifications] = useState(buildDefaultSettings(settings));

    useEffect(() => {
        setNotifications(buildDefaultSettings(settings));
    }, [settings]);

    const mandatoryHints = useMemo(() => EVENT_GROUPS.reduce((accumulator, item) => {
        const mandatoryChannels = notifications?.[item.key]?.mandatoryChannels || [];
        if (mandatoryChannels.length > 0) {
            accumulator[item.key] = `Bắt buộc: ${mandatoryChannels.join(", ")}`;
        }
        return accumulator;
    }, {}), [notifications]);

    const handleChange = (field, channel, checked) => {
        setNotifications(prev => ({
            ...prev,
            [field]: checked
                ? {
                    ...prev[field],
                    [channel]: checked,
                }
                : {
                    ...prev[field],
                    [channel]: checked,
                }
        }));
    };

    const handleSubmit = () => {
        onSave(notifications);
    };

    return (
        <div className={`${styles.notificationSettings} ${embedded ? styles.embedded : ""}`}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>{title}</h2>
                    <Typography.Paragraph className={styles.description}>
                        {description}
                    </Typography.Paragraph>
                </div>
                <Space wrap className={styles.channelLegend}>
                    {CHANNEL_COLUMNS.map((channel) => (
                        <span key={channel.key} className={styles.legendItem}>
                            {channel.label}
                        </span>
                    ))}
                </Space>
            </div>

            <div className={styles.matrix}>
                <div className={styles.matrixHeader}>
                    <div className={styles.eventHeader}>Loại thông báo</div>
                    {CHANNEL_COLUMNS.map((channel) => (
                        <div key={channel.key} className={styles.channelHeader}>
                            {channel.label}
                        </div>
                    ))}
                </div>

                {EVENT_GROUPS.map((item) => {
                    const current = notifications?.[item.key] || {};
                    const mandatoryChannels = current?.mandatoryChannels || [];

                    return (
                        <div key={item.key} className={styles.matrixRow}>
                            <div className={styles.eventCell}>
                                <div className={styles.checkboxLabel}>{item.label}</div>
                                {mandatoryHints[item.key] && (
                                    <Typography.Text type="secondary" className={styles.mandatoryHint}>
                                        {mandatoryHints[item.key]}
                                    </Typography.Text>
                                )}
                            </div>

                            {CHANNEL_COLUMNS.map((channel) => {
                                const disabled = mandatoryChannels.includes(channel.key.toUpperCase());
                                return (
                                    <div key={channel.key} className={styles.channelCell}>
                                        <Checkbox
                                            checked={Boolean(current?.[channel.key])}
                                            disabled={disabled || loading}
                                            onChange={(event) => handleChange(item.key, channel.key, event.target.checked)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                className={styles.submitButton}
                loading={loading}
            >
                {submitLabel}
            </Button>
        </div>
    );
};

export default NotificationSettings;
