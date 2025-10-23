import React, { useState } from "react";
import { Input, Select, Button, message } from "antd";
import styles from "./EmergencyContact.module.scss";

const EmergencyContact = ({ contact, onSave }) => {
    const [formData, setFormData] = useState({
        name: contact?.name || '',
        relationship: contact?.relationship || '',
        phone: contact?.phone || ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.relationship || !formData.phone) {
            message.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        onSave(formData);
    };

    return (
        <div className={styles.emergencyContact}>
            <h2 className={styles.title}>📞 Người Liên Hệ Khẩn Cấp</h2>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Tên Người Liên Hệ</label>
                    <Input
                        placeholder="Nhập tên"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        size="large"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Mối Quan Hệ</label>
                    <Select
                        placeholder="Chọn mối quan hệ"
                        value={formData.relationship || undefined}
                        onChange={(value) => handleChange('relationship', value)}
                        size="large"
                        style={{ width: '100%' }}
                        options={[
                            { value: 'Cha Mẹ', label: 'Cha Mẹ' },
                            { value: 'Anh/Chị/Em', label: 'Anh/Chị/Em' },
                            { value: 'Vợ/Chồng', label: 'Vợ/Chồng' },
                            { value: 'Bạn Bè', label: 'Bạn Bè' },
                            { value: 'Khác', label: 'Khác' }
                        ]}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Số Điện Thoại</label>
                    <Input
                        placeholder="Nhập số điện thoại"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
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
                Lưu
            </Button>
        </div>
    );
};

export default EmergencyContact;