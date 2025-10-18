package carevn.luv2code.ez_tro.exception;

import org.springframework.http.HttpStatus;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    INVALID_KEY(1000, "Invalid key", HttpStatus.BAD_GATEWAY),
    USER_EXISTED(1001, "User existed", HttpStatus.BAD_GATEWAY),
    USERNAME_INVALID(1002, "Username must be at least {min} characters", HttpStatus.BAD_GATEWAY),
    PASSWORD_INVALID(1003, "Password must be at least {min} characters", HttpStatus.BAD_GATEWAY),
    USER_NOT_FOUND(1004, "User not found", HttpStatus.NOT_FOUND),
    USER_HAS_BEEN_DELETED(1005, "User has been deleted", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1006, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1007, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1008, "You don't have permission", HttpStatus.FORBIDDEN),
    EMAIL_EXISTED(1009, "Email already was used by other user!", HttpStatus.CONFLICT),

    FILE_NOT_FOUND(1010, "File not found", HttpStatus.NOT_FOUND),
    MAX_UPLOAD_SIZE_EXCEEDED(1011, "File upload size exceeds the allowed limit", HttpStatus.BAD_REQUEST),

    UPDATE_USER_FAILED(1012, "Update user failed", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_HAS_COLLECTED_MOVIE(1013, "User has already collected this movie", HttpStatus.CONFLICT),
    USER_HAS_NOT_COLLECTED_MOVIE(1014, "User did not collect this movie", HttpStatus.CONFLICT),
    PERMISSION_NOT_FOUND(1014, "Permission not found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1015, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTS(1016, "Role already exists", HttpStatus.CONFLICT),
    PERMISSION_ALREADY_EXISTS(1017, "Permission already exists", HttpStatus.CONFLICT),
    INVALID_PERMISSION_FORMAT(1018, "Invalid permission format - should be 'resource:action'", HttpStatus.BAD_REQUEST),

    MINIO_INIT_ERROR(1019, "Error initializing MinIO bucket", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_UPLOAD_ERROR(1020, "Error uploading file to MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_DOWNLOAD_ERROR(1021, "Error downloading file from MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_DELETE_ERROR(1022, "Error deleting file from MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_LIST_ERROR(1023, "Error listing files in MinIO bucket", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_METADATA_ERROR(1024, "Error retrieving file metadata from MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_COPY_ERROR(1025, "Error copying file in MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_MOVE_COPY_ERROR(1026, "Error moving file: Failed to copy", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_MOVE_DELETE_ERROR(1027, "Error moving file: Failed to delete", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_PRESIGNED_URL_ERROR(1028, "Error generating presigned URL from MinIO", HttpStatus.INTERNAL_SERVER_ERROR),

    ROOM_NOT_FOUND(1029, "Room not found", HttpStatus.NOT_FOUND),
    BOARDING_HOUSE_NOT_FOUND(1030, "Boarding house not found", HttpStatus.NOT_FOUND),
    TENANT_NOT_FOUND(1031, "Tenant not found", HttpStatus.NOT_FOUND),
    BILL_NOT_FOUND(1032, "Bill not found", HttpStatus.NOT_FOUND),
    CONTRACT_NOT_FOUND(1033, "Contract not found", HttpStatus.NOT_FOUND),
    ELECTRIC_WATER_RECORD_NOT_FOUND(1034, "Electric water record not found", HttpStatus.NOT_FOUND),
    BOARDING_HOUSE_ALREADY_EXISTS(1035, "Boarding house already exists", HttpStatus.CONFLICT),
    ROOM_ALREADY_EXISTS(1036, "Room already exists", HttpStatus.CONFLICT),
    TENANT_ALREADY_EXISTS(1037, "Tenant already exists", HttpStatus.CONFLICT),
    CONTRACT_ALREADY_EXISTS(1038, "Contract already exists", HttpStatus.CONFLICT),
    BILL_ALREADY_EXISTS(1039, "Bill already exists", HttpStatus.CONFLICT),
    ELECTRIC_WATER_RECORD_ALREADY_EXISTS(1040, "Electric water record already exists", HttpStatus.CONFLICT),
    BUILDING_NOT_FOUND(1041, "Building not found", HttpStatus.NOT_FOUND),

    USERNAME_EXISTED(9998, "Username existed!", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception", HttpStatus.INTERNAL_SERVER_ERROR);

    int code;
    String message;
    HttpStatus statusCode;

    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
