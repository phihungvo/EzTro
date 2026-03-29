import API_ENDPOINTS from '../../../constants/endpoints';
import {message} from 'antd';
import apiClient from '~/service/api/api';

export const previewInvoice = async (payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.BILLING.PREVIEW, payload);
        return response.data.result;
    } catch (error) {
        console.error('Error when previewing invoice: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi xem trước hoá đơn');
        throw error;
    }
};

export const finalizeInvoice = async (payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.BILLING.FINALIZE, payload);
        return response.data.result;
    } catch (error) {
        console.error('Error when finalizing invoice: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi tạo hoá đơn');
        throw error;
    }
};
