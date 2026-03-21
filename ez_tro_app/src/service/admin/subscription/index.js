import API_ENDPOINTS from '../../../constants/endpoints';
import {message} from 'antd';
import apiClient from '~/service/api/api';

export const createSubscription = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.SUBSCRIPTION.CREATE,
            formData,
        );
        message.success('Subscription created successfully');
        return response.data;
    } catch (error) {
        console.error('Error when creating subscription: ', error);
    }
};