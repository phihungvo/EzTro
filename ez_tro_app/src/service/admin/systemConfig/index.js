import API_ENDPOINTS from '~/constants/endpoints';
import apiClient from '~/service/api/api';
import {message} from 'antd';

export const getConfigByKey = async (key) => {
    try {
        const res = await apiClient.get(API_ENDPOINTS.SYSTEM_CONFIG.BY_KEY(key));
        return res.data.result;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        message.error(error.response?.data?.message || 'Không tải được cấu hình');
        throw error;
    }
};

export const upsertConfig = async ({id, key, value, description}) => {
    try {
        if (id) {
            const res = await apiClient.put(API_ENDPOINTS.SYSTEM_CONFIG.UPDATE(id), {key, value, description});
            return res.data.result;
        }
        const res = await apiClient.post(API_ENDPOINTS.SYSTEM_CONFIG.CREATE, {key, value, description});
        return res.data.result;
    } catch (error) {
        message.error(error.response?.data?.message || 'Lưu cấu hình thất bại');
        throw error;
    }
};
