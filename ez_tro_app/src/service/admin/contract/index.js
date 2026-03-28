import API_ENDPOINTS from '../../../constants/endpoints';
import {message} from 'antd';
import apiClient from '~/service/api/api';

export const uploadContractFile = async (file, contractId) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
        const response = await apiClient.post(
            API_ENDPOINTS.FILE.UPLOAD_CONTRACT(contractId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getContractFiles = async (contractId, params = {page: 0, size: 20}) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINTS.CONTRACT.GET_FILES(contractId)}`, {
            params,
        });
        return response.data.result;
    } catch (error) {
        console.error('Error fetching contract files:', error);
        message.error('Lỗi khi lấy danh sách file hợp đồng');
        throw error;
    }
};

export const getPresignedUrl = async (fileId, action = 'view') => {
    try {
        const response = await apiClient.get(`${API_ENDPOINTS.FILE.PRESIGNED_URL(fileId)}`, {
            params: {action},
        });
        return response.data.result;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        message.error(error.response?.data?.message || 'Lỗi khi tạo liên kết file');
        throw error;
    }
};

export const deleteContractFile = async (fileId) => {
    try {
        const response = await apiClient.delete(API_ENDPOINTS.FILE.DELETE(fileId));
        return response.data;
    } catch (error) {
        console.error('Error deleting contract file:', error);
        message.error('Lỗi khi xóa file hợp đồng');
        throw error;
    }
};

export const filterContracts = async ({ startDate, endDate, status, search, boardingHouseId, roomId, page, pageSize }) => {
    try {
        const params = {
            startDate,
            endDate,
            status,
            search,
            boardingHouseId,
            roomId,
            page,
            size: pageSize,
        };
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.FILTER, { params });
        return response.data;
    } catch (error) {
        console.error('Error when filtering contracts: ', error);
        message.error('Lỗi khi lọc hợp đồng');
        return null;
    }
};

export const getContractById = async (contractId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.DETAIL(contractId));
        return response.data.result;
    } catch (error) {
        console.error('Error when fetching contract detail: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi lấy chi tiết hợp đồng');
        throw error;
    }
};

export const getContractCurrentVersion = async (contractId, asOfDate) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.CURRENT_VERSION(contractId), {
            params: asOfDate ? { asOfDate } : undefined,
        });
        return response.data.result;
    } catch (error) {
        console.error('Error when fetching current contract version: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi lấy version hợp đồng');
        throw error;
    }
};

export const getContractSnapshot = async (contractId, asOfDate) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.SNAPSHOT(contractId), {
            params: asOfDate ? { asOfDate } : undefined,
        });
        return response.data.result;
    } catch (error) {
        console.error('Error when fetching contract snapshot: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi lấy snapshot hợp đồng');
        throw error;
    }
};

export const backfillContractFoundation = async () => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.FOUNDATION_BACKFILL);
        message.success('Đã chạy backfill contract foundation');
        return response.data.result;
    } catch (error) {
        console.error('Error when backfilling contract foundation: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi chạy backfill contract foundation');
        throw error;
    }
};

export const createContractAmendment = async (contractId, payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.AMENDMENTS(contractId), payload);
        message.success('Đã tạo phụ lục hợp đồng');
        return response.data.result;
    } catch (error) {
        console.error('Error when creating contract amendment: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi tạo phụ lục hợp đồng');
        throw error;
    }
};

export const reviseContractAmendment = async (contractId, amendmentId, payload) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.CONTRACT.REVISE_AMENDMENT(contractId, amendmentId),
            payload
        );
        message.success('Đã revise phụ lục hợp đồng');
        return response.data.result;
    } catch (error) {
        console.error('Error when revising contract amendment: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi revise phụ lục hợp đồng');
        throw error;
    }
};

export const createContractBillingRule = async (contractId, payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.BILLING_RULES(contractId), payload);
        message.success('Đã tạo billing rule');
        return response.data.result;
    } catch (error) {
        console.error('Error when creating contract billing rule: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi tạo billing rule');
        throw error;
    }
};

export const reviseContractBillingRule = async (contractId, billingRuleId, payload) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.CONTRACT.REVISE_BILLING_RULE(contractId, billingRuleId),
            payload
        );
        message.success('Đã revise billing rule');
        return response.data.result;
    } catch (error) {
        console.error('Error when revising contract billing rule: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi revise billing rule');
        throw error;
    }
};

export const deactivateContractBillingRule = async (contractId, billingRuleId) => {
    try {
        const response = await apiClient.patch(
            API_ENDPOINTS.CONTRACT.DEACTIVATE_BILLING_RULE(contractId, billingRuleId)
        );
        message.success('Đã ngừng áp dụng billing rule');
        return response.data.result;
    } catch (error) {
        console.error('Error when deactivating contract billing rule: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi ngừng áp dụng billing rule');
        throw error;
    }
};

export const createDepositTransaction = async (contractId, payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.DEPOSIT_TRANSACTIONS(contractId), payload);
        message.success('Đã ghi nhận giao dịch tiền cọc');
        return response.data.result;
    } catch (error) {
        console.error('Error when creating deposit transaction: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi ghi nhận giao dịch tiền cọc');
        throw error;
    }
};

export const finalizeContractSettlement = async (contractId) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.FINALIZE_SETTLEMENT(contractId));
        message.success('Đã chốt tất toán hợp đồng');
        return response.data.result;
    } catch (error) {
        // console.error('Error when finalizing contract settlement: ', error);
        // message.error(error.response?.data?.message || 'Lỗi khi chốt tất toán hợp đồng');
        throw error;
    }
};

export const terminateContract = async (contractId, payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.TERMINATE(contractId), payload);
        message.success('Đã chấm dứt hợp đồng');
        return response.data.result;
    } catch (error) {
        console.error('Error when terminating contract: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi chấm dứt hợp đồng');
        throw error;
    }
};

export const renewContract = async (contractId, payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.RENEW(contractId), payload);
        message.success('Đã gia hạn hợp đồng');
        return response.data.result;
    } catch (error) {
        console.error('Error when renewing contract: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi gia hạn hợp đồng');
        throw error;
    }
};

export const markContractViolated = async (contractId, payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.MARK_VIOLATED(contractId), payload);
        message.success('Đã đánh dấu vi phạm hợp đồng');
        return response.data.result;
    } catch (error) {
        console.error('Error when marking contract violated: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi đánh dấu vi phạm hợp đồng');
        throw error;
    }
};

export const transferContractRoom = async (contractId, payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.TRANSFER_ROOM(contractId), payload);
        message.success('Đã chuyển phòng thành công');
        return response.data.result;
    } catch (error) {
        console.error('Error when transferring contract room: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi chuyển phòng');
        throw error;
    }
};

export const getAllContracts = async ({page, pageSize}) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.GET_ALL, {
            params: {page, pageSize},
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all contracts ! Error: ', error);
        message.error('Error get all contracts: ');
        return null;
    }
};

export const getAllActiveContracts = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.GET_ACTIVE);

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching all contracts ! Error: ', error);
        message.error('Error get all contracts: ');
        return null;
    }
};

export const createContract = async (formData) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CONTRACT.CREATE, formData);

        if (response?.status === 200 || response?.status === 201) {
            message.success('Tạo hợp đồng thành công');
            return response.data;
        }
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 409) {
                message.error( 'Phòng đã có hợp đồng đang hoạt động');
            } else {
                message.error(data?.message || 'Error when creating contract');
            }
        }
        throw error;
    }
};

export const updateContract = async (contractId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.CONTRACT.UPDATE(contractId),
            formData,
        );
        message.success('Cập nhật hợp đồng thành công');
        return response.data;
    } catch (error) {
        console.error('Error when updating contract: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật hợp đồng');
        throw error;
    }
};

export const deleteContract = async (contractId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.CONTRACT.DELETE(contractId));
        message.success('Xóa hợp đồng thành công');
        return response.data;
    } catch (error) {
        console.error('Error when deleting contract: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi xóa hợp đồng');
        throw error;
    }
};
