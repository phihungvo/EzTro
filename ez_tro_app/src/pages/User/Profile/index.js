import React, { useEffect, useState } from "react";
import { message } from "antd";

import styles from "./Profile.module.scss";
import ProfileInfo from "~/components/Layout/UserLayout/components/ProfileInfo";
import PasswordSection from "~/components/Layout/UserLayout/components/PasswordSection";
import EmergencyContact from "~/components/Layout/UserLayout/components/EmergencyContact";
import NotificationSettings from "~/components/Layout/UserLayout/components/NotificationSettings";
import {
    getMyNotificationPreferences,
    updateMyNotificationPreferences
} from "~/service/admin/notification-service";

const Profile = () => {
    const [preferencesLoading, setPreferencesLoading] = useState(true);
    // Mock data - replace with API call
    const [profileData] = useState({
        fullName: "Nguyễn Văn C",
        idNumber: "123456789",
        phone: "0901234567",
        email: "nguyenvancinfo@email.com",
        dateOfBirth: "15/05/1995",
        gender: "Nam",
        nationality: "Việt Nam",
        address: "123 Đường X, Quận Y, TP.Z"
    });

    const [emergencyContact] = useState({
        name: "",
        relationship: "",
        phone: ""
    });

    const [notificationSettings, setNotificationSettings] = useState({
        billingIssue: {inApp: true, email: true, sms: false, zalo: false, mandatoryChannels: []},
        contractExpiring: {inApp: true, email: true, sms: false, zalo: false, mandatoryChannels: []},
        incidentUpdates: {inApp: true, email: false, sms: false, zalo: true, mandatoryChannels: []},
        announcements: {inApp: false, email: false, sms: false, zalo: false, mandatoryChannels: []},
        paymentUpdates: {inApp: true, email: true, sms: true, zalo: false, mandatoryChannels: ["IN_APP", "EMAIL"]},
        securityAlerts: {inApp: true, email: true, sms: true, zalo: false, mandatoryChannels: ["IN_APP", "EMAIL", "SMS"]},
        subscriptionAlerts: {inApp: true, email: true, sms: false, zalo: false, mandatoryChannels: []}
    });

    useEffect(() => {
        let active = true;

        const loadPreferences = async () => {
            try {
                const preferences = await getMyNotificationPreferences();
                if (!active || !preferences) return;
                setNotificationSettings(preferences);
            } catch (error) {
                console.error("Failed to load notification preferences", error);
            } finally {
                if (active) {
                    setPreferencesLoading(false);
                }
            }
        };

        loadPreferences();
        return () => {
            active = false;
        };
    }, []);

    const handleEditProfile = () => {
        message.info("Tính năng chỉnh sửa thông tin đang được phát triển");
        // Navigate to edit page or open modal
    };

    const handleChangePassword = (passwords) => {
        console.log('Change password:', passwords);
        message.success("Đổi mật khẩu thành công!");
        // API call to change password
    };

    const handleSaveEmergencyContact = (contact) => {
        console.log('Save emergency contact:', contact);
        message.success("Lưu thông tin liên hệ khẩn cấp thành công!");
        // API call to save contact
    };

    const handleSaveNotificationSettings = async (settings) => {
        const response = await updateMyNotificationPreferences(settings);
        setNotificationSettings(response || settings);
        message.success("Lưu cài đặt thông báo thành công!");
    };

    return (
        <div className={styles.profile}>
            {/* Profile Info */}
            <ProfileInfo
                profile={profileData}
                onEdit={handleEditProfile}
            />

            {/* Password Section */}
            <PasswordSection onChangePassword={handleChangePassword} />

            {/* Emergency Contact */}
            <EmergencyContact
                contact={emergencyContact}
                onSave={handleSaveEmergencyContact}
            />

            {/* Notification Settings */}
            <NotificationSettings
                settings={notificationSettings}
                onSave={handleSaveNotificationSettings}
                loading={preferencesLoading}
                title="Cài đặt thông báo"
                description="Tùy chỉnh cách bạn muốn nhận từng loại notification trong portal thuê trọ."
            />
        </div>
    );
};

export default Profile;
