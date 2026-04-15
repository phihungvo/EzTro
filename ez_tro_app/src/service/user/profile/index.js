import API_ENDPOINTS from "~/constants/endpoints";
import apiClient from "~/service/api/api";

export const getMyProfile = async () => {
    const response = await apiClient.get(API_ENDPOINTS.USER_PROFILE.GET_ME);
    return response.data?.result;
};

export const updateMyProfile = async (payload) => {
    const response = await apiClient.put(API_ENDPOINTS.USER_PROFILE.UPDATE_ME, payload);
    return response.data?.result;
};

export const changeMyPassword = async (payload) => {
    const response = await apiClient.put(API_ENDPOINTS.USER_PROFILE.CHANGE_PASSWORD, payload);
    return response.data;
};

