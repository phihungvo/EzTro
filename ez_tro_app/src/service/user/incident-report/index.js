import API_ENDPOINTS from '../../../constants/endpoints';
import {message} from 'antd';
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


export const createIncidentReports = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.MY_INCIDENT_REPORT.CREATE,
            formData
        );

        return response.data.result;
    } catch (error) {
        console.log('Error when create my incident report ! Error: ', error);
        message.error('Error create my incident report: ');
        return null;
    }
};


export const updateIncidentReport = async (incidentId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.MY_INCIDENT_REPORT.UPDATE(incidentId),
            formData,
        );
        message.success('Incident report updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error when updating incident report: ', error);
    }
};

export const deleteIncidentReport = async (incidentId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.MY_INCIDENT_REPORT.DELETE(incidentId));
        message.success('Incident report deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting incident report: ', error);
    }
};