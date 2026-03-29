import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getAllBills = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BILL.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all bills ! Error: ', error);
        message.error('Error get all bills: ');
        return null;
    }
};

export const filterBills = async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.BILL.FILTER, { params });
    return response.data.result;
};

export const createBill = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.BILL.CREATE,
            formData,
        );
        return response.data;
    } catch (error) {
        console.error('Error when creating bill: ', error);
        message.error(error.response?.data?.message || 'Lỗi tạo hoá đơn');
        throw error;
    }
};

export const updateBill = async (billId, formData) => {
    try {
        const response = await apiClient.put(API_ENDPOINTS.BILL.UPDATE(billId), formData);
        return response.data;
    } catch (error) {
        console.error('Error when updating bill: ', error);
        message.error(error.response?.data?.message || 'Lỗi cập nhật hoá đơn');
        throw error;
    }
};

export const deleteBill = async (billId) => {
    try {
        const response = await apiClient.delete(API_ENDPOINTS.BILL.DELETE(billId));
        return response.data;
    } catch (error) {
        console.error('Error when deleting bill: ', error);
        message.error(error.response?.data?.message || 'Lỗi xóa hoá đơn');
        throw error;
    }
};

export const cancelBill = async (billId) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.BILL.CANCEL(billId));
        return response.data;
    } catch (error) {
        console.error('Error when cancelling bill: ', error);
        message.error(error.response?.data?.message || 'Lỗi hủy hoá đơn');
        throw error;
    }
};
