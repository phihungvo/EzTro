import {message} from 'antd';

import API_ENDPOINTS from '~/constants/endpoints';
import apiClient from '~/service/api/api';

export const filterPropertyAssets = async ({
    search,
    category,
    status,
    condition,
    roomId,
    boardingHouseId,
    page = 0,
    pageSize = 10,
    sort = 'createdAt,desc',
}) => {
    try {
        const params = {
            search,
            category,
            status,
            condition,
            roomId,
            boardingHouseId,
            page,
            size: pageSize,
            sort,
        };

        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === null || params[key] === '' || params[key] === 'ALL') {
                delete params[key];
            }
        });

        const response = await apiClient.get(API_ENDPOINTS.PROPERTY_ASSET.FILTER, {params});
        return response.data?.result;
    } catch (error) {
        console.error('Error when filtering property assets:', error);
        throw error;
    }
};

export const getPropertyAssetDetail = async (assetId) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.PROPERTY_ASSET.DETAIL(assetId));
        return response.data?.result;
    } catch (error) {
        console.error('Error when fetching property asset detail:', error);
        throw error;
    }
};

export const createPropertyAsset = async (payload) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.PROPERTY_ASSET.CREATE, payload);
        message.success(response.data?.message || 'Tạo tài sản thành công');
        return response.data?.result;
    } catch (error) {
        console.error('Error when creating property asset:', error);
        throw error;
    }
};
