import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

const extractFilename = (headers, fallback) => {
    const disposition = headers?.['content-disposition'] || headers?.['Content-Disposition'];
    const matched = disposition?.match(/filename="?([^"]+)"?/i);
    return matched?.[1] || fallback;
};

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

export const getBillDetail = async (billId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BILL.DETAIL(billId));
        return response.data.result;
    } catch (error) {
        console.error('Error when fetching bill detail: ', error);
        message.error(error.response?.data?.message || 'Lỗi tải chi tiết hoá đơn');
        throw error;
    }
};

export const downloadBillDocument = async (billId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BILL.DOCUMENT(billId), {
            responseType: 'blob',
        });
        return {
            blob: response.data,
            fileName: extractFilename(response.headers, `hoa-don-${billId}.pdf`),
            contentType: response.headers?.['content-type'],
        };
    } catch (error) {
        console.error('Error when downloading bill document: ', error);
        message.error(error.response?.data?.message || 'Lỗi tải tài liệu hóa đơn');
        throw error;
    }
};

export const downloadBillReceipt = async (billId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BILL.RECEIPT(billId), {
            responseType: 'blob',
        });
        return {
            blob: response.data,
            fileName: extractFilename(response.headers, `bien-nhan-${billId}.pdf`),
            contentType: response.headers?.['content-type'],
        };
    } catch (error) {
        console.error('Error when downloading bill receipt: ', error);
        message.error(error.response?.data?.message || 'Lỗi tải biên nhận hóa đơn');
        throw error;
    }
};

export const sendBill = async (billId, payload = null) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.BILL.SEND(billId), payload);
        return response.data.result;
    } catch (error) {
        console.error('Error when sending bill: ', error);
        message.error(error.response?.data?.message || 'Lỗi gửi hoá đơn');
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
