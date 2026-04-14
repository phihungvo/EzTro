import {configureStore} from '@reduxjs/toolkit';
import buildingReducer from '~/store/buildingSlice';
import boardingHouseReducer from '~/store/boardingHouseSlice';
import roomReducer from '~/store/roomSlice';
import tenantReducer from '~/store/tenantSlice';

export const store = configureStore({
    reducer: {
        building: buildingReducer,
        boardingHouse: boardingHouseReducer,
        room: roomReducer,
        tenant: tenantReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
