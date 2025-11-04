import React from 'react';
import { Badge, Tag, Button, Space, Tooltip } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    UserOutlined,
    HomeOutlined,
    FileTextOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import styles from './IncidentItem.module.scss';

const IncidentItem = ({ incident, onEdit, onDelete }) => {
    const STATUS_CONFIG = {
        PENDING: {
            color: '#faad14',
            text: 'Chờ tiếp nhận',
            icon: <ClockCircleOutlined />,
            className: styles.statusPending
        },
        IN_PROGRESS: {
            color: '#1890ff',
            text: 'Đang xử lý',
            icon: <SyncOutlined spin />,
            className: styles.statusInProgress
        },
        RESOLVED: {
            color: '#52c41a',
            text: 'Đã xử lý',
            icon: <CheckCircleOutlined />,
            className: styles.statusResolved
        },
        REJECTED: {
            color: '#ff4d4f',
            text: 'Từ chối',
            icon: <CloseCircleOutlined />,
            className: styles.statusRejected
        }
    };

    const statusConfig = STATUS_CONFIG[incident.status] || STATUS_CONFIG.PENDING;

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit && onEdit(incident);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete && onDelete(incident);
    };

    return (
        <div className={`${styles.incidentItem} ${statusConfig.className}`}>
            <div className={styles.statusBar} style={{ backgroundColor: statusConfig.color }}></div>

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <FileTextOutlined className={styles.titleIcon} style={{ color: statusConfig.color }} />
                        <h3 className={styles.title}>{incident.title}</h3>
                    </div>

                    <div className={styles.actions}>
                        <Space size={8}>
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={handleEdit}
                                    className={styles.actionBtn}
                                />
                            </Tooltip>
                            <Tooltip title="Xóa">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleDelete}
                                    className={styles.actionBtn}
                                />
                            </Tooltip>
                        </Space>
                    </div>
                </div>

                <p className={styles.description}>{incident.description}</p>

                <div className={styles.metaInfo}>
                    <div className={styles.tags}>
                        <Tag icon={<UserOutlined />} className={styles.tag}>
                            {incident.tenantName}
                        </Tag>
                        <Tag icon={<HomeOutlined />} color="blue" className={styles.tag}>
                            Phòng {incident.roomNumber}
                        </Tag>
                    </div>

                    <Badge
                        status="processing"
                        color={statusConfig.color}
                        text={
                            <span className={styles.statusBadge}>
                                {statusConfig.icon}
                                <span>{statusConfig.text}</span>
                            </span>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default IncidentItem;