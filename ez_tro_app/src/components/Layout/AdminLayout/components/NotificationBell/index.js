import React, {useEffect, useRef, useState} from 'react';
import {BellOutlined} from '@ant-design/icons';
import {Badge, Dropdown, List, message} from 'antd';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const clientRef = useRef(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        // 1. Lấy thông báo ban đầu
        const loadInitialNotifications = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/notifications/me?size=5', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (data?.result?.content) {
                    setNotifications(data.result.content);
                    setUnreadCount(data.result.content.filter(n => !n.isRead).length);
                }
            } catch (err) {
                console.error('Không thể tải thông báo:', err);
            }
        };

        loadInitialNotifications();

        // 2. Kết nối WebSocket
        if (!token) {
            console.warn('Không có token, bỏ qua kết nối WebSocket');
            return;
        }

        const client = new Client({
            webSocketFactory: () => {
                const socket = new SockJS('http://localhost:8080/ws');
                // Quan trọng: bật credentials nếu backend allowCredentials(true)
                // @ts-ignore - SockJS có hỗ trợ withCredentials
                socket.withCredentials = true;
                return socket;
            },

            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },

            // Tăng thời gian reconnect để tránh spam
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            debug: (str) => {
                console.log('[STOMP Debug]', str);
            },

            onConnect: (frame) => {
                console.log('WebSocket connected!', frame);
                client.subscribe('/user/queue/notifications', (msg) => {
                    try {
                        const noti = JSON.parse(msg.body);
                        setNotifications(prev => {
                            // Tránh duplicate nếu server gửi trùng
                            if (prev.some(n => n.id === noti.id)) return prev;
                            return [noti, ...prev.slice(0, 49)]; // giới hạn 50 thông báo
                        });
                        setUnreadCount(c => c + 1);
                        message.success(`[Thông báo] ${noti.title}`, 4);
                    } catch (e) {
                        console.error('Lỗi parse notification:', e);
                    }
                });
            },

            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers['message']);
                message.error('Lỗi kết nối thông báo realtime');
            },

            onWebSocketClose: () => {
                console.log('WebSocket closed');
            },

            onWebSocketError: (error) => {
                console.error('WebSocket Error:', error);
            },
        });

        clientRef.current = client;
        client.activate();

        // Cleanup khi component unmount
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                console.log('WebSocket deactivated');
            }
        };
    }, [token]); // chỉ reconnect khi token thay đổi

    const menu = (
        <div style={{background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
            <List
                dataSource={notifications}
                renderItem={item => (
                    <List.Item style={{opacity: item.isRead ? 0.6 : 1, padding: '12px 16px'}}>
                        <List.Item.Meta
                            title={<b style={{fontSize: 14}}>{item.title}</b>}
                            description={<div style={{fontSize: 13, color: '#666'}}>{item.message}</div>}
                        />
                    </List.Item>
                )}
                locale={{emptyText: 'Không có thông báo nào'}}
                style={{width: 340, maxHeight: 480, overflowY: 'auto'}}
            />
        </div>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Badge count={unreadCount} size="small">
                <BellOutlined style={{fontSize: 24, cursor: 'pointer', color: '#595959'}}/>
            </Badge>
        </Dropdown>
    );
}