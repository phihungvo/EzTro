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
    AMENITY_NOT_FOUND(1042, "Amenity not found", HttpStatus.NOT_FOUND),
    AMENITY_NAME_ALREADY_EXISTS(1043, " Amenity name already exists in this boarding house", HttpStatus.CONFLICT),
    INVALID_ROOM_FOR_BOARDING_HOUSE(1044, "INVALID_ROOM_FOR_BOARDING_HOUSE", HttpStatus.CONFLICT),
    UTILITY_NOT_FOUND(1045, "Utility not found", HttpStatus.NOT_FOUND),
    ROOM_UTILITY_NOT_FOUND(1046, "Room utility not found", HttpStatus.NOT_FOUND),
    ROOM_UTILITY_ALREADY_EXISTS(1047, "Room utility already exists", HttpStatus.CONFLICT),

    CONTRACT_ROOM_ALREADY_ACTIVE(1048, "Room already has an active contract", HttpStatus.CONFLICT),
    CONTRACT_START_DATE_REQUIRED(1049, "Start date is required", HttpStatus.BAD_REQUEST),
    CONTRACT_END_DATE_INVALID(1050, "End date must be greater than or equal to start date", HttpStatus.BAD_REQUEST),
    CONTRACT_RENT_PRICE_INVALID(1051, "Rent price must be greater than 0", HttpStatus.BAD_REQUEST),
    CONTRACT_DEPOSIT_PAYMENT_METHOD_REQUIRED(
            1052, "Deposit payment method is required when deposit > 0", HttpStatus.BAD_REQUEST),
    CONTRACT_PAYMENT_CYCLE_INVALID(1053, "Payment cycle months must be >= 1", HttpStatus.BAD_REQUEST),
    CONTRACT_MONTHLY_PAYMENT_DAY_INVALID(1054, "Monthly payment day must be between 1 and 28", HttpStatus.BAD_REQUEST),
    CONTRACT_DEPOSIT_INVALID(1055, "Deposit must be >= 0", HttpStatus.BAD_REQUEST),
    YOU_HAVE_ACTIVE_CONTRACT(1056, "You already have an active contract", HttpStatus.CONFLICT),
    YOU_DO_NOT_HAVE_ACTIVE_CONTRACT(1057, "No active contract found", HttpStatus.NOT_FOUND),
    YOU_DONT_HAVE_ANY_ROOM_RENTED(1058, "You are not renting any room", HttpStatus.BAD_REQUEST),
    CANNOT_EDIT_RESOLVED_INCIDENT(
            1059, "Cannot edit incident report that is already resolved or rejected", HttpStatus.BAD_REQUEST),
    BUILDING_CREATE_FORBIDDEN(
            1060, "You are not allowed to create building in this boarding house", HttpStatus.FORBIDDEN),
    ELECTRIC_WATER_RECORD_EXISTS(
            1061,
            "Electric water record for this room in the specified month and year already exists",
            HttpStatus.CONFLICT),
    METER_READING_ALREADY_EXISTS_FOR_PERIOD(
            1062, "Meter reading for this room, utility, month, and year already exists", HttpStatus.CONFLICT),
    INVALID_METER_READING_VALUE(
            1063,
            "Current meter reading must be greater than or equal to the previous reading",
            HttpStatus.BAD_REQUEST),
    PERIOD_ALREADY_EXISTS(1064, "Meter reading period for this month and year already exists", HttpStatus.CONFLICT),
    PERIOD_ALREADY_CONFIRMED(1065, "Only DRAFT periods can be confirmed", HttpStatus.BAD_REQUEST),
    PERIOD_MUST_BE_CONFIRMED_BEFORE_LOCK(1066, "Only CONFIRMED periods can be locked", HttpStatus.BAD_REQUEST),
    PERIOD_NOT_FOUND(1067, "Meter reading period not found", HttpStatus.NOT_FOUND),
    PERIOD_LOCKED_CANNOT_EDIT(1068, "Cannot add or edit meter readings for a LOCKED period", HttpStatus.BAD_REQUEST),
    RESOURCE_LIMIT_EXCEEDED(1069, "Resource limit exceeded", HttpStatus.BAD_REQUEST),
    SUBSCRIPTION_PLAN_CODE_ALREADY_EXISTS(1070, "Subscription plan code already exists", HttpStatus.CONFLICT),
    SUBSCRIPTION_PLAN_NOT_FOUND(1071, "Subscription plan not found", HttpStatus.NOT_FOUND),
    SUBSCRIPTION_NOT_FOUND(1072, "Subscription not found", HttpStatus.NOT_FOUND),
    NO_ACTIVE_SUBSCRIPTION(1073, "No active subscription found", HttpStatus.NOT_FOUND),
    NOT_AN_OWNER(1074, "User is not an owner", HttpStatus.FORBIDDEN),
    ALREADY_HAS_ACTIVE_SUBSCRIPTION(1075, "Owner already has an active subscription", HttpStatus.CONFLICT),

    INVALID_PERIOD(9990, "Invalid period", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(9990, "Email already exists", HttpStatus.CONFLICT),
    NOTIFICATION_NOT_FOUND(9994, "Notification not found", HttpStatus.NOT_FOUND),
    OWNER_NOT_FOUND(9995, "Owner not found", HttpStatus.NOT_FOUND),
    ACCESS_DENIED(9996, "Access denied", HttpStatus.FORBIDDEN),
    USERNAME_EXISTED(9997, "Username existed!", HttpStatus.BAD_REQUEST),
    FORBIDDEN(9998, "Forbidden", HttpStatus.FORBIDDEN),
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
