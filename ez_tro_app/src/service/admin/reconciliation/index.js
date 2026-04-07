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

export const getDebtAgingReport = async (contractId) => {
    if (!contractId) {
        throw new Error('Contract ID yêu cầu');
    }

    try {
        const response = await apiClient.get(API_ENDPOINTS.RECONCILIATION.AGING, {
            params: { contractId },
        });
        return response.data.result;
    } catch (error) {
        console.error('Lỗi khi lấy báo cáo tuổi nợ', error);
        message.error(error.response?.data?.message || 'Không thể tải báo cáo tuổi nợ');
        throw error;
    }
};

export const getCreditLedgerReport = async (contractId) => {
    if (!contractId) {
        throw new Error('Contract ID yêu cầu');
    }

    try {
        const response = await apiClient.get(API_ENDPOINTS.RECONCILIATION.CREDIT_LEDGER, {
            params: { contractId },
        });
        return response.data.result;
    } catch (error) {
        console.error('Lỗi khi lấy sổ credit', error);
        message.error(error.response?.data?.message || 'Không thể tải sổ credit');
        throw error;
    }
};
