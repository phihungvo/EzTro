import React from 'react';
import { Card, Tag, Button, Space, Tooltip } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import styles from './IncidentItem.module.scss';
import moment from 'moment';

const IncidentItem = ({ incident, onEdit, onDelete }) => {
    const STATUS_CONFIG = {
        PENDING: {
            color: 'warning',
            text: 'Chờ tiếp nhận',
            icon: <ClockCircleOutlined />,
        },
        IN_PROGRESS: {
            color: 'processing',
            text: 'Đang xử lý',
            icon: <SyncOutlined spin />,
        },
        RESOLVED: {
            color: 'success',
            text: 'Đã xử lý',
            icon: <CheckCircleOutlined />,
        },
        REJECTED: {
            color: 'error',
            text: 'Từ chối',
            icon: <CloseCircleOutlined />,
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
        <Card
            className={styles.incidentCard}
            hoverable
        >
            <div className={styles.cardContent}>
                {/* Left Section - Status */}
                <div className={styles.statusSection}>
                    <Tag
                        color={statusConfig.color}
                        icon={statusConfig.icon}
                        className={styles.statusTag}
                    >
                        {statusConfig.text}
                    </Tag>
                </div>

                {/* Middle Section - Info */}
                <div className={styles.infoSection}>
                    <h3 className={styles.title}>{incident.title}</h3>
                    <p className={styles.description}>{incident.description}</p>
                </div>

                {/* Right Section - Date & Actions */}
                <div className={styles.metaSection}>
                    <div className={styles.dateInfo}>
                        <CalendarOutlined className={styles.dateIcon} />
                        <span className={styles.dateText}>
                            {incident.expectedResolveDate
                                ? moment(incident.expectedResolveDate).format('DD/MM/YYYY')
                                : 'Chưa xác định'}
                        </span>
                    </div>
                    <Space size={6} className={styles.actions}>
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="primary"
                                ghost
                                size="small"
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                            />
                        </Tooltip>
                        <Tooltip title="Xóa">
                            <Button
                                type="primary"
                                danger
                                ghost
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                            />
                        </Tooltip>
                    </Space>
                </div>
            </div>
        </Card>
    );
};

export default IncidentItem;