import React, { useState } from "react";
import { Input, Button, message } from "antd";
import styles from "./PasswordSection.module.scss";

const PasswordSection = ({ onChangePassword }) => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleChange = (field, value) => {
        setPasswords(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            message.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (passwords.new !== passwords.confirm) {
            message.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwords.new.length < 6) {
            message.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        onChangePassword(passwords);

        // Reset form
        setPasswords({
            current: '',
            new: '',
            confirm: ''
        });
    };

    return (
        <div className={styles.passwordSection}>
            <h2 className={styles.title}>🔒 Bảo Mật Tài Khoản</h2>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Mật Khẩu Hiện Tại</label>
                    <Input.Password
                        placeholder="Nhập mật khẩu hiện tại"
                        value={passwords.current}
                        onChange={(e) => handleChange('current', e.target.value)}
                        size="large"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Mật Khẩu Mới</label>
                    <Input.Password
                        placeholder="Nhập mật khẩu mới"
                        value={passwords.new}
                        onChange={(e) => handleChange('new', e.target.value)}
                        size="large"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Xác Nhận Mật Khẩu</label>
                    <Input.Password
                        placeholder="Xác nhận mật khẩu"
                        value={passwords.confirm}
                        onChange={(e) => handleChange('confirm', e.target.value)}
                        size="large"
                    />
                </div>
            </div>

            <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                className={styles.submitButton}
            >
                Đổi Mật Khẩu
            </Button>
        </div>
    );
};

export default PasswordSection;