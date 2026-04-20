import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {deleteRoom, filterRooms} from '~/service/admin/room';
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

export const fetchRooms = createAsyncThunk(
    'room/fetchRooms',
    async (params, {rejectWithValue}) => {
        try {
            const response = await filterRooms(params);
            return normalizePagingResponse(response);
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    },
);

export const fetchRoomBoardingHouseOptions = createAsyncThunk(
    'room/fetchRoomBoardingHouseOptions',
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

export const removeRoom = createAsyncThunk(
    'room/removeRoom',
    async (roomId, {rejectWithValue}) => {
        try {
            return await deleteRoom(roomId);
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
    deleting: false,
    error: null,
    total: 0,
    viewMode: 'card',
    modal: {
        open: false,
        selected: null,
    },
};

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        setViewMode(state, action) {
            state.viewMode = action.payload;
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
            .addCase(fetchRooms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRooms.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(fetchRooms.rejected, (state, action) => {
                state.loading = false;
                state.items = [];
                state.total = 0;
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchRoomBoardingHouseOptions.pending, (state) => {
                state.boardingHouseLoading = true;
            })
            .addCase(fetchRoomBoardingHouseOptions.fulfilled, (state, action) => {
                state.boardingHouseLoading = false;
                state.boardingHouseOptions = action.payload;
            })
            .addCase(fetchRoomBoardingHouseOptions.rejected, (state, action) => {
                state.boardingHouseLoading = false;
                state.boardingHouseOptions = [];
                state.error = action.payload || action.error.message;
            })
            .addCase(removeRoom.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(removeRoom.fulfilled, (state) => {
                state.deleting = false;
            })
            .addCase(removeRoom.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const {
    setViewMode,
    openDeleteModal,
    closeModal,
    clearError,
} = roomSlice.actions;

export default roomSlice.reducer;
