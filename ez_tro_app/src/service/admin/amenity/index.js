import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';


export const getAllAmenities = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.AMENITY.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all amenities ! Error: ', error);
        message.error('Error get all amenities: ');
        return null;
    }
};

export const createAmenity = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.AMENITY.CREATE,
            formData,
        );
        message.success('Amenity created successfully');
        return response.data;
    } catch (error) {
        console.error('Error when creating amenity: ', error);
    }
};

export const updateAmenity = async (amenityId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.AMENITY.UPDATE(amenityId),
            formData,
        );
        message.success('Amenity updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error when updating amenity: ', error);
    }
};

export const deleteAmenity = async (amenityId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.AMENITY.DELETE(amenityId));
        message.success('Amenity deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting amenity: ', error);
    }
};
