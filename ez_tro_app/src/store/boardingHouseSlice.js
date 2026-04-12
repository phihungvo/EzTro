import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {deleteBoardingHouse, getAllBoardingHouses} from '~/service/admin/boarding_house';

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

export const fetchBoardingHouses = createAsyncThunk(
    'boardingHouse/fetchBoardingHouses',
    async ({page, pageSize}, {rejectWithValue}) => {
        try {
            const response = await getAllBoardingHouses({page, pageSize});
            return normalizePagingResponse(response);
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

export const removeBoardingHouse = createAsyncThunk(
    'boardingHouse/removeBoardingHouse',
    async (boardingHouseId, {rejectWithValue}) => {
        try {
            return await deleteBoardingHouse(boardingHouseId);
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
    searchTerm: '',
    modal: {
        open: false,
        selected: null,
    },
};

const boardingHouseSlice = createSlice({
    name: 'boardingHouse',
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
        setSearchTerm(state, action) {
            state.searchTerm = action.payload;
        },
        openDeleteModal(state, action) {
            state.modal = {
                open: true,
                selected: action.payload,
            };
        },
        closeModal(state) {
            state.modal = {
                open: false,
                selected: null,
            };
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoardingHouses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBoardingHouses.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(fetchBoardingHouses.rejected, (state, action) => {
                state.loading = false;
                state.items = [];
                state.total = 0;
                state.error = action.payload || action.error.message;
            })
            .addCase(removeBoardingHouse.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(removeBoardingHouse.fulfilled, (state) => {
                state.deleting = false;
            })
            .addCase(removeBoardingHouse.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const {
    setPagination,
    setViewMode,
    setSearchTerm,
    openDeleteModal,
    closeModal,
    clearError,
} = boardingHouseSlice.actions;

export default boardingHouseSlice.reducer;
