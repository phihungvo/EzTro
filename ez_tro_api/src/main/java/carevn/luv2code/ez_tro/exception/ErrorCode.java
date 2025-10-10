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

    FILE_NOT_FOUND(1012, "File not found", HttpStatus.NOT_FOUND),
    MAX_UPLOAD_SIZE_EXCEEDED(1013, "File upload size exceeds the allowed limit", HttpStatus.BAD_REQUEST),

    UPDATE_USER_FAILED(1020, "Update user failed", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_HAS_COLLECTED_MOVIE(1021, "User has already collected this movie", HttpStatus.CONFLICT),
    USER_HAS_NOT_COLLECTED_MOVIE(1022, "User did not collect this movie", HttpStatus.CONFLICT),
    PERMISSION_NOT_FOUND(1023, "Permission not found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1024, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTS(1025, "Role already exists", HttpStatus.CONFLICT),
    PERMISSION_ALREADY_EXISTS(1026, "Permission already exists", HttpStatus.CONFLICT),
    INVALID_PERMISSION_FORMAT(1027, "Invalid permission format - should be 'resource:action'", HttpStatus.BAD_REQUEST),

    MINIO_INIT_ERROR(1058, "Error initializing MinIO bucket", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_UPLOAD_ERROR(1059, "Error uploading file to MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_DOWNLOAD_ERROR(1060, "Error downloading file from MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_DELETE_ERROR(1061, "Error deleting file from MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_LIST_ERROR(1062, "Error listing files in MinIO bucket", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_METADATA_ERROR(1063, "Error retrieving file metadata from MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_COPY_ERROR(1064, "Error copying file in MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_MOVE_COPY_ERROR(1065, "Error moving file: Failed to copy", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_MOVE_DELETE_ERROR(1066, "Error moving file: Failed to delete", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_PRESIGNED_URL_ERROR(1072, "Error generating presigned URL from MinIO", HttpStatus.INTERNAL_SERVER_ERROR),

    USERNAME_EXISTED(1075, "Username existed!", HttpStatus.BAD_REQUEST),

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
