import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getAllBoardingHouses = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BOARDING_HOUSE.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        message.error('Error get all boarding house: ');
        return null;
    }
};