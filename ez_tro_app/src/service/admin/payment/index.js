import API_ENDPOINTS from "~/constants/endpoints";
import apiClient from "~/service/api/api";

const buildIdempotencyKey = (prefix) => {
    const randomPart =
        (typeof window !== "undefined" && window.crypto?.randomUUID?.()) ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${randomPart}`;
};

export const receivePayment = async (payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENT.RECEIVE, payload);
        return response.data.result;
    } catch (error) {
        console.error("Error when receiving payment: ", error);
        throw error;
    }
};

export const listPayments = async (params = {}) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.PAYMENT.RECEIVE, { params });
        return response.data.result;
    } catch (error) {
        console.error("Error when listing payments: ", error);
        throw error;
    }
};

export const getPaymentById = async (paymentId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.PAYMENT.DETAIL(paymentId));
        return response.data.result;
    } catch (error) {
        console.error("Error when fetching payment detail: ", error);
        throw error;
    }
};

export const confirmPayment = async (paymentId, payload = {}) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENT.CONFIRM(paymentId), payload);
        return response.data.result;
    } catch (error) {
        console.error("Error when confirming payment: ", error);
        throw error;
    }
};

export const allocatePayment = async (paymentId, payload = null) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENT.ALLOCATE(paymentId), payload, {
            headers: {
                "Idempotency-Key": buildIdempotencyKey(`allocate-${paymentId}`),
            },
        });
        return response.data.result;
    } catch (error) {
        console.error("Error when allocating payment: ", error);
        throw error;
    }
};

export const reversePayment = async (paymentId, payload = {}) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENT.REVERSE(paymentId), payload, {
            headers: {
                "Idempotency-Key": buildIdempotencyKey(`reverse-${paymentId}`),
            },
        });
        return response.data.result;
    } catch (error) {
        console.error("Error when reversing payment: ", error);
        throw error;
    }
};
