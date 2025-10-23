import React, { useState } from "react";
import { Checkbox, Button, message } from "antd";
import styles from "./NotificationSettings.module.scss";

const NotificationSettings = ({ settings, onSave }) => {
    const [notifications, setNotifications] = useState({
        newInvoice: settings?.newInvoice ?? true,
        invoiceExpiring: settings?.invoiceExpiring ?? true,
        maintenanceAlert: settings?.maintenanceAlert ?? true,
        promotions: settings?.promotions ?? false
    });

    const handleChange = (field, checked) => {
        setNotifications(prev => ({
            ...prev,
            [field]: checked
        }));
    };

    const handleSubmit = () => {
        onSave(notifications);
    };

    return (
        <div className={styles.notificationSettings}>
            <h2 className={styles.title}>🔔 Cài Đặt Thông Báo</h2>

            <div className={styles.checkboxList}>
                <div className={styles.checkboxItem}>
                    <Checkbox
                        checked={notifications.newInvoice}
                        onChange={(e) => handleChange('newInvoice', e.target.checked)}
                    />
                    <div className={styles.checkboxLabel}>
                        Thông báo hóa đơn mới
                    </div>
                </div>

                <div className={styles.checkboxItem}>
                    <Checkbox
                        checked={notifications.invoiceExpiring}
                        onChange={(e) => handleChange('invoiceExpiring', e.target.checked)}
                    />
                    <div className={styles.checkboxLabel}>
                        Thông báo hết hạn hợp đồng
                    </div>
                </div>

                <div className={styles.checkboxItem}>
                    <Checkbox
                        checked={notifications.maintenanceAlert}
                        onChange={(e) => handleChange('maintenanceAlert', e.target.checked)}
                    />
                    <div className={styles.checkboxLabel}>
                        Thông báo về bảo trì, sửa chữa
                    </div>
                </div>

                <div className={styles.checkboxItem}>
                    <Checkbox
                        checked={notifications.promotions}
                        onChange={(e) => handleChange('promotions', e.target.checked)}
                    />
                    <div className={styles.checkboxLabel}>
                        Thông báo khuyến mãi, tin tức
                    </div>
                </div>
            </div>

            <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                className={styles.submitButton}
            >
                Lưu Cài Đặt
            </Button>
        </div>
    );
};

export default NotificationSettings;