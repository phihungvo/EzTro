import API_ENDPOINTS from "~/constants/endpoints";
import apiClient from "~/service/api/api";

export const getMyMeterReadingsCurrentPeriod = async () => {
    const response = await apiClient.get(API_ENDPOINTS.USER_UTILITIES.CURRENT_PERIOD);
    return response.data?.result || [];
};

export const getMyMeterReadingsHistory = async (limit = 12) => {
    const response = await apiClient.get(API_ENDPOINTS.USER_UTILITIES.HISTORY, {
        params: {limit},
    });
    return response.data?.result || [];
};

export const getMyMeterReadingsPeriod = async (month, year) => {
    const response = await apiClient.get(API_ENDPOINTS.USER_UTILITIES.PERIOD(month, year));
    return response.data?.result || [];
};

