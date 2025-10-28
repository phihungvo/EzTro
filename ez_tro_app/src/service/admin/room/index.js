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


export const getAllRoomNoPaged = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.GET_ALL_NO_PAGING);
        return response.data.result;
    } catch (error) {
        message.error(
            error.response?.data?.message || 'Lỗi lấy danh sách người dùng',
        );
        throw error;
    }
};

export const getRoomsByBoardingHouse = async (boardingHouseId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.BY_BOARDING_HOUSE(boardingHouseId));
        return response.data.result;
    } catch (error) {
        console.error('Error fetching rooms by boarding house:', error);
        message.error('Lỗi khi lấy danh sách phòng');
        return [];
    }
};