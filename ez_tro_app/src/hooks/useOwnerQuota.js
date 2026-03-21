import { useQuery } from '@tanstack/react-query';
import apiClient from '~/service/api/api';
import API_ENDPOINTS from "~/constants/endpoints";

export const getRemaining = (current, max) => Math.max(0, max - current);

export const useOwnerQuota = () => {
    return useQuery({
        queryKey: ['owner-quota'],
        queryFn: async () => {
            const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.MY_LIMIT);
            return response.data.result;
        },
        staleTime: 5 * 60 * 1000, // 5'
        retry: 1,
        enabled: true,
    });
};