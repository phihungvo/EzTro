import API_ENDPOINTS from '~/constants/endpoints';
import apiClient from '~/service/api/api';
import {message} from 'antd';

const createIdempotencyKey = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `payment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const listPayments = async (params = {}) => {
    try {
        const res = await apiClient.get(API_ENDPOINTS.PAYMENT.RECEIVE, {params});
        return res.data.result;
    } catch (error) {
        message.error(error.response?.data?.message || 'Lỗi tải danh sách thanh toán');
        throw error;
    }
};

export const getPaymentById = async (paymentId) => {
    try {
        const res = await apiClient.get(API_ENDPOINTS.PAYMENT.DETAIL(paymentId));
        return res.data.result;
    } catch (error) {
        message.error(error.response?.data?.message || 'Không lấy được chi tiết thanh toán');
        throw error;
    }
};

export const receivePayment = async (payload) => {
    try {
        const res = await apiClient.post(API_ENDPOINTS.PAYMENT.RECEIVE, payload, {
            headers: {
                'Idempotency-Key': createIdempotencyKey(),
            },
        });
        return res.data.result;
    } catch (error) {
        message.error(error.response?.data?.message || 'Ghi nhận thanh toán thất bại');
        throw error;
    }
};

export const confirmPayment = async (paymentId, payload) => {
    try {
        const res = await apiClient.post(API_ENDPOINTS.PAYMENT.CONFIRM(paymentId), payload, {
            headers: {
                'Idempotency-Key': createIdempotencyKey(),
            },
        });
        return res.data.result;
    } catch (error) {
        message.error(error.response?.data?.message || 'Xác nhận thanh toán thất bại');
        throw error;
    }
};

export const allocatePayment = async (paymentId, payload) => {
    try {
        const res = await apiClient.post(API_ENDPOINTS.PAYMENT.ALLOCATE(paymentId), payload, {
            headers: {
                'Idempotency-Key': createIdempotencyKey(),
            },
        });
        return res.data.result;
    } catch (error) {
        message.error(error.response?.data?.message || 'Phân bổ thanh toán thất bại');
        throw error;
    }
};

export const reversePayment = async (paymentId, payload) => {
    try {
        const res = await apiClient.post(API_ENDPOINTS.PAYMENT.REVERSE(paymentId), payload, {
            headers: {
                'Idempotency-Key': createIdempotencyKey(),
            },
        });
        return res.data.result;
    } catch (error) {
        message.error(error.response?.data?.message || 'Đảo ngược thanh toán thất bại');
        throw error;
    }
};

export const getPaymentAllocations = async (paymentId) => {
    try {
        const res = await apiClient.get(API_ENDPOINTS.PAYMENT.ALLOCATIONS(paymentId));
        return res.data.result;
    } catch (error) {
        message.error(error.response?.data?.message || 'Lỗi tải phân bổ thanh toán');
        throw error;
    }
};
