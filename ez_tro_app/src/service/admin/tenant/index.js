import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getAllTenants = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.TENANTS.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all tenants ! Error: ', error);
        message.error('Error get all tenants: ');
        return null;
    }
};

export const tenantDetail = async (tenantId) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.TENANTS.DETAIL(tenantId),
        );

        return response.data;
    } catch (error) {
        console.error('Error when creating tenant: ', error);
    }
};