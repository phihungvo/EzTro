import API_ENDPOINTS from '../../../constants/endpoints';
import {getToken} from '~/constants/token';
import apiClient from '~/service/api/api';

export const exportExcelFile = async (entityType) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.SERVICE.EXPORT_EXCEL, {
            params: {entityType},
            headers: {
                Authorization: `Bearer ${getToken()}`,
                Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
            responseType: 'blob',
        });
        return response;
    } catch (error) {
        console.error('Error exporting Excel file:', error);
        throw error;
    }
};