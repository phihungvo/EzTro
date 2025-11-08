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
        message.success('Xóa file thành công');
        return response.data.result;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        message.error('Lỗi khi tạo liên kết file');
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
            search,  // tenantFullName, roomNumber, contractCode
            boardingHouseId,
            roomId,
            page,
            pageSize,
        };
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.FILTER, { params });
        return response.data;
    } catch (error) {
        console.error('Error when filtering contracts: ', error);
        message.error('Lỗi khi lọc hợp đồng');
        return null;
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
    }
};

export const updateContract = async (contractId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.CONTRACT.UPDATE(contractId),
            formData,
        );
        message.success('Contract updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error when updating contract: ', error);
    }
};

export const deleteContract = async (contractId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.CONTRACT.DELETE(contractId));
        message.success('Contract deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting contract: ', error);
    }
};