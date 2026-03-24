import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getMyRoomInfo = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.MY_ROOM.GET_ROOM_INFO);

        return response.data;
    } catch (error) {
        console.log('Error when fetching my room info ! Error: ', error);
        message.error('Error get my room info: ');
        return null;
    }
};

export const getMyCurrentContract = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.MY_ROOM.GET_CURRENT_CONTRACT);
        return response.data.result;
    } catch (error) {
        console.log('Error when fetching my contract info ! Error: ', error);
        message.error('Error get my contract info: ');
        return null;
    }
};
