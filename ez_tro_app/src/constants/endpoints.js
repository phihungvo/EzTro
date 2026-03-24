const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/login`,
        GOOGLE_LOGIN: `${BASE_URL}/auth/google`,
        REGISTER: `${BASE_URL}/auth/register`,
    },
    FILE: {
        UPLOAD: `${BASE_URL}/files/upload`,
        UPLOAD_CONTRACT: (contractId) => `${BASE_URL}/files/upload/contract/${contractId}`,
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
    NOTIFICATION: {
        GET_MY_NOTIFICATIONS: `${BASE_URL}/notifications/me`,
        MARK_AS_READ: (id) => `${BASE_URL}/notifications/read/${id}`,
        MARK_ALL_AS_READ: `${BASE_URL}/notifications/read-all`,
        UNREAD_COUNT: `${BASE_URL}/notifications/unread-count`,
    },
    USER: {
        GET_ALL: `${BASE_URL}/user/getAll`,
        BASIC_INFO: `${BASE_URL}/user/basic-info`,
        GET_OWNERS: `${BASE_URL}/user/owners`,
        CREATE: `${BASE_URL}/user/createUser`,
        UPDATE: (userId) => `${BASE_URL}/user/${userId}`,
        DELETE: `${BASE_URL}/user`,
        UPLOAD_FILE: (userId) => `${BASE_URL}/user/upload/${userId}`,
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
    OWNER: {
        GET_ALL: `${BASE_URL}/owners`,
        GET_MY_INFO: `${BASE_URL}/owners/me`,
        CREATE: `${BASE_URL}/owners`,
        UPDATE: (ownerId) => `${BASE_URL}/owners/${ownerId}`,
        DELETE: (ownerId) => `${BASE_URL}/owners/${ownerId}`,
    },
    BUILDING: {
        GET_ALL: `${BASE_URL}/buildings/paged`,
        GET_ALL_BY_ROLE: `${BASE_URL}/buildings/paged-by-role`,
        CREATE: `${BASE_URL}/buildings`,
        UPDATE: (buildingId) => `${BASE_URL}/buildings/${buildingId}`,
        DELETE: (buildingId) => `${BASE_URL}/buildings/${buildingId}`,
        GET_BY_BOARDING_HOUSE: (boardingHouseId) => `${BASE_URL}/buildings/boarding-house/${boardingHouseId}`,
    },
    ROOM: {
        GET_ALL: `${BASE_URL}/rooms/paged`,
        GET_ALL_NO_PAGING: `${BASE_URL}/rooms`,
        FILTER: `${BASE_URL}/rooms/filter`,
        RENTED_ACTIVE: `${BASE_URL}/rooms/rented-active`,
        RENTED_CONTEXT: (roomId) => `${BASE_URL}/rooms/${roomId}/rented-context`,
        CREATOR_BILL_CONTEXT: (roomId, month, year) =>
            `${BASE_URL}/rooms/${roomId}/creator-bill-context?month=${month}&year=${year}`,
        BY_BOARDING_HOUSE: (boardingHouseId) => `${BASE_URL}/rooms/by-boarding-house/${boardingHouseId}`,
        AVAILABLE_BY_BOARDING_HOUSE:(boardingHouseId) => `${BASE_URL}/rooms/${boardingHouseId}/available`,
        GET_ALL_AVAILABLE: `${BASE_URL}/rooms/available`,
        GET_BY_ID: (roomId) => `${BASE_URL}/rooms/${roomId}`,
        CREATE: `${BASE_URL}/rooms`,
        UPDATE: (roomId) => `${BASE_URL}/rooms/${roomId}`,
        DELETE: (roomId) => `${BASE_URL}/rooms/${roomId}`,
        ROOMS_PERIOD_SUMMARY: (boardingHouseId, month, year) =>
            `${BASE_URL}/rooms/boarding-houses/${boardingHouseId}/rooms-period-summary?month=${month}&year=${year}`,
    },
    TENANTS: {
        CREATE: `${BASE_URL}/tenants`,
        UPDATE: (tenantId) => `${BASE_URL}/tenants/${tenantId}`,
        GET_ALL: `${BASE_URL}/tenants/paged`,
        GET_ALL_NO_PAGING: `${BASE_URL}/tenants`,
        DETAIL: (tenantId) => `${BASE_URL}/tenants/${tenantId}`,
        RENTAL_DETAIL: (tenantId) => `${BASE_URL}/tenants/${tenantId}/current-rental`,
        FILTER: `${BASE_URL}/tenants/filter`,
    },
    BOARDING_HOUSE: {
        GET_ALL: `${BASE_URL}/boarding-houses/paged`,
        GET_ALL_NO_PAGING: `${BASE_URL}/boarding-houses`,
        DETAIL: (boardingHouseId) => `${BASE_URL}/boarding-houses/${boardingHouseId}`,
        CREATE: `${BASE_URL}/boarding-houses`,
        UPDATE: (boardingHouseId) => `${BASE_URL}/boarding-houses/${boardingHouseId}`,
        DELETE: (boardingHouseId) => `${BASE_URL}/boarding-houses/${boardingHouseId}`,
        GET_UTILITY: (boardingHouseId) => `${BASE_URL}/boarding-houses/${boardingHouseId}/utilities`,
    },
    CONTRACT: {
        GET_ALL: `${BASE_URL}/contracts/paged`,
        GET_ACTIVE: `${BASE_URL}/contracts/active`,
        FILTER: `${BASE_URL}/contracts/filter`,
        DETAIL: (contractId) => `${BASE_URL}/contracts/${contractId}`,
        CURRENT_VERSION: (contractId) => `${BASE_URL}/contracts/${contractId}/current-version`,
        SNAPSHOT: (contractId) => `${BASE_URL}/contracts/${contractId}/snapshot`,
        AMENDMENTS: (contractId) => `${BASE_URL}/contracts/${contractId}/amendments`,
        REVISE_AMENDMENT: (contractId, amendmentId) =>
            `${BASE_URL}/contracts/${contractId}/amendments/${amendmentId}/revise`,
        BILLING_RULES: (contractId) => `${BASE_URL}/contracts/${contractId}/billing-rules`,
        REVISE_BILLING_RULE: (contractId, billingRuleId) =>
            `${BASE_URL}/contracts/${contractId}/billing-rules/${billingRuleId}/revise`,
        DEACTIVATE_BILLING_RULE: (contractId, billingRuleId) =>
            `${BASE_URL}/contracts/${contractId}/billing-rules/${billingRuleId}/deactivate`,
        DEPOSIT_TRANSACTIONS: (contractId) => `${BASE_URL}/contracts/${contractId}/deposit-transactions`,
        FINALIZE_SETTLEMENT: (contractId) => `${BASE_URL}/contracts/${contractId}/settlement/finalize`,
        TERMINATE: (contractId) => `${BASE_URL}/contracts/${contractId}/terminate`,
        RENEW: (contractId) => `${BASE_URL}/contracts/${contractId}/renew`,
        MARK_VIOLATED: (contractId) => `${BASE_URL}/contracts/${contractId}/mark-violated`,
        TRANSFER_ROOM: (contractId) => `${BASE_URL}/contracts/${contractId}/transfer-room`,
        FOUNDATION_BACKFILL: `${BASE_URL}/contracts/foundation/backfill`,
        GET_FILES: (contractId) => `${BASE_URL}/contracts/files/${contractId}`,
        CREATE: `${BASE_URL}/contracts`,
        UPDATE: (contractId) => `${BASE_URL}/contracts/${contractId}`,
        DELETE: (contractId) => `${BASE_URL}/contracts/${contractId}`,
    },
    PROPERTY_ASSET: {
        GET_ALL: `${BASE_URL}/property-assets`,
        FILTER: `${BASE_URL}/property-assets/filter`,
        DETAIL: (assetId) => `${BASE_URL}/property-assets/${assetId}`,
        CREATE: `${BASE_URL}/property-assets`,
        UPDATE: (assetId) => `${BASE_URL}/property-assets/${assetId}`,
        DELETE: (assetId) => `${BASE_URL}/property-assets/${assetId}`,
        BY_ROOM: (roomId) => `${BASE_URL}/property-assets/room/${roomId}`,
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
        FILTER: `${BASE_URL}/bills/filter`,
    },
    UTILITY: {
        GET_ALL: `${BASE_URL}/utilities/paged`,
        GET_ALL_NO_PAGING: `${BASE_URL}/utilities`,
        CREATE: `${BASE_URL}/utilities`,
        UPDATE: (utilityId) => `${BASE_URL}/utilities/${utilityId}`,
        DELETE: (utilityId) => `${BASE_URL}/utilities/${utilityId}`,
    },
    ROOM_UTILITY: {
        GET_ALL: `${BASE_URL}/room-utilities/all-paged`,
        CREATE: `${BASE_URL}/room-utilities`,
        UPDATE: (roomId, utilityId) => `${BASE_URL}/room-utilities/${roomId}/${utilityId}`,
        DELETE: (roomId, utilityId) => `${BASE_URL}/room-utilities/${roomId}/${utilityId}`,
        GET_BY_ID: (roomId, utilityId) => `${BASE_URL}/room-utilities/${roomId}/${utilityId}`,
        GET_BY_ROOM: (roomId) => `${BASE_URL}/room-utilities/room/${roomId}`,
        GET_ACTIVE_BY_ROOM: (roomId) => `${BASE_URL}/room-utilities/room/${roomId}/active`,
        GET_BY_UTILITY: (utilityId) => `${BASE_URL}/room-utilities/utility/${utilityId}`,
        GET_PAGED_BY_ROOM: (roomId, page, size) => `${BASE_URL}/room-utilities/room/${roomId}/paged?page=${page}&size=${size}`,
    },
    INCIDENT_REPORT: {
        GET_ALL: `${BASE_URL}/incident-reports/paged`,
        CREATE: `${BASE_URL}/incident-reports`,
        UPDATE: (incidentId) => `${BASE_URL}/user/incident-reports/${incidentId}`,
        DELETE: (incidentId) => `${BASE_URL}/user/incident-reports/${incidentId}`,
    },
    PERIOD: {
        GET_ALL: `${BASE_URL}/meter-periods`,
        CREATE: `${BASE_URL}/meter-periods`,
    },
    METER_READING: {
        CREATE: `${BASE_URL}/meter-readings`,
        UPSERT: `${BASE_URL}/meter-readings/upsert`,
    },
    SUBSCRIPTION: {
        MY_LIMIT: `${BASE_URL}/subscriptions/my-limits`,
        CREATE: `${BASE_URL}/subscriptions/plans`,
    },

    // FOR USER ROLE
    DASHBOARD: {
        SUMMARY: `${BASE_URL}/user/dashboard/summary`,
        GET_MY_BILL: `${BASE_URL}/user/bills`,
    },
    MY_ROOM: {
        GET_ROOM_INFO: `${BASE_URL}/user/room/current`,
        GET_CURRENT_CONTRACT: `${BASE_URL}/user/room/current-contract`,
    },
    MY_BILL: {
        GET_ALL: `${BASE_URL}/user/bills/paged`,
    },
    MY_INCIDENT_REPORT: {
        GET_ALL: `${BASE_URL}/user/incident-reports`,
        CREATE: `${BASE_URL}/user/incident-reports`,
        UPDATE: (incidentId) => `${BASE_URL}/user/incident-reports/${incidentId}`,
        DELETE: (incidentId) => `${BASE_URL}/user/incident-reports/${incidentId}`,
    }
};

export default API_ENDPOINTS;
