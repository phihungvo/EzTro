import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Button, Form, Input, Modal, Select, message} from "antd";

import styles from "./Profile.module.scss";
import ProfileInfo from "~/components/Layout/UserLayout/components/ProfileInfo";
import PasswordSection from "~/components/Layout/UserLayout/components/PasswordSection";
import EmergencyContact from "~/components/Layout/UserLayout/components/EmergencyContact";
import NotificationSettings from "~/components/Layout/UserLayout/components/NotificationSettings";
import {
    getMyNotificationPreferences,
    updateMyNotificationPreferences
} from "~/service/admin/notification-service";
import {changeMyPassword, getMyProfile, updateMyProfile} from "~/service/user/profile";

const Profile = () => {
    const [preferencesLoading, setPreferencesLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editForm] = Form.useForm();

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

        const loadProfile = async () => {
            try {
                setProfileLoading(true);
                const response = await getMyProfile();
                if (active) {
                    setProfile(response || null);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
                message.error("Không thể tải hồ sơ của bạn");
                if (active) {
                    setProfile(null);
                }
            } finally {
                if (active) {
                    setProfileLoading(false);
                }
            }
        };

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

        loadProfile();
        loadPreferences();
        return () => {
            active = false;
        };
    }, []);

    const genderLabel = (value) => {
        const map = {MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác"};
        return map[value] || value || "—";
    };

    const formatDate = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("vi-VN");
    };

    const parsedEmergencyContact = useMemo(() => {
        const raw = String(profile?.emergencyContact || "").trim();
        const match = raw.match(/^(.*)\((.*)\)$/);
        const name = match ? match[1].trim() : raw;
        const relationship = match ? match[2].trim() : "";
        return {
            name: name || "",
            relationship: relationship || "",
            phone: profile?.emergencyPhone || "",
        };
    }, [profile?.emergencyContact, profile?.emergencyPhone]);

    const profileInfoData = useMemo(() => ({
        fullName: profile?.fullName || "—",
        idNumber: profile?.identityNumber || "—",
        phone: profile?.phoneNumber || "—",
        email: profile?.email || "—",
        dateOfBirth: formatDate(profile?.dateOfBirth),
        gender: genderLabel(profile?.gender),
        nationality: "Việt Nam",
        address: profile?.permanentAddress || "—",
    }), [profile?.dateOfBirth, profile?.email, profile?.fullName, profile?.gender, profile?.identityNumber, profile?.permanentAddress, profile?.phoneNumber]);

    const openEditModal = useCallback(() => {
        if (!profile) return;
        editForm.setFieldsValue({
            fullName: profile.fullName,
            phoneNumber: profile.phoneNumber,
            permanentAddress: profile.permanentAddress,
            identityNumber: profile.identityNumber,
            gender: profile.gender || "OTHER",
            occupation: profile.occupation,
        });
        setEditOpen(true);
    }, [editForm, profile]);

    const closeEditModal = () => setEditOpen(false);

    const handleSaveProfileEdit = useCallback(async () => {
        const values = await editForm.validateFields();
        setEditSaving(true);
        try {
            const updated = await updateMyProfile({
                fullName: values.fullName?.trim() || undefined,
                phoneNumber: values.phoneNumber?.trim() || undefined,
                permanentAddress: values.permanentAddress?.trim() || undefined,
                identityNumber: values.identityNumber?.trim() || undefined,
                gender: values.gender,
                occupation: values.occupation?.trim() || undefined,
            });
            setProfile(updated || profile);
            message.success("Đã cập nhật hồ sơ");
            closeEditModal();
        } finally {
            setEditSaving(false);
        }
    }, [editForm, profile]);

    const handleChangePassword = useCallback(async (passwords) => {
        await changeMyPassword({
            currentPassword: passwords.current,
            newPassword: passwords.new,
        });
        message.success("Đổi mật khẩu thành công!");
    }, []);

    const handleSaveEmergencyContact = useCallback(async (contact) => {
        const emergencyContactValue = contact.relationship
            ? `${contact.name} (${contact.relationship})`
            : contact.name;
        const updated = await updateMyProfile({
            emergencyContact: emergencyContactValue,
            emergencyPhone: contact.phone,
        });
        setProfile(updated || profile);
        message.success("Lưu thông tin liên hệ khẩn cấp thành công!");
    }, [profile]);

    const handleSaveNotificationSettings = async (settings) => {
        const response = await updateMyNotificationPreferences(settings);
        setNotificationSettings(response || settings);
        message.success("Lưu cài đặt thông báo thành công!");
    };

    return (
        <div className={styles.profile}>
            {/* Profile Info */}
            <ProfileInfo
                profile={profileInfoData}
                onEdit={openEditModal}
            />

            {/* Password Section */}
            <PasswordSection onChangePassword={handleChangePassword} />

            {/* Emergency Contact */}
            <EmergencyContact
                contact={parsedEmergencyContact}
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

            <Modal
                title="Chỉnh sửa thông tin"
                open={editOpen}
                onCancel={closeEditModal}
                footer={[
                    <Button key="cancel" onClick={closeEditModal}>
                        Hủy
                    </Button>,
                    <Button key="save" type="primary" loading={editSaving} onClick={handleSaveProfileEdit}>
                        Lưu
                    </Button>,
                ]}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="Họ tên"
                        name="fullName"
                        rules={[{required: true, message: "Vui lòng nhập họ tên"}]}
                    >
                        <Input placeholder="Nhập họ tên"/>
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phoneNumber">
                        <Input placeholder="Nhập số điện thoại"/>
                    </Form.Item>
                    <Form.Item label="CCCD/CMND" name="identityNumber">
                        <Input placeholder="Nhập CCCD/CMND"/>
                    </Form.Item>
                    <Form.Item label="Giới tính" name="gender">
                        <Select
                            options={[
                                {value: "MALE", label: "Nam"},
                                {value: "FEMALE", label: "Nữ"},
                                {value: "OTHER", label: "Khác"},
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="Địa chỉ thường trú" name="permanentAddress">
                        <Input placeholder="Nhập địa chỉ"/>
                    </Form.Item>
                    <Form.Item label="Nghề nghiệp" name="occupation">
                        <Input placeholder="Nhập nghề nghiệp"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;
