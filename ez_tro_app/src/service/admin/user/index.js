import axios from 'axios';
import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';
import axiosInstance from '~/utils/axiosInstance';
import API_ENDPOINTS from "~/constants/endpoints";

export const login = async (username, password) => {
    try {
        const response = await axiosInstance.post('/auth/login', {
            username,
            password,
        });
        return response.data.result.token;
    } catch (error) {
        message.error(error.response?.data?.message || 'Đăng nhập thất bại');
        throw error;
    }
};

export const googleLogin = async (idToken) => {
    try {
        const response = await axiosInstance.post('/auth/google', {
            idToken,
        });
        return response.data.result.token;
    } catch (error) {
        message.error(error.response?.data?.message || 'Đăng nhập Google thất bại');
        throw error;
    }
};

export const logout = async () => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await axiosInstance.post('/auth/logout', {token});
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.clear();
        sessionStorage.clear();
    }
};

export const refreshToken = async () => {
    try {
        const response = await axiosInstance.post('/auth/refresh');
        return response.data?.result?.token;
    } catch (error) {
        message.error(error.response?.data?.message || 'Lỗi làm mới token');
        throw error;
    }
};

export const register = async (username, email, password) => {
    try {
        const payload =
            typeof username === 'object' && username !== null
                ? username
                : {username, email, password};
        const response = await axiosInstance.post('/auth/register', payload);
        return response.data?.result?.token;
    } catch (error) {
        message.error(error.response?.data?.message || 'Đăng ký thất bại');
        throw error;
    }
};

export const getAllUser = async ({ page = 0, pageSize = 5 }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.USER.GET_ALL, {
            params: { page, pageSize },
        });
        return response.data;
    } catch (error) {
        message.error(
            error.response?.data?.message || 'Lỗi lấy danh sách người dùng',
        );
        throw error;
    }
};


export const getAllUserNoPaged = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.USER.BASIC_INFO);
        return response.data;
    } catch (error) {
        message.error(
            error.response?.data?.message || 'Lỗi lấy danh sách người dùng',
        );
        throw error;
    }
};

export const getAllOwners = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.USER.GET_OWNERS);
        return response.data;
    } catch (error) {
        message.error(
            error.response?.data?.message || 'Lỗi lấy danh sách người dùng',
        );
        throw error;
    }
};

export const createUser = async (formData) => {
    try {
        const processedData = {
            ...formData,
            // roles: [formData.roles],
            // permissions: [formData.permissions],
            enabled:
                typeof formData.enabled === 'string'
                    ? ['true', 'yes'].includes(formData.enabled.toLowerCase())
                    : Boolean(formData.enabled),
        };

        const response = await apiClient.post(
            API_ENDPOINTS.USER.CREATE, processedData);

        if (response.status === 200) {
            message.success('User created successfully!');
        }

        return response.data;
    } catch (error) {
        console.error('Error when creating user: ', error);
        message.error(error.response?.data?.message || 'Failed to create user');
        throw error;
    }
};

export const updateUser = async (userId, formData) => {
    try {
        const updateData = { ...formData };

        updateData.enabled = formData.enabled === 'Yes';

        console.log('Update data: ', updateData);
        const response = await apiClient.put(
            API_ENDPOINTS.USER.UPDATE(userId), updateData);

        if (response.data) {
            message.success('Cập nhật người dùng thành công!');
        }
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || 'Error updating user';
        message.error(errorMessage);
        throw error;
    }
};

export const deleteUser = async (userIds) => {
    try {
        const response = await apiClient.delete(API_ENDPOINTS.USER.DELETE, {data: userIds});

        if (response.data) {
            message.success('User deleted successfully!');
            return response.data.result;
        }
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || 'Error deleting user';
        console.log('Error when deleting user! Error: ', errorMessage);
        message.error(errorMessage);
        throw error;
    }
};

export const uploadFile = async (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiClient.post(
            API_ENDPOINTS.USER.UPLOAD_FILE(userId),
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
