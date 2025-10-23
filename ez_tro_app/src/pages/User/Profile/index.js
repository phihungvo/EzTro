import React, { useState } from "react";
import { message } from "antd";

import styles from "./Profile.module.scss";
import ProfileInfo from "~/components/Layout/UserLayout/components/ProfileInfo";
import PasswordSection from "~/components/Layout/UserLayout/components/PasswordSection";
import EmergencyContact from "~/components/Layout/UserLayout/components/EmergencyContact";
import NotificationSettings from "~/components/Layout/UserLayout/components/NotificationSettings";

const Profile = () => {
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

    const [notificationSettings] = useState({
        newInvoice: true,
        invoiceExpiring: true,
        maintenanceAlert: true,
        promotions: false
    });

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

    const handleSaveNotificationSettings = (settings) => {
        console.log('Save notification settings:', settings);
        message.success("Lưu cài đặt thông báo thành công!");
        // API call to save settings
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
            />
        </div>
    );
};

export default Profile;