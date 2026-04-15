import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {deleteTenant, filterTenants} from '~/service/admin/tenant';

const normalizeApiError = (error) => (
    error?.response?.data?.message ||
    error?.response?.data?.result?.message ||
    error?.message ||
    'Có lỗi xảy ra. Vui lòng thử lại.'
);

const normalizePagingResponse = (response) => {
    const payload = response?.data ?? response;

    return {
        items: Array.isArray(payload?.content) ? payload.content : [],
        total: Number(payload?.totalElements ?? 0),
    };
};

export const fetchTenants = createAsyncThunk(
    'tenant/fetchTenants',
    async (params, {rejectWithValue}) => {
        try {
            const response = await filterTenants(params);
            return normalizePagingResponse(response);
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

export const removeTenant = createAsyncThunk(
    'tenant/removeTenant',
    async (tenantId, {rejectWithValue}) => {
        try {
            return await deleteTenant(tenantId);
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

const initialState = {
    items: [],
    loading: false,
    deleting: false,
    error: null,
    total: 0,
    pagination: {
        current: 1,
        pageSize: 10,
    },
    viewMode: 'table',
    modal: {
        open: false,
        mode: 'create',
        selected: null,
    },
};

const tenantSlice = createSlice({
    name: 'tenant',
    initialState,
    reducers: {
        setPagination(state, action) {
            const {current, pageSize} = action.payload;
            state.pagination.current = current;
            state.pagination.pageSize = pageSize;
        },
        setViewMode(state, action) {
            state.viewMode = action.payload;
        },
        openDeleteModal(state, action) {
            state.modal = {
                open: true,
                mode: 'delete',
                selected: action.payload,
            };
        },
        closeModal(state) {
            state.modal = {
                open: false,
                mode: 'create',
                selected: null,
            };
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTenants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenants.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(fetchTenants.rejected, (state, action) => {
                state.loading = false;
                state.items = [];
                state.total = 0;
                state.error = action.payload || action.error.message;
            })
            .addCase(removeTenant.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(removeTenant.fulfilled, (state) => {
                state.deleting = false;
            })
            .addCase(removeTenant.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const {
    setPagination,
    setViewMode,
    openDeleteModal,
    closeModal,
    clearError,
} = tenantSlice.actions;

export default tenantSlice.reducer;
