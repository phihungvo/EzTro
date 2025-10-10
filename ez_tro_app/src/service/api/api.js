import axios from 'axios';
import { message } from 'antd';

// Tạo axios instance
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Token management
let authToken = localStorage.getItem('token');

export const setAuthToken = (token) => {
    authToken = token;
    if (token) {
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Initialize token if exists
if (authToken) {
    setAuthToken(authToken);
}

// Request interceptor - Tự động thêm token vào headers
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle token expiration và errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, config } = error;

        // Handle token expiration
        if (response?.status === 401) {
            const currentPath = window.location.pathname;

            // Chỉ redirect nếu không phải đang ở trang login
            if (!currentPath.includes('/login')) {
                setAuthToken(null);
                localStorage.clear();
                sessionStorage.clear();

                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

                // Redirect to login with return URL
                window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
            }
        }

        // Handle other errors
        if (response?.status === 403) {
            message.error('Bạn không có quyền truy cập chức năng này.');
        } else if (response?.status >= 500) {
            message.error('Lỗi server. Vui lòng thử lại sau.');
        } else if (!response) {
            message.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;