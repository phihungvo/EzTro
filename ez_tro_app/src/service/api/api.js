import axios from 'axios';
import {message} from 'antd';

// Tạo axios instance
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
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

// Khởi tạo token nếu có
if (authToken) {
    setAuthToken(authToken);
}

// Request interceptor: tự động thêm token
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

// Response interceptor: xử lý lỗi tập trung
apiClient.interceptors.response.use(
    (response) => {
        // Hiển thị message thành công nếu có của backend
        // if (resData?.message && typeof resData.message === 'string') {
        //     if (!resData.code || resData.code === 200 || resData.code === 201) {
        //         message.success(resData.message);
        //     }
        // }

        return response;
    },

    (error) => {
        const errResponse = error.response;
        let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';

        if (errResponse) {
            const {status, data} = errResponse;

            // Ưu tiên lấy message từ backend nếu có
            errorMessage = data?.message || errorMessage;

            // Xử lý theo status code
            switch (status) {
                case 400:
                    message.error(errorMessage || 'Yêu cầu không hợp lệ.');
                    break;

                case 401:
                    // Token hết hạn hoặc không hợp lệ
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('/login')) {
                        setAuthToken(null);
                        localStorage.clear();
                        sessionStorage.clear();

                        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
                    }
                    break;

                case 403:
                    message.error('Bạn không có quyền truy cập chức năng này.');
                    break;

                case 404:
                    message.error(errorMessage || 'Không tìm thấy tài nguyên.');
                    break;

                case 409:
                    message.error(errorMessage || 'Dữ liệu xung đột (đã tồn tại).');
                    break;

                case 422:
                    message.error(errorMessage || 'Dữ liệu không hợp lệ.');
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    message.error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
                    break;

                default:
                    message.error(errorMessage);
                    break;
            }

            // Log chi tiết cho dev
            console.error(`API Error [${status}]:`, errorMessage, data);
        } else if (error.request) {
            // Không nhận response (mạng lỗi, timeout, CORS...)
            message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
            console.error('Network Error:', error.message);
        } else {
            // Lỗi config axios hoặc cancel request
            message.error('Có lỗi xảy ra khi gửi yêu cầu.');
            console.error('Request Error:', error.message);
        }

        // Vẫn throw error để component có thể catch nếu cần xử lý riêng
        return Promise.reject(error);
    }
);

export default apiClient;
