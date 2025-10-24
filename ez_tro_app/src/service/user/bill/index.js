import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getMyBills = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BILL.GET_MY_BILL);

        return response.data;
    } catch (error) {
        console.log('Error when fetching bills ! Error: ', error);
        message.error('Error get bills: ');
        return null;
    }
};