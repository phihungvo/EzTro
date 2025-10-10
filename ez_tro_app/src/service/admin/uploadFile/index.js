import apiClient from '~/service/api/api';
import API_ENDPOINTS from '../../../constants/endpoints';
import axios from "axios";

export const uploadFile = async (file, employeeId) => {
    const formData = new FormData();
    formData.append('file', file);

    const TOKEN = localStorage.getItem('token');

    try {
        const response = await axios.post(`${API_ENDPOINTS.FILE.UPLOAD}?employeeId=${employeeId}`, formData, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPresignedUrl = async (fileId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.FILE.PRESIGNED_URL(fileId));
        return response.data.result;
    } catch (error) {
        throw new Error("Lỗi khi lấy presigned URL: " + error.message);
    }
};

// Get all file infor
export const getFileInfo = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.FILE.GET_INFO);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMovieImage = async (imagePath) => {
    const TOKEN = localStorage.getItem('token');

    try {
        if (
            imagePath &&
            (imagePath.startsWith('http://') ||
                imagePath.startsWith('https://'))
        ) {
            return imagePath;
        }

        const response = await apiClient.get(API_ENDPOINTS.FILE.GET_FILE, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
            responseType: 'blob',
        });
        // Tạo URL từ blob response
        return URL.createObjectURL(response.data);
    } catch (error) {
        return '/';
    }
};

export default {
    uploadFile,
    getFileInfo,
    getMovieImage,
};
