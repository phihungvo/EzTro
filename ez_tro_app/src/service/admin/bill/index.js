import API_ENDPOINTS from '../../../constants/endpoints';
import { message } from 'antd';
import apiClient from '~/service/api/api';

export const getAllBills = async ({ page, pageSize }) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.BILL.GET_ALL, {
            params: { page, pageSize },
        });

        return response.data;
    } catch (error) {
        console.log('Error when fetching all bills ! Error: ', error);
        message.error('Error get all bills: ');
        return null;
    }
};

export const createBill = async (formData) => {
    try {
        const response = await apiClient.post(
            API_ENDPOINTS.BILL.CREATE,
            formData,
        );
        message.success('Bill created successfully');
        return response.data;
    } catch (error) {
        console.error('Error when creating bill: ', error);
    }
};
//
// export const updateContract = async (contractId, formData) => {
//     try {
//         const response = await apiClient.put(
//             API_ENDPOINTS.CONTRACT.UPDATE(contractId),
//             formData,
//         );
//         message.success('Contract updated successfully');
//         return response.data;
//     } catch (error) {
//         console.error('Error when updating contract: ', error);
//     }
// };
//
// export const deleteContract = async (contractId) => {
//     try {
//         const response = await apiClient.delete(
//             API_ENDPOINTS.CONTRACT.DELETE(contractId));
//         message.success('Contract deleting successfully');
//         return response.data;
//     } catch (error) {
//         console.error('Error when deleting contract: ', error);
//     }
// };