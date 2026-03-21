import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';


export const createTenant = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.TENANTS.CREATE,
            formData,
        );
        return response.data.result;
    } catch (error) {
        console.error('Error when creating tenant: ', error);
        message.error(error.response?.data?.message || 'Lỗi khi tạo người thuê');
        throw error;
    }
};

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

export const getAllTenantNoPaged = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.TENANTS.GET_ALL_NO_PAGING);
        return response.data.result;
    } catch (error) {
        message.error(
            error.response?.data?.message || 'Lỗi lấy danh sách người dùng',
        );
        throw error;
    }
};

export const filterTenants = async ({ startDate, endDate, gender, occupation, hasActiveContract, search, page, pageSize }) => {
    try {
        const params = {
            startDate,
            endDate,
            gender,
            occupation,
            hasActiveContract,
            search,  // fullName, email, phoneNumber, identityNumber, occupation
            page,
            pageSize,
        };
        const response = await apiClient.get(API_ENDPOINTS.TENANTS.FILTER, { params });
        return response.data;
    } catch (error) {
        console.error('Error when filtering tenants: ', error);
        message.error('Lỗi khi lọc người thuê');
        return null;
    }
};

export const tenantDetail = async (tenantId) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.TENANTS.DETAIL(tenantId),
        );

        return response.data.result;
    } catch (error) {
        console.error('Error when tenant detail: ', error);
    }
};

export const tenantRentalDetail = async (tenantId) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.TENANTS.RENTAL_DETAIL(tenantId),
        );

        return response.data.result;
    } catch (error) {
        console.error('Error when get rental detail: ', error);
    }
};
