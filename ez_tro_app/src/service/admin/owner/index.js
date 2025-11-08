import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getAllOwners = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.OWNER.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching all Owners ! Error: ', error);
        message.error('Error get all Owners: ');
        return null;
    }
};

export const getMyInfo = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.OWNER.GET_MY_INFO);

        return response.data;
    } catch (error) {
        console.log('Error when fetching my info ! Error: ', error);
        message.error('Error get my info: ');
        return null;
    }
};

export const createOwner = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.OWNER.CREATE,
            formData,
        );
        message.success('Owner created successfully');
        return response.data;
    } catch (error) {
        console.error('Error when creating Owner: ', error);
    }
};

export const updateOwner = async (ownerId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.OWNER.UPDATE(ownerId),
            formData,
        );
        message.success('Owner updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error when updating Owner: ', error);
    }
};

export const deleteOwner = async (ownerId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.OWNER.DELETE(ownerId));
        message.success('Owner deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting Owner: ', error);
    }
};
