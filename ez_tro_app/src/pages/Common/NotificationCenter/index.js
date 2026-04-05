import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    BellOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    FilterOutlined,
    InfoCircleOutlined,
    InboxOutlined,
    NotificationOutlined,
    SearchOutlined
} from "@ant-design/icons";
import {Button, Card, Checkbox, Empty, Input, List, Select, Space, Tag, Typography, message} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {useNavigate} from "react-router-dom";
import styles from "./NotificationCenter.module.scss";
import {useAuth} from "~/routes/AuthContext";
import NotificationSettings from "~/components/Layout/UserLayout/components/NotificationSettings";
import {
    archiveNotification,
    bulkArchiveNotifications,
    bulkMarkAsRead,
    getMyNotificationPreferences,
    getMyNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
    updateMyNotificationPreferences
} from "~/service/admin/notification-service";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    {label: "Tất cả", value: "ALL"},
    {label: "Chưa đọc", value: "UNREAD"},
    {label: "Đã đọc", value: "READ"},
    {label: "Đã lưu trữ", value: "ARCHIVED"},
];

const CATEGORY_OPTIONS = [
    {label: "Tất cả nhóm", value: ""},
    {label: "Billing", value: "BILLING"},
    {label: "Payment", value: "PAYMENT"},
    {label: "Contract", value: "CONTRACT"},
    {label: "Incident", value: "INCIDENT"},
    {label: "Subscription", value: "SUBSCRIPTION"},
    {label: "Security", value: "SECURITY"},
    {label: "System", value: "SYSTEM"},
];

const categoryColorMap = {
    BILLING: "gold",
    PAYMENT: "green",
    CONTRACT: "purple",
    INCIDENT: "red",
    SUBSCRIPTION: "blue",
    SECURITY: "volcano",
    SYSTEM: "default",
    MARKETING: "magenta",
    OPERATIONS: "cyan",
};

const priorityColorMap = {
    CRITICAL: "red",
    HIGH: "volcano",
    MEDIUM: "blue",
    LOW: "default",
};

const normalizeNotification = (notification) => ({
    ...notification,
    isRead: Boolean(notification?.read ?? notification?.isRead),
    category: notification?.category || "SYSTEM",
    priority: notification?.priority || "MEDIUM",
});

const NotificationCenter = ({embedded = false}) => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [status, setStatus] = useState("ALL");
    const [category, setCategory] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [preferences, setPreferences] = useState(null);
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const canSendAnnouncements = user?.role === "ADMIN" || user?.role === "OWNER";
    const announcementPath = user?.role === "ADMIN"
        ? "/admin/notifications/announcements"
        : user?.role === "OWNER"
            ? "/owner/notifications/announcements"
            : null;
    const showPreferences = user?.role === "ADMIN" || user?.role === "OWNER";

    const filters = useMemo(() => ({
        status,
        category,
        keyword,
    }), [status, category, keyword]);

    const loadNotifications = useCallback(async (pageNum = 0, append = false) => {
        try {
            append ? setLoadingMore(true) : setLoading(true);

            const [response, unread] = await Promise.all([
                getMyNotifications(pageNum, PAGE_SIZE, filters),
                getUnreadCount(),
            ]);

            const items = (response?.content || []).map(normalizeNotification);
            setHasMore(!response?.last);
            setUnreadCount(unread || 0);

            if (append) {
                setNotifications(prev => [...prev, ...items.filter(item => !prev.some(p => p.id === item.id))]);
            } else {
                setNotifications(items);
                setPage(0);
                setSelectedIds([]);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters]);

    useEffect(() => {
        loadNotifications(0, false);
    }, [loadNotifications]);

    useEffect(() => {
        if (!showPreferences) {
            return;
        }

        let active = true;
        const loadPreferences = async () => {
            try {
                setPreferencesLoading(true);
                const response = await getMyNotificationPreferences();
                if (active) {
                    setPreferences(response);
                }
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
    }, [showPreferences]);

    const handleMarkRead = async (notification) => {
        if (!notification || notification.isRead || status === "ARCHIVED") {
            return;
        }
        await markAsRead(notification.id);
        setNotifications(prev => prev.map(item => item.id === notification.id ? {...item, isRead: true} : item));
        setUnreadCount(count => Math.max(0, count - 1));
    };

    const handleArchive = async (notification) => {
        await archiveNotification(notification.id);
        if (status === "ARCHIVED") {
            setNotifications(prev => prev.map(item => item.id === notification.id ? {...item, isRead: true} : item));
            return;
        }
        setNotifications(prev => prev.filter(item => item.id !== notification.id));
        if (!notification.isRead) {
            setUnreadCount(count => Math.max(0, count - 1));
        }
        message.success("Đã lưu trữ thông báo");
    };

    const toggleSelected = (notificationId, checked) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(notificationId);
            } else {
                next.delete(notificationId);
            }
            return Array.from(next);
        });
    };

    const clearSelection = () => setSelectedIds([]);

    const handleBulkRead = async () => {
        if (!selectedIds.length) return;
        const updated = await bulkMarkAsRead(selectedIds);
        if (updated > 0) {
            setNotifications(prev => prev.map(item => selectedIds.includes(item.id) ? {...item, isRead: true} : item));
            setUnreadCount(count => Math.max(0, count - updated));
            message.success(`Đã đánh dấu đã đọc (${updated})`);
        }
        clearSelection();
    };

    const handleBulkArchive = async () => {
        if (!selectedIds.length) return;
        const updated = await bulkArchiveNotifications(selectedIds);
        if (updated > 0) {
            if (status === "ARCHIVED") {
                setNotifications(prev => prev.map(item => selectedIds.includes(item.id) ? {...item, isRead: true} : item));
            } else {
                setNotifications(prev => prev.filter(item => !selectedIds.includes(item.id)));
            }
            const unreadSelected = notifications.filter(
                item => selectedIds.includes(item.id) && !item.isRead && item.archivedAt == null
            ).length;
            if (unreadSelected > 0) {
                setUnreadCount(count => Math.max(0, count - unreadSelected));
            }
            message.success(`Đã lưu trữ (${updated})`);
        }
        clearSelection();
    };

    const handleOpen = async (notification) => {
        if (!notification) return;
        if (!notification.isRead) {
            await handleMarkRead(notification);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleMarkAll = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(item => ({...item, isRead: true})));
        setUnreadCount(0);
        message.success("Đã đánh dấu toàn bộ là đã đọc");
    };

    const handleSavePreferences = async (nextPreferences) => {
        setPreferencesLoading(true);
        try {
            const response = await updateMyNotificationPreferences(nextPreferences);
            setPreferences(response || nextPreferences);
            message.success("Đã cập nhật channel preferences");
        } finally {
            setPreferencesLoading(false);
        }
    };

    return (
        <div className={embedded ? styles.embeddedWrapper : styles.wrapper}>
            <Card className={styles.heroCard} bordered={false}>
                <div className={styles.heroTop}>
                    <div>
                        <Typography.Title level={embedded ? 4 : 3} className={styles.heroTitle}>
                            <BellOutlined /> Trung tâm thông báo
                        </Typography.Title>
                        <Typography.Paragraph className={styles.heroDesc}>
                            Quản lý toàn bộ thông báo vận hành, billing, contract, payment và các cảnh báo hệ thống.
                        </Typography.Paragraph>
                    </div>
                    <div className={styles.heroStats}>
                        <span className={styles.heroBadge}>Chưa đọc: {unreadCount}</span>
                        {canSendAnnouncements && (
                            <Button icon={<NotificationOutlined />} onClick={() => navigate(announcementPath)}>
                                Gửi announcement
                            </Button>
                        )}
                        <Button type="primary" onClick={handleMarkAll} disabled={unreadCount === 0}>
                            Đánh dấu tất cả đã đọc
                        </Button>
                    </div>
                </div>

                <div className={styles.filterBar}>
                    <Select
                        value={status}
                        onChange={setStatus}
                        options={STATUS_OPTIONS}
                        className={styles.select}
                    />
                    <Select
                        value={category}
                        onChange={setCategory}
                        options={CATEGORY_OPTIONS}
                        className={styles.select}
                    />
                    <Input
                        value={keywordInput}
                        onChange={(event) => setKeywordInput(event.target.value)}
                        placeholder="Tìm theo tiêu đề, nội dung, event key"
                        prefix={<SearchOutlined />}
                        className={styles.searchInput}
                        onPressEnter={() => setKeyword(keywordInput.trim())}
                    />
                    <Button icon={<FilterOutlined />} onClick={() => setKeyword(keywordInput.trim())}>
                        Lọc
                    </Button>
                </div>
                {selectedIds.length > 0 && (
                    <div className={styles.bulkBar}>
                        <Space wrap>
                            <Tag color="blue">Đã chọn {selectedIds.length}</Tag>
                            <Button icon={<CheckOutlined/>} onClick={handleBulkRead} disabled={status === "ARCHIVED"}>
                                Đánh dấu đã đọc
                            </Button>
                            <Button icon={<InboxOutlined/>} onClick={handleBulkArchive} disabled={status === "ARCHIVED"}>
                                Lưu trữ
                            </Button>
                            <Button type="text" onClick={clearSelection}>
                                Bỏ chọn
                            </Button>
                        </Space>
                    </div>
                )}
            </Card>

            {showPreferences && preferences && (
                <NotificationSettings
                    settings={preferences}
                    onSave={handleSavePreferences}
                    loading={preferencesLoading}
                    embedded
                    title="Channel Preferences"
                    description="Bật hoặc tắt từng kênh nhận cho từng nhóm notification của tài khoản hiện tại."
                    submitLabel="Lưu preferences"
                />
            )}

            <Card className={styles.listCard} bordered={false}>
                <List
                    loading={loading}
                    dataSource={notifications}
                    locale={{emptyText: <Empty description="Không có thông báo phù hợp" />}}
                    renderItem={(item) => (
                        <List.Item className={`${styles.item} ${!item.isRead ? styles.unread : ""}`}>
                            <div className={styles.itemSelect}>
                                <Checkbox
                                    checked={selectedIds.includes(item.id)}
                                    onChange={(e) => toggleSelected(item.id, e.target.checked)}
                                />
                            </div>
                            <div className={styles.itemBody}>
                                <div className={styles.itemHeader}>
                                    <Space wrap>
                                        <Typography.Text strong className={styles.itemTitle}>
                                            {item.title}
                                        </Typography.Text>
                                        <Tag color={categoryColorMap[item.category] || "default"}>
                                            {item.category}
                                        </Tag>
                                        <Tag color={priorityColorMap[item.priority] || "default"}>
                                            {item.priority}
                                        </Tag>
                                    </Space>
                                    <Typography.Text type="secondary" className={styles.itemTime}>
                                        <ClockCircleOutlined /> {dayjs(item.createdAt).fromNow()}
                                    </Typography.Text>
                                </div>
                                <Typography.Paragraph className={styles.itemMessage}>
                                    {item.message}
                                </Typography.Paragraph>
                                <div className={styles.itemFooter}>
                                    <Typography.Text type="secondary" className={styles.itemMeta}>
                                        Event: {item.eventKey || item.type || "SYSTEM"}
                                    </Typography.Text>
                                    <Space wrap>
                                        {!item.isRead && status !== "ARCHIVED" && (
                                            <Button size="small" icon={<CheckOutlined />} onClick={() => handleMarkRead(item)}>
                                                Đã đọc
                                            </Button>
                                        )}
                                        {status !== "ARCHIVED" && (
                                            <Button size="small" icon={<InboxOutlined />} onClick={() => handleArchive(item)}>
                                                Lưu trữ
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            type="primary"
                                            ghost
                                            icon={<InfoCircleOutlined />}
                                            onClick={() => handleOpen(item)}
                                            disabled={!item.actionUrl}
                                        >
                                            {item.actionLabel || "Mở"}
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />

                {hasMore && !loading && (
                    <div className={styles.loadMore}>
                        <Button
                            loading={loadingMore}
                            onClick={() => {
                                const next = page + 1;
                                setPage(next);
                                loadNotifications(next, true);
                            }}
                        >
                            Xem thêm
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default NotificationCenter;
