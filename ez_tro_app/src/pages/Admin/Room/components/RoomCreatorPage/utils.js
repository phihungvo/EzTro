export const resolveBasePath = (pathname) => pathname.startsWith('/admin') ? '/admin/rooms' : '/owner/rooms';

export const mapRoomDetailToState = (detail) => ({
    boardingHouseId: detail?.boardingHouseId ? String(detail.boardingHouseId) : '',
    buildingId: detail?.buildingId ? String(detail.buildingId) : '',
    roomNumber: detail?.roomNumber || '',
    area: detail?.area != null ? String(detail.area) : '',
    price: detail?.price != null ? String(detail.price) : '',
    status: detail?.status || 'AVAILABLE',
    note: detail?.note || '',
    utilityIds: Array.isArray(detail?.utilityIds) ? detail.utilityIds.map((item) => String(item)) : [],
    floorNumber: detail?.floorNumber != null ? String(detail.floorNumber) : '',
    maxOccupants: detail?.maxOccupants != null ? String(detail.maxOccupants) : '2',
    hasAirConditioner: Boolean(detail?.hasAirConditioner),
    hasBathroom: detail?.hasBathroom !== false,
    hasKitchen: detail?.hasKitchen !== false,
});

export const formatCurrency = (value) => {
    const amount = Number(value || 0);
    if (!amount) return '0 d';
    return `${amount.toLocaleString('vi-VN')} d`;
};

export const extractErrorMessage = (error) => {
    const fieldErrors = error?.response?.data?.errors;
    if (fieldErrors && typeof fieldErrors === 'object') {
        const firstError = Object.values(fieldErrors)[0];
        if (firstError) return firstError;
    }

    return error?.response?.data?.message || error?.message || 'Khong the luu phong';
};
