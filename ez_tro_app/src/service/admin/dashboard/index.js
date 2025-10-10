import apiClient from "~/service/api/api";
import API_ENDPOINTS from "~/constants/endpoints";

export const getEmployeeByDepartment = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.EMPLOYEE_BY_DEPARTMENT);

        return response.data;
    } catch (error) {
        return null;
    }
};