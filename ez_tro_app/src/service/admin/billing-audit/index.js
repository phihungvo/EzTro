import API_ENDPOINTS from '~/constants/endpoints';
import apiClient from '~/service/api/api';
import { message } from 'antd';

export const getBillingAuditLogs = async ({ contractId, targetType, targetId } = {}) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BILLING_AUDIT.GET_ALL, {
            params: {
                contractId,
                targetType,
                targetId,
            },
        });
        return response.data.result || [];
    } catch (error) {
        console.error('Lỗi khi lấy audit billing', error);
        message.error(error.response?.data?.message || 'Không thể tải lịch sử billing');
        throw error;
    }
};
