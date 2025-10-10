import axios from 'axios';
import { message } from 'antd';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Giả sử backend có endpoint /auth/refresh để refresh token
                const refreshResponse = await axiosInstance.post('/auth/refresh', null, { withCredentials: true });
                const newToken = refreshResponse.data.token;
                localStorage.setItem('token', newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest); // Thử lại request
            } catch (refreshError) {
                // Nếu refresh thất bại, đăng xuất
                localStorage.removeItem('token');
                localStorage.removeItem('roles');
                localStorage.removeItem('permissions');
                message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/login'; // Redirect đến login
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;