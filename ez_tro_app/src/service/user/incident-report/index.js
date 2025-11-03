import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getMyIncidentReports = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.MY_INCIDENT_REPORT.GET_ALL);

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching my incident report ! Error: ', error);
        message.error('Error get my incident report: ');
        return null;
    }
};
