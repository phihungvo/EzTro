const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/login`,
        REGISTER: `${BASE_URL}/auth/register`,
    },
    FILE: {
        UPLOAD: `${BASE_URL}/files/upload`,
        CHECK_EXISTED: (file) =>
            `${BASE_URL}/storage/checkFileExists/${file.name}`,
        PRESIGNED_URL: (fileId) => `${BASE_URL}/files/presigned-url/${fileId}`,
        GET_INFO: `${BASE_URL}/storage/files`,
        GET_FILE: (filePath) => `${BASE_URL}/storage/files/${filePath}`,
    },
    SERVICE: {
        EXPORT_EXCEL: `${BASE_URL}/export/excel`,
    },
    USER: {
        GET_ALL: `${BASE_URL}/user/getAll`,
        CREATE: `${BASE_URL}/user/createUser`,
        UPDATE: (userId) => `${BASE_URL}/user/${userId}`,
        DELETE: `${BASE_URL}/user`,    
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
    },
    ROOM: {
        GET_ALL: `${BASE_URL}/rooms/paged`,
    },
    TENANTS: {
        GET_ALL: `${BASE_URL}/tenants/paged`,
        DETAIL: (tenantId) => `${BASE_URL}/tenants/${tenantId}`,
    }
};

export default API_ENDPOINTS;
