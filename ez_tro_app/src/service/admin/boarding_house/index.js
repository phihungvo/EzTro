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

export const getAllBoardingHousesNoPaged = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BOARDING_HOUSE.GET_ALL_NO_PAGING);

        return response.data.result;
    } catch (error) {
        message.error('Error get all boarding house: ');
        return null;
    }
};


export const createBoardingHouse = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.BOARDING_HOUSE.CREATE,
            formData,
        );
        message.success('Tạo khu trọ thành công');
        return response.data;
    } catch (error) {
        console.error('Error when creating boarding house: ', error);
    }
};

export const updateBoardingHouse = async (boardingHouseId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.BOARDING_HOUSE.UPDATE(boardingHouseId),
            formData,
        );
        message.success('Cập nhật khu trọ thành công');
        return response.data;
    } catch (error) {
        console.error('Error when updating boarding house: ', error);
    }
};

export const deleteBoardingHouse = async (boardingHouseId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.BOARDING_HOUSE.DELETE(boardingHouseId));
        message.success('Xoá khu trọ thành công');
        return response.data;
    } catch (error) {
        console.error('Error when deleting boarding house: ', error);
    }
};

export const getUtilityByBoardingHouse = async (boardingHouseId) => {
    try {
        const response = await apiClient.get(
            API_ENDPOINTS.BOARDING_HOUSE.GET_UTILITY(boardingHouseId));
        return response.data.result;
    } catch (error) {
        console.error('Error when get utilities: ', error);
    }
};
