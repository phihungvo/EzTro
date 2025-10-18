import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getAllRooms = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all rooms ! Error: ', error);
        message.error('Error get all rooms: ');
        return null;
    }
};