import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';
export const getAllUtilities = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.UTILITY.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching all utilities ! Error: ', error);
        message.error('Error get all utilities: ');
        return null;
    }
};

export const getAllUtilitiesNoPaged = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.UTILITY.GET_ALL_NO_PAGING);

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching all utilities ! Error: ', error);
        message.error('Error get all utilities: ');
        return null;
    }
};

export const createUtility = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.UTILITY.CREATE,
            formData,
        );
        message.success('Utility created successfully');
        return response.data.result;
    } catch (error) {
        console.error('Error when creating utility: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi tạo tiện ích');
        throw error;
    }
};

export const updateUtility = async (utilityId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.UTILITY.UPDATE(utilityId),
            formData,
        );
        message.success('Amenity updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error when updating utility: ', error);
    }
};

export const deleteUtility = async (utilityId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.UTILITY.DELETE(utilityId));
        message.success('Utility deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting utility: ', error);
    }
};
