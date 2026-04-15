import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {createBuilding, deleteBuilding, getAllBuildingsByRole, updateBuilding} from '~/service/admin/building';
import {getAllBoardingHousesNoPaged} from '~/service/admin/boarding_house';

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

export const fetchBuildings = createAsyncThunk(
    'building/fetchBuildings',
    async ({page, pageSize}, {rejectWithValue}) => {
        try {
            const response = await getAllBuildingsByRole({page, pageSize});
            return normalizePagingResponse(response);
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

export const fetchBoardingHouseOptions = createAsyncThunk(
    'building/fetchBoardingHouseOptions',
    async (_, {rejectWithValue}) => {
        try {
            const response = await getAllBoardingHousesNoPaged();
            const boardingHouses = Array.isArray(response) ? response : [];

            return boardingHouses.map((item) => ({
                value: item.id,
                label: item.name,
            }));
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

export const createBuildingItem = createAsyncThunk(
    'building/createBuildingItem',
    async (formData, {rejectWithValue}) => {
        try {
            return await createBuilding(formData);
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

export const updateBuildingItem = createAsyncThunk(
    'building/updateBuildingItem',
    async ({buildingId, formData}, {rejectWithValue}) => {
        try {
            return await updateBuilding(buildingId, formData);
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

export const deleteBuildingItem = createAsyncThunk(
    'building/deleteBuildingItem',
    async (buildingId, {rejectWithValue}) => {
        try {
            return await deleteBuilding(buildingId);
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

const initialState = {
    items: [],
    boardingHouseOptions: [],
    loading: false,
    boardingHouseLoading: false,
    saving: false,
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

const buildingSlice = createSlice({
    name: 'building',
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
        openCreateModal(state) {
            state.modal = {
                open: true,
                mode: 'create',
                selected: null,
            };
        },
        openEditModal(state, action) {
            state.modal = {
                open: true,
                mode: 'edit',
                selected: action.payload,
            };
        },
        openDeleteModal(state, action) {
            state.modal = {
                open: true,
                mode: 'delete',
                selected: action.payload,
            };
        },
        closeModal(state) {
            state.modal.open = false;
            state.modal.selected = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBuildings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuildings.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(fetchBuildings.rejected, (state, action) => {
                state.loading = false;
                state.items = [];
                state.total = 0;
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchBoardingHouseOptions.pending, (state) => {
                state.boardingHouseLoading = true;
            })
            .addCase(fetchBoardingHouseOptions.fulfilled, (state, action) => {
                state.boardingHouseLoading = false;
                state.boardingHouseOptions = action.payload;
            })
            .addCase(fetchBoardingHouseOptions.rejected, (state, action) => {
                state.boardingHouseLoading = false;
                state.boardingHouseOptions = [];
                state.error = action.payload || action.error.message;
            })
            .addCase(createBuildingItem.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createBuildingItem.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(createBuildingItem.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(updateBuildingItem.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateBuildingItem.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(updateBuildingItem.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(deleteBuildingItem.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deleteBuildingItem.fulfilled, (state) => {
                state.deleting = false;
            })
            .addCase(deleteBuildingItem.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const {
    setPagination,
    setViewMode,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    clearError,
} = buildingSlice.actions;

export default buildingSlice.reducer;
