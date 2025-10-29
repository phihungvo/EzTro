const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/login`,
        REGISTER: `${BASE_URL}/auth/register`,
    },
    FILE: {
        UPLOAD: `${BASE_URL}/files/upload`,
        UPLOAD_CONTRACT: (contractId) =>  `${BASE_URL}/files/upload/contract/${contractId}`,
        CHECK_EXISTED: (file) =>
            `${BASE_URL}/storage/checkFileExists/${file.name}`,
        PRESIGNED_URL: (fileId) => `${BASE_URL}/files/${fileId}/presigned-url`,
        GET_INFO: `${BASE_URL}/storage/files`,
        GET_FILE: (filePath) => `${BASE_URL}/storage/files/${filePath}`,
        DELETE: (fileId) => `${BASE_URL}/files/${fileId}`,
    },
    SERVICE: {
        EXPORT_EXCEL: `${BASE_URL}/export/excel`,
    },
    USER: {
        GET_ALL: `${BASE_URL}/user/getAll`,
        BASIC_INFO: `${BASE_URL}/user/basic-info`,
        GET_OWNERS: `${BASE_URL}/user/owners`,
        CREATE: `${BASE_URL}/user/createUser`,
        UPDATE: (userId) => `${BASE_URL}/user/${userId}`,
        DELETE: `${BASE_URL}/user`,
        UPLOAD_FILE: (userId) =>  `${BASE_URL}/user/upload/${userId}`,
    },
    ROLE: {
        GET_ALL: `${BASE_URL}/roles`,
        GET_ALL_NO_PAGING: `${BASE_URL}/roles/noPaging`,
        CREATE: `${BASE_URL}/roles`,
        UPDATE: (roleId) => `${BASE_URL}/roles/${roleId}`,
        DELETE: (roleId) => `${BASE_URL}/roles/${roleId}`,
    },
    PERMISSION: {
        GET_ALL: `${BASE_URL}/permissions`,
        GET_ALL_NO_PAGING: `${BASE_URL}/permissions/noPaging`,
        CREATE: `${BASE_URL}/permissions`,
        UPDATE: (permissionId) => `${BASE_URL}/permissions/${permissionId}`,
    },
    BUILDING: {
        GET_ALL: `${BASE_URL}/buildings/paged`,
        CREATE: `${BASE_URL}/buildings`,
        UPDATE: (buildingId) => `${BASE_URL}/buildings/${buildingId}`,
        DELETE: (buildingId) => `${BASE_URL}/buildings/${buildingId}`,
    },
    ROOM: {
        GET_ALL: `${BASE_URL}/rooms/paged`,
        GET_ALL_NO_PAGING: `${BASE_URL}/rooms`,
        BY_BOARDING_HOUSE: (boardingHouseId) => `${BASE_URL}/rooms/by-boarding-house/${boardingHouseId}`,
    },
    TENANTS: {
        GET_ALL: `${BASE_URL}/tenants/paged`,
        GET_ALL_NO_PAGING: `${BASE_URL}/tenants`,
        DETAIL: (tenantId) => `${BASE_URL}/tenants/${tenantId}`,
        RENTAL_DETAIL: (tenantId) => `${BASE_URL}/tenants/${tenantId}/current-rental`,
    },
    BOARDING_HOUSE: {
        GET_ALL: `${BASE_URL}/boarding-houses/paged`,
        GET_ALL_NO_PAGING: `${BASE_URL}/boarding-houses`,
        CREATE: `${BASE_URL}/boarding-houses`,
        UPDATE: (boardingHouseId) => `${BASE_URL}/boarding-houses/${boardingHouseId}`,
        DELETE: (boardingHouseId) => `${BASE_URL}/boarding-houses/${boardingHouseId}`,
    },
    CONTRACT: {
        GET_ALL: `${BASE_URL}/contracts/paged`,
        GET_ACTIVE: `${BASE_URL}/contracts/active`,
        FILTER: `${BASE_URL}/contracts/filter`,
        GET_FILES: (contractId) => `${BASE_URL}/contracts/files/${contractId}`,
        CREATE: `${BASE_URL}/contracts`,
        UPDATE: (contractId) => `${BASE_URL}/contracts/${contractId}`,
        DELETE: (contractId) => `${BASE_URL}/contracts/${contractId}`,
    },
    AMENITY: {
        GET_ALL: `${BASE_URL}/amenities/paged`,
        CREATE: `${BASE_URL}/amenities`,
        UPDATE: (amenityId) => `${BASE_URL}/amenities/${amenityId}`,
        DELETE: (amenityId) => `${BASE_URL}/amenities/${amenityId}`,
    },
    BILL: {
        GET_ALL: `${BASE_URL}/bills`,
        CREATE: `${BASE_URL}/bills`,
    },
    UTILITY: {
        GET_ALL: `${BASE_URL}/utilities/paged`,
        CREATE: `${BASE_URL}/utilities`,
        UPDATE: (utilityId) => `${BASE_URL}/utilities/${utilityId}`,
        DELETE: (utilityId) => `${BASE_URL}/utilities/${utilityId}`,
    },

    // FOR USER ROLE
    DASHBOARD: {
        SUMMARY:  `${BASE_URL}/user/dashboard/summary`,
        GET_MY_BILL: `${BASE_URL}/user/bills`,
    },
    MY_ROOM: {
        GET_ROOM_INFO: `${BASE_URL}/user/room/current`,
    },
    MY_BILL: {
        GET_ALL: `${BASE_URL}/user/bills/paged`,
    }
};

export default API_ENDPOINTS;
