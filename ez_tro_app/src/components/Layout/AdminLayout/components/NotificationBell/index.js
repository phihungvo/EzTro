import React, {useEffect, useRef, useState, useCallback} from 'react';
import {BellOutlined, ClockCircleOutlined} from '@ant-design/icons';
import {Badge, Dropdown, List, Button, Empty, Spin, message} from 'antd';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styles from './NotificationBell.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {Howl} from 'howler';
import {getMyNotifications, markAllAsRead, markAsRead} from "~/service/admin/notification-service";

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PAGE_SIZE = 10;
const MAX_NOTIFICATIONS = 100;
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-notification-2577.mp3';

const sound = typeof window !== 'undefined'
    ? new Howl({src: [NOTIFICATION_SOUND], volume: 0.4})
    : null;

export default function NotificationBell() {
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

    const loadNotifications = useCallback(async (pageNum = 0, append = false) => {
        if (!token) return;
        try {
            append ? setLoadingMore(true) : setLoading(true);
            const data = await getMyNotifications(pageNum, PAGE_SIZE);

            const newNotis = (data.content || []).map(n => ({...n, isRead: !!n.read}));

            setHasMore(!data.last);
            setNotifications(prev => {
                if (append) return [...prev, ...newNotis].slice(0, MAX_NOTIFICATIONS);
                return newNotis;
            });

            if (!append) {
                setUnreadCount(newNotis.filter(n => !n.isRead).length);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [token]);

    const handleMarkAsRead = async (id) => {
        const success = await markAsRead(id);
        if (success) {
            setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
            setUnreadCount(c => Math.max(0, c - 1));
        }
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
        if (!token) {
            setConnecting(false);
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {Authorization: `Bearer ${token}`},
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                setConnecting(false);
                console.log('WebSocket connected');

                const handleNewNotification = (msg) => {
                    try {
                        const noti = JSON.parse(msg.body);
                        if (noti.isRead) return;

                        setNotifications(prev => {
                            if (prev.some(n => n.id === noti.id)) return prev;
                            playSound();
                            return [noti, ...prev].slice(0, MAX_NOTIFICATIONS);
                        });
                        setUnreadCount(c => c + 1);
                        message.info(noti.title, 5);
                    } catch (e) { /* ignore */
                    }
                };

                client.subscribe('/user/queue/notifications', handleNewNotification);
                client.subscribe('/topic/notifications', (msg) => {
                    const noti = JSON.parse(msg.body);
                    setNotifications(prev => [noti, ...prev].slice(0, MAX_NOTIFICATIONS));
                    if (!noti.isRead) {
                        setUnreadCount(c => c + 1);
                        playSound();
                    }
                });
            },
            onStompError: () => setConnecting(true),
            onWebSocketClose: () => setConnecting(true),
        });

        clientRef.current = client;
        client.activate();

        return () => client.deactivate();
    }, [token]);

    useEffect(() => {
        if (token) loadNotifications(0, false);
    }, [token, loadNotifications]);

    const formatTime = (date) => dayjs(date).fromNow();

    const menu = (
        <div className={styles.dropdown}>
            <div className={styles.header}>
                <h3>Thông báo</h3>
                {unreadCount > 0 && (
                    <Button type="text" size="small" onClick={handleMarkAllAsRead}>
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>

            <div className={styles.listContainer}>
                <List
                    dataSource={notifications}
                    loading={loading}
                    locale={{emptyText: <Empty description="Chưa có thông báo"/>}}
                    renderItem={(item) => (
                        <List.Item
                            className={`${styles.item} ${!item.isRead ? styles.unread : ''}`}
                            onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                        >
                            {!item.isRead}
                            <List.Item.Meta
                                title={<div className={styles.title}>{item.title}</div>}
                                description={
                                    <div>
                                        <div className={styles.message}>{item.message}</div>
                                        <div className={styles.time}>
                                            <ClockCircleOutlined className={styles.clockIcon}/>
                                            <span>{formatTime(item.createdAt)}</span>
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
                            Xem thêm
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <div className={styles.bellWrapper}>
                <Badge count={unreadCount} size="small">
                    <BellOutlined className={styles.bell}/>
                </Badge>
                {connecting && <span className={styles.connectingDot} title="Đang kết nối..."/>}
            </div>
        </Dropdown>
    );
}