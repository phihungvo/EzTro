import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getAllBuildings = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BUILDING.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all buildings ! Error: ', error);
        message.error('Error get all buildings: ');
        return null;
    }
};


export const createBuilding = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.BUILDING.CREATE,
            formData,
        );
        message.success('Building created successfully');
        return response.data;
    } catch (error) {
        console.error('Error when creating building: ', error);
    }
};

export const updateBuilding = async (buildingId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.BUILDING.UPDATE(buildingId),
            formData,
        );
        message.success('Building updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error when updating building: ', error);
    }
};

export const deleteBuilding = async (buildingId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.BUILDING.DELETE(buildingId));
        message.success('Building deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting building: ', error);
    }
};