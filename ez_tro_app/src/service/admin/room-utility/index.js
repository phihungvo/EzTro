import API_ENDPOINTS from '../../../constants/endpoints';
import {message} from 'antd';
import apiClient from '~/service/api/api';

export const createRoomUtility = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.ROOM_UTILITY.CREATE,
            formData,
        );
        message.success('Đăng ký dịch vụ thành công');
        return response.data;
    } catch (error) {
        message.error('Lỗi khi đăng ký dịch vụ');
        throw error;
    }
};

export const updateRoomUtility = async (roomId, utilityId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.ROOM_UTILITY.UPDATE(roomId, utilityId),
            formData,
        );
        message.success('Cập nhật đăng ký dịch vụ thành công');
        return response.data;
    } catch (error) {
        message.error('Lỗi khi cập nhật đăng ký dịch vụ');
        throw error;
    }
};

export const deleteRoomUtility = async (roomId, utilityId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.ROOM_UTILITY.DELETE(roomId, utilityId)
        );
        message.success('Hủy đăng ký dịch vụ thành công');
        return response.data;
    } catch (error) {
        message.error('Lỗi khi hủy đăng ký dịch vụ');
        throw error;
    }
};

export const getRoomUtilityById = async (roomId, utilityId) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.ROOM_UTILITY.GET_BY_ID(roomId, utilityId)
        );
        return response.data.result;
    } catch (error) {
        message.error('Lỗi khi lấy đăng ký dịch vụ');
        throw error;
    }
};

export const getRoomUtilitiesByRoom = async (roomId) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.ROOM_UTILITY.GET_BY_ROOM(roomId)
        );
        return response.data.result;
    } catch (error) {
        message.error('Lỗi khi lấy danh sách dịch vụ theo phòng');
        throw error;
    }
};

export const getActiveRoomUtilitiesByRoom = async (roomId) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.ROOM_UTILITY.GET_ACTIVE_BY_ROOM(roomId)
        );
        return response.data.result;
    } catch (error) {
        message.error('Lỗi khi lấy dịch vụ active theo phòng');
        throw error;
    }
};

export const getRoomUtilitiesByUtility = async (utilityId) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.ROOM_UTILITY.GET_BY_UTILITY(utilityId)
        );
        return response.data.result;
    } catch (error) {
        message.error('Lỗi khi lấy đăng ký theo tiện ích');
        throw error;
    }
};

export const getRoomUtilitiesPagedByRoom = async (roomId, {page = 0, pageSize = 10}) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.ROOM_UTILITY.GET_PAGED_BY_ROOM(roomId, page, pageSize)
        );
        return response.data.result;
    } catch (error) {
        message.error('Lỗi khi lấy đăng ký dịch vụ phân trang');
        throw error;
    }
};

export const getAllRoomUtilitiesPaged = async ({page, size}) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.ROOM_UTILITY.GET_ALL, {
                params: {page, size},
            });
        return response.data.result;
    } catch (error) {
        message.error('Lỗi khi lấy đăng ký dịch vụ phân trang');
        throw error;
    }
};

// export const getAllRoomUtilitiesPaged = async ({ page, size }) => {
//     return apiClient.get('/rooms-utilities/paged', {
//         params: { page, size },
//     }).then(res => res.data.result);
// };
