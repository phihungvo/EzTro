import React from "react";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import styles from "./ProfileInfo.module.scss";

const ProfileInfo = ({ profile, onEdit }) => {
    return (
        <div className={styles.profileInfo}>
            <div className={styles.header}>
                <h2 className={styles.title}>Thông Tin Cá Nhân</h2>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={onEdit}
                >
                    Chỉnh Sửa
                </Button>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <div className={styles.label}>HỌ TÊN</div>
                    <div className={styles.value}>{profile.fullName}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>SỐ CCCD/CMND</div>
                    <div className={styles.value}>{profile.idNumber}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>SỐ ĐIỆN THOẠI</div>
                    <div className={styles.value}>{profile.phone}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>EMAIL</div>
                    <div className={styles.value}>{profile.email}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>NGÀY SINH</div>
                    <div className={styles.value}>{profile.dateOfBirth}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>GIỚI TÍNH</div>
                    <div className={styles.value}>{profile.gender}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>QUỐC TỊCH</div>
                    <div className={styles.value}>{profile.nationality}</div>
                </div>

                <div className={styles.infoItem}>
                    <div className={styles.label}>ĐỊA CHỈ QUÊ QUÁN</div>
                    <div className={styles.value}>{profile.address}</div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;