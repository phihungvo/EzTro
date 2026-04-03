import API_ENDPOINTS from '~/constants/endpoints';
import apiClient from '~/service/api/api';
import {message} from 'antd';

export const getMyNotifications = async (page = 0, size = 10, filters = {}) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION.GET_MY_NOTIFICATIONS, {
            params: {
                page,
                size,
                ...(filters.status ? {status: filters.status} : {}),
                ...(filters.category ? {category: filters.category} : {}),
                ...(filters.keyword ? {keyword: filters.keyword} : {}),
            },
        });
        return response.data.result;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        // message.error('Không thể tải thông báo');
        return {content: [], last: true, totalElements: 0};
    }
};

export const markAsRead = async (notificationId) => {
    try {
        await apiClient.post(API_ENDPOINTS.NOTIFICATION.MARK_AS_READ(notificationId));
        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        // message.error('Lỗi khi đánh dấu đã đọc');
        return false;
    }
};

export const markAllAsRead = async () => {
    try {
        await apiClient.post(API_ENDPOINTS.NOTIFICATION.MARK_ALL_AS_READ);
        message.success('Đã đánh dấu tất cả là đã đọc');
        return true;
    } catch (error) {
        console.error('Error marking all as read:', error);
        // message.error('Lỗi khi đánh dấu tất cả');
        return false;
    }
};

export const getUnreadCount = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT);
        return response.data.result || 0;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
};

export const archiveNotification = async (notificationId) => {
    await apiClient.post(API_ENDPOINTS.NOTIFICATION.ARCHIVE(notificationId));
    return true;
};

export const previewAnnouncement = async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATION.ANNOUNCEMENT_PREVIEW, payload);
    return response.data.result;
};

export const sendAnnouncement = async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATION.ANNOUNCEMENT_SEND, payload);
    return response.data.result;
};

export const getNotificationDeliveryLogs = async (page = 0, size = 20, filters = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION.DELIVERY_LOGS, {
        params: {
            page,
            size,
            ...(filters.channel ? {channel: filters.channel} : {}),
            ...(filters.status ? {status: filters.status} : {}),
            ...(filters.eventId ? {eventId: filters.eventId} : {}),
            ...(filters.keyword ? {keyword: filters.keyword} : {}),
        },
    });
    return response.data.result;
};

export const processPendingNotificationDeliveries = async (limit = 50) => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATION.PROCESS_PENDING_DELIVERY_LOGS, null, {
        params: {limit},
    });
    return response.data.result;
};

export const getMyNotificationPreferences = async () => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION.GET_MY_PREFERENCES);
    return response.data.result;
};

export const updateMyNotificationPreferences = async (payload) => {
    const response = await apiClient.put(API_ENDPOINTS.NOTIFICATION.UPDATE_MY_PREFERENCES, payload);
    return response.data.result;
};
