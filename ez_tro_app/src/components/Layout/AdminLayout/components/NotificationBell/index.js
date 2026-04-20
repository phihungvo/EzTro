import React, {useEffect, useRef, useState, useCallback} from 'react';
import {BellOutlined, ClockCircleOutlined, InfoCircleOutlined} from '@ant-design/icons';
import {Badge, Dropdown, List, Button, Empty, message} from 'antd';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styles from './NotificationBell.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {Howl} from 'howler';
import {useNavigate} from 'react-router-dom';
import {getMyNotifications, getUnreadCount, markAllAsRead, markAsRead} from "~/service/admin/notification-service";
import {useAuth} from "~/routes/AuthContext";
import {normalizeApiBaseUrl} from '~/utils/normalizeBaseUrl';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PAGE_SIZE = 10;
const MAX_NOTIFICATIONS = 100;
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-notification-2577.mp3';
const apiBaseUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
const defaultWsUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.replace(/\/api$/, '/ws') : '/ws';
const WS_URL = process.env.REACT_APP_WS_URL || defaultWsUrl;

const sound = typeof window !== 'undefined'
    ? new Howl({src: [NOTIFICATION_SOUND], volume: 0.4})
    : null;

// Hook để detect screen size
function useIsMobile(breakpoint = 480) {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
    );
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= breakpoint);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [breakpoint]);
    return isMobile;
}

export default function NotificationBell() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile(480);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [connecting, setConnecting] = useState(true);
    const clientRef = useRef(null);
    const token = localStorage.getItem('token');

    const playSound = () => sound?.play();

    const normalizeNotification = useCallback((notification) => ({
        ...notification,
        isRead: Boolean(notification?.read ?? notification?.isRead),
        category: notification?.category || 'SYSTEM',
        priority: notification?.priority || 'MEDIUM',
    }), []);

    const mergeNotifications = useCallback((items, incoming) => {
        const map = new Map(items.map(item => [item.id, item]));
        incoming.forEach(item => {
            map.set(item.id, {...map.get(item.id), ...item});
        });
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return merged.slice(0, MAX_NOTIFICATIONS);
    }, []);

    const loadNotifications = useCallback(async (pageNum = 0, append = false) => {
        if (!token) return;
        try {
            append ? setLoadingMore(true) : setLoading(true);
            const [data, unread] = await Promise.all([
                getMyNotifications(pageNum, PAGE_SIZE),
                pageNum === 0 ? getUnreadCount() : Promise.resolve(null),
            ]);

            const newNotis = (data.content || []).map(normalizeNotification);

            setHasMore(!data.last);
            if (!append) setPage(0);

            setNotifications(prev => {
                if (append) return mergeNotifications(prev, newNotis);
                return newNotis;
            });

            if (pageNum === 0) setUnreadCount(unread || 0);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [token, normalizeNotification, mergeNotifications]);

    const handleNavigate = useCallback((notification) => {
        if (!notification?.actionUrl) return;
        navigate(notification.actionUrl);
    }, [navigate]);

    const handleOpenCenter = useCallback(() => {
        if (user?.role === 'ADMIN')  return navigate('/admin/notifications');
        if (user?.role === 'OWNER')  return navigate('/owner/notifications');
        navigate('/user/dashboard?tab=notifications');
    }, [navigate, user?.role]);

    const handleMarkAsRead = async (id) => {
        const success = await markAsRead(id);
        if (success) {
            setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
            setUnreadCount(c => Math.max(0, c - 1));
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification) return;
        if (!notification.isRead) await handleMarkAsRead(notification.id);
        handleNavigate(notification);
    };

    const handleMarkAllAsRead = async () => {
        const success = await markAllAsRead();
        if (success) {
            setNotifications(prev => prev.map(n => ({...n, isRead: true})));
            setUnreadCount(0);
        }
    };

    // WebSocket
    useEffect(() => {
        if (!token) { setConnecting(false); return; }

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {Authorization: `Bearer ${token}`},
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                setConnecting(false);
                loadNotifications(0, false);

                const handleNewNotification = (msg) => {
                    try {
                        const noti = normalizeNotification(JSON.parse(msg.body));
                        setNotifications(prev => mergeNotifications(prev, [noti]));
                        if (!noti.isRead) setUnreadCount(c => c + 1);
                        playSound();
                        message.open({
                            type: 'info',
                            content: noti.title || 'Bạn có thông báo mới',
                            duration: 4,
                        });
                    } catch (e) {
                        console.error('Invalid notification payload', e);
                    }
                };

                client.subscribe('/user/queue/notifications', handleNewNotification);
            },
            onStompError: () => setConnecting(true),
            onWebSocketClose: () => setConnecting(true),
        });

        clientRef.current = client;
        client.activate();
        return () => client.deactivate();
    }, [token, loadNotifications, mergeNotifications, normalizeNotification]);

    useEffect(() => {
        if (token) loadNotifications(0, false);
    }, [token, loadNotifications]);

    const formatTime = (date) => dayjs(date).fromNow();

    const menu = (
        <div className={styles.dropdown}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <h3>Thông báo</h3>
                <div className={styles.headerActions}>
                    <Button type="text" size="small" onClick={handleOpenCenter}>
                        Xem tất cả
                    </Button>
                    {unreadCount > 0 && (
                        <Button type="text" size="small" onClick={handleMarkAllAsRead}>
                            Đánh dấu đã đọc
                        </Button>
                    )}
                </div>
            </div>

            {/* ── List ── */}
            <div className={styles.listContainer}>
                <List
                    dataSource={notifications}
                    loading={loading}
                    locale={{emptyText: (
                            <Empty
                                description="Chưa có thông báo"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}}
                    renderItem={(item) => (
                        <List.Item
                            className={`${styles.item} ${!item.isRead ? styles.unread : ''}`}
                            onClick={() => handleNotificationClick(item)}
                        >
                            <List.Item.Meta
                                title={
                                    <div className={styles.titleRow}>
                                        <div className={styles.notiTitle}>{item.title}</div>
                                        <span className={`${styles.categoryBadge} ${styles[item.category?.toLowerCase()] || ''}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                }
                                description={
                                    <div>
                                        <div className={styles.message}>{item.message}</div>
                                        <div className={styles.time}>
                                            <ClockCircleOutlined className={styles.clockIcon}/>
                                            <span>{formatTime(item.createdAt)}</span>
                                            {item.actionUrl && (
                                                <span className={styles.actionHint}>
                                                    <InfoCircleOutlined/>
                                                    {item.actionLabel || 'Mở'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />

                {hasMore && !loading && (
                    <div className={styles.loadMore}>
                        <Button
                            type="text"
                            loading={loadingMore}
                            onClick={() => {
                                const next = page + 1;
                                setPage(next);
                                loadNotifications(next, true);
                            }}
                        >
                            Xem thêm thông báo
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Dropdown
            overlay={menu}
            trigger={['click']}
            // Mobile: hiện từ dưới lên; Desktop: dropdown bình thường
            placement={isMobile ? 'bottomCenter' : 'bottomRight'}
            // Trên mobile cho phép scroll body khi dropdown mở
            getPopupContainer={(trigger) =>
                isMobile ? document.body : trigger.parentElement
            }
            overlayStyle={isMobile ? {
                position: 'fixed',
                bottom: 'auto',
                left: '50%',
                transform: 'translateX(-50%)',
            } : {}}
        >
            <div className={styles.bellWrapper}>
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                    <BellOutlined className={styles.bell}/>
                </Badge>
                {connecting && (
                    <span
                        className={styles.connectingDot}
                        title="Đang kết nối WebSocket..."
                    />
                )}
            </div>
        </Dropdown>
    );
}