import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';
import axios from "axios";

export const uploadContractFile = async (file, contractId) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
        const response = await apiClient.post(
            API_ENDPOINTS.FILE.UPLOAD_CONTRACT(contractId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllContracts = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all contracts ! Error: ', error);
        message.error('Error get all contracts: ');
        return null;
    }
};

export const getAllActiveContracts = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CONTRACT.GET_ACTIVE);

        return response.data.result;
    } catch (error) {
        console.log('Error when fetching all contracts ! Error: ', error);
        message.error('Error get all contracts: ');
        return null;
    }
};

export const createContract = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.CONTRACT.CREATE,
            formData,
        );
        message.success('Contract created successfully');
        return response.data;
    } catch (error) {
        console.error('Error when creating contract: ', error);
    }
};

export const updateContract = async (contractId, formData) => {
    try {
        const response = await apiClient.put(
            API_ENDPOINTS.CONTRACT.UPDATE(contractId),
            formData,
        );
        message.success('Contract updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error when updating contract: ', error);
    }
};

export const deleteContract = async (contractId) => {
    try {
        const response = await apiClient.delete(
            API_ENDPOINTS.CONTRACT.DELETE(contractId));
        message.success('Contract deleting successfully');
        return response.data;
    } catch (error) {
        console.error('Error when deleting contract: ', error);
    }
};