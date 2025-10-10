import apiClient from '~/service/api/api';
import API_ENDPOINTS from '../../../constants/endpoints';
import {message} from 'antd';

export const getAllRoles = async ({page = 0, pageSize = 5}) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROLE.GET_ALL, {
            params: {page, pageSize},
        });

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching all role ! Error: ', error);
        message.error('Error get all role: ');
        return null;
    }
};

export const getAllRolesNoPaging = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROLE.GET_ALL_NO_PAGING);

        return response.data.result;
    } catch (error) {
        message.error('Error get all role: ');
        return null;
    }
};

export const createRole = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.ROLE.CREATE,
            formData,
        );
        if (response.data) {
            message.success('Tạo vai trò thành công');
        }
        return response.data;
    } catch (error) {
        console.error('Error when creating role: ', error);
    }
};

export const updateRole = async (roleId, formData) => {
    try {
        const response = await apiClient.put(API_ENDPOINTS.ROLE.UPDATE(roleId), formData);

        if (response.data) {
            message.success('Cập nhật vai trò thành công');
        }
        return response.data;
    } catch (error) {
        console.error('Error when updating role:', error);
        message.error('Failed to update role');
        throw error;
    }
};

export const deleteRole = async (roleId) => {
    try {
        const response = await apiClient.delete(API_ENDPOINTS.ROLE.DELETE(roleId));

        if (response.data) {
            message.success("Xoá vai trờ thành công!");
            return response.data.result;
        }

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting Role';
        console.log('Error when deleting Role! Error: ', errorMessage);
        message.error(errorMessage);
        throw error;
    }
}