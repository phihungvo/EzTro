import { useState, useEffect, useCallback } from 'react';
import apiClient from '~/service/api';
import { message } from 'antd';

export const useApi = () => {
    const [loading, setLoading] = useState(false);

    const request = useCallback(async (config) => {
        setLoading(true);
        try {
            const response = await apiClient(config);
            return response.data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const get = useCallback((url, config = {}) => {
        return request({ ...config, method: 'GET', url });
    }, [request]);

    const post = useCallback((url, data, config = {}) => {
        return request({ ...config, method: 'POST', url, data });
    }, [request]);

    const put = useCallback((url, data, config = {}) => {
        return request({ ...config, method: 'PUT', url, data });
    }, [request]);

    const del = useCallback((url, config = {}) => {
        return request({ ...config, method: 'DELETE', url });
    }, [request]);

    return { loading, get, post, put, delete: del };
};

// Example usage in components:
// const { loading, get, post } = useApi();
// const fetchUsers = () => get('/users');
// const createUser = (userData) => post('/users', userData);