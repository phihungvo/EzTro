import API_ENDPOINTS from '~/constants/endpoints';
import apiClient from '~/service/api/api';
import {message} from 'antd';

export const getMyNotifications = async (page = 0, size = 10) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION.GET_MY_NOTIFICATIONS, {
            params: {page, size},
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