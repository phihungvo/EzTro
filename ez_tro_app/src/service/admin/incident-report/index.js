import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getAllIncidentReports = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.INCIDENT_REPORT.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all incident report ! Error: ', error);
        message.error('Error get all incident report: ');
        return null;
    }
};

export const createIncidentReport = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.INCIDENT_REPORT.CREATE,
            formData,
        );
        message.success('Incident Report created successfully');
        return response.data;
    } catch (error) {
        console.error('Error when creating incident report: ', error);
    }
};

export const updateIncidentReport = async (incidentReportId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.INCIDENT_REPORT.UPDATE(incidentReportId),
            formData,
        );
        return response.data;
    } catch (error) {
        console.error('Error when updating incident report: ', error);
    }
};

export const deleteIncidentReport = async (incidentReportId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.INCIDENT_REPORT.DELETE(incidentReportId));
        message.success('Incident Report deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting incident report: ', error);
    }
};
