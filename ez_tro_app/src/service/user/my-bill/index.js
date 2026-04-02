import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

const extractFilename = (headers, fallback) => {
    const disposition = headers?.['content-disposition'] || headers?.['Content-Disposition'];
    const matched = disposition?.match(/filename="?([^"]+)"?/i);
    return matched?.[1] || fallback;
};

export const getMyBills = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.MY_BILL.GET_ALL);

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching my bill info ! Error: ', error);
        message.error('Error get my bill info: ');
        return null;
    }
};

export const getMyBillDetail = async (billId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.MY_BILL.DETAIL(billId));
        return response.data.result;
    } catch (error) {
        console.log('Error when fetching my bill detail ! Error: ', error);
        message.error(error.response?.data?.message || 'Không thể tải chi tiết hóa đơn');
        throw error;
    }
};

export const downloadMyBillDocument = async (billId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.MY_BILL.DOCUMENT(billId), {
            responseType: 'blob',
        });
        return {
            blob: response.data,
            fileName: extractFilename(response.headers, `hoa-don-${billId}.pdf`),
            contentType: response.headers?.['content-type'],
        };
    } catch (error) {
        console.log('Error when downloading my bill document ! Error: ', error);
        message.error(error.response?.data?.message || 'Không thể tải tài liệu hóa đơn');
        throw error;
    }
};

export const downloadMyBillReceipt = async (billId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.MY_BILL.RECEIPT(billId), {
            responseType: 'blob',
        });
        return {
            blob: response.data,
            fileName: extractFilename(response.headers, `bien-nhan-${billId}.pdf`),
            contentType: response.headers?.['content-type'],
        };
    } catch (error) {
        console.log('Error when downloading my bill receipt ! Error: ', error);
        message.error(error.response?.data?.message || 'Không thể tải biên nhận hóa đơn');
        throw error;
    }
};

export const uploadMyBillPaymentProof = async (billId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiClient.post(API_ENDPOINTS.MY_BILL.UPLOAD_PROOF(billId), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.result;
    } catch (error) {
        console.log('Error when uploading payment proof ! Error: ', error);
        message.error(error.response?.data?.message || 'Không thể tải chứng từ thanh toán');
        throw error;
    }
};

export const submitMyBillPayment = async (billId, payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.MY_BILL.SUBMIT_PAYMENT(billId), payload);
        return response.data.result;
    } catch (error) {
        console.log('Error when submitting my payment ! Error: ', error);
        message.error(error.response?.data?.message || 'Không thể gửi xác nhận thanh toán');
        throw error;
    }
};
