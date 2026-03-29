import API_ENDPOINTS from '~/constants/endpoints';
import apiClient from '~/service/api/api';
import { message } from 'antd';

export const getContractReconciliation = async (contractId) => {
    if (!contractId) {
        throw new Error('Contract ID yêu cầu');
    }

    try {
        const response = await apiClient.get(API_ENDPOINTS.RECONCILIATION.CONTRACT(contractId));
        return response.data.result;
    } catch (error) {
        console.error('Lỗi khi lấy báo cáo đối soát', error);
        message.error(error.response?.data?.message || 'Không thể tải báo cáo đối soát');
        throw error;
    }
};
