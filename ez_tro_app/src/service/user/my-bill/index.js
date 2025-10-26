import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getMyBills = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.MY_BILL.GET_ALL);

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching my bill info ! Error: ', error);
        message.error('Error get my bill info: ');
        return null;
    }
};
