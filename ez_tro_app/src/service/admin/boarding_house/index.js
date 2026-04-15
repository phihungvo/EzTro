import API_ENDPOINTS from '../../../constants/endpoints';
import apiClient from '~/service/api/api';

export const getAllBoardingHouses = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BOARDING_HOUSE.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllBoardingHousesNoPaged = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BOARDING_HOUSE.GET_ALL_NO_PAGING);

        return response.data.result;
    } catch (error) {
        throw error;
    }
};

export const getBoardingHouseById = async (boardingHouseId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BOARDING_HOUSE.DETAIL(boardingHouseId));
        return response.data.result;
    } catch (error) {
        throw error;
    }
};

export const createBoardingHouse = async (formData) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.BOARDING_HOUSE.CREATE, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateBoardingHouse = async (boardingHouseId, formData) => {
    try {
        const response = await apiClient.put(API_ENDPOINTS.BOARDING_HOUSE.UPDATE(boardingHouseId), formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteBoardingHouse = async (boardingHouseId) => {
    try {
        const response = await apiClient.delete(API_ENDPOINTS.BOARDING_HOUSE.DELETE(boardingHouseId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUtilityByBoardingHouse = async (boardingHouseId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BOARDING_HOUSE.GET_UTILITY(boardingHouseId));
        return response.data.result;
    } catch (error) {
        throw error;
    }
};
