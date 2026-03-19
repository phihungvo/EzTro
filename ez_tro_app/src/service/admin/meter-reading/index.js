import { message } from "antd";
import API_ENDPOINTS from "../../../constants/endpoints";
import apiClient from "~/service/api/api";

export const upsertMeterReading = async (formData) => {
    try {
        const response = await apiClient.put(API_ENDPOINTS.METER_READING.UPSERT, formData);
        return response.data;
    } catch (error) {
        console.error("Error when saving meter reading: ", error);
        message.error(error.response?.data?.message || "Lỗi lưu chỉ số công tơ");
        throw error;
    }
};
