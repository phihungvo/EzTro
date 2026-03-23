import API_ENDPOINTS from '../../../constants/endpoints';
import {message} from 'antd';
import apiClient from '~/service/api/api';

export const getAllRooms = async ({page, pageSize}) => {
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

export const getAllRoomPeriodSummary = async (boardingHouseId, month, year) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.ROOMS_PERIOD_SUMMARY(boardingHouseId, month, year));

        return response.data;
    } catch (err) {
        console.error("Fetch rooms period summary failed", err);
        message.error("Lỗi khi tải danh sách phòng");
    }
};

export const getCreatorBillContext = async (roomId, month, year) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.CREATOR_BILL_CONTEXT(roomId, month, year));
        return response.data;
    } catch (err) {
        console.error("Fetch creator bill context failed", err);
        message.error("Lỗi khi tải dữ liệu tạo hoá đơn");
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

export const getRoomById = async (roomId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.GET_BY_ID(roomId));
        return response.data.result;
    } catch (error) {
        console.error('Error when fetching room detail: ', error);
        throw error;
    }
};

export const filterRooms = async ({
                                      search,
                                      status,
                                      boardingHouseId,
                                      minArea,
                                      maxArea,
                                      minPrice,
                                      maxPrice,
                                      hasActiveContract,
                                      page = 0,
                                      pageSize = 10,
                                  }) => {
    try {
        const params = {
            search,
            status,
            boardingHouseId,
            minArea,
            maxArea,
            minPrice,
            maxPrice,
            hasActiveContract,
            page,
            size: pageSize,
            // sort mặc định (có thể thêm param sort sau nếu cần)
        };

        // Loại bỏ các param undefined/null để tránh gửi lên backend
        Object.keys(params).forEach(key =>
            (params[key] === undefined || params[key] === null) && delete params[key]
        );

        const response = await apiClient.get(API_ENDPOINTS.ROOM.FILTER, {params});
        return response.data; // giả sử trả về { content: [], totalElements: ..., ... }
    } catch (error) {
        console.error('Error filtering rooms:', error);
        // message.error('Lỗi khi lọc danh sách phòng');
        return null;
    }
};

export const getAllRoomAvailableByBoardingHouse = async (boardingHouseId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.ROOM.AVAILABLE_BY_BOARDING_HOUSE(boardingHouseId));
        return response.data.result;
    } catch (error) {
        message.error(
            error.response?.data?.message,
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

export const createRoom = async (formData) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.ROOM.CREATE, formData);
        return response.data;
    } catch (error) {
        console.error('Error when creating room: ', error);
        throw error;
    }
};

export const updateRoom = async (roomId, formData) => {
    try {
        const response = await apiClient.put(API_ENDPOINTS.ROOM.UPDATE(roomId), formData);
        return response.data;
    } catch (error) {
        console.error('Error when updating room: ', error);
        throw error;
    }
};

export const deleteRoom = async (roomId) => {
    try {
        const response = await apiClient.delete(API_ENDPOINTS.ROOM.DELETE(roomId));
        return response.data;
    } catch (error) {
        console.error('Error when deleting room: ', error);
        throw error;
    }
};
