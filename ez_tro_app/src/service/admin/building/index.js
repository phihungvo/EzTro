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