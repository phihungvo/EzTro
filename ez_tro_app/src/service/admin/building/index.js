import API_ENDPOINTS from '../../../constants/endpoints';
import apiClient from '~/service/api/api';

export const getAllBuildings = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BUILDING.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllBuildingsByRole = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BUILDING.GET_ALL_BY_ROLE, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createBuilding = async (formData) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.BUILDING.CREATE, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateBuilding = async (buildingId, formData) => {
    try {
        const response = await apiClient.put(API_ENDPOINTS.BUILDING.UPDATE(buildingId), formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteBuilding = async (buildingId) => {
    try {
        const response = await apiClient.delete(API_ENDPOINTS.BUILDING.DELETE(buildingId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getByBoardingHouse = async (boardingHouseId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BUILDING.GET_BY_BOARDING_HOUSE(boardingHouseId));
        return response.data;
    } catch (error) {
        throw error;
    }
};
