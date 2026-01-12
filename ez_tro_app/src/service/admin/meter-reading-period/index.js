import {message} from 'antd';
import apiClient from '~/service/api/api';
import API_ENDPOINTS from "~/constants/endpoints";

export const getAllPeriod = async ({page, pageSize}) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.GET_ALL, {
            params: {page, pageSize},
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all rooms ! Error: ', error);
        message.error('Error get all rooms: ');
        return null;
    }
};

export const getAllPeriodNoPaging = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.PERIOD.GET_ALL);

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching all rooms ! Error: ', error);
        message.error('Error get all rooms: ');
        return null;
    }
};

export const createPeriod = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.PERIOD.CREATE,
            formData,
        );
        message.success('Period created successfully');
        return response.data;
    } catch (error) {
        console.error('Error when creating period: ', error);
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

export const getAllRoomAvailable = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.GET_ALL_AVAILABLE);
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


export const updateRoom = async (roomId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.ROOM.UPDATE(roomId),
            formData,
        );
        message.success('Room updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error when updating room: ', error);
    }
};

export const deleteRoom = async (roomId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.ROOM.DELETE(roomId));
        message.success('Room deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting room: ', error);
    }
};