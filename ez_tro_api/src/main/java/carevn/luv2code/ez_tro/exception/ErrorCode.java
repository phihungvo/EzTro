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

    FILE_NOT_FOUND(1010, "Không tìm thấy file", HttpStatus.NOT_FOUND),
    MAX_UPLOAD_SIZE_EXCEEDED(1011, "Kích thước file tải lên vượt quá giới hạn cho phép", HttpStatus.BAD_REQUEST),

    UPDATE_USER_FAILED(1012, "Update user failed", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_HAS_COLLECTED_MOVIE(1013, "User has already collected this movie", HttpStatus.CONFLICT),
    USER_HAS_NOT_COLLECTED_MOVIE(1014, "User did not collect this movie", HttpStatus.CONFLICT),
    PERMISSION_NOT_FOUND(1014, "Permission not found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(1015, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTS(1016, "Role already exists", HttpStatus.CONFLICT),
    PERMISSION_ALREADY_EXISTS(1017, "Permission already exists", HttpStatus.CONFLICT),
    INVALID_PERMISSION_FORMAT(1018, "Invalid permission format - should be 'resource:action'", HttpStatus.BAD_REQUEST),

    MINIO_INIT_ERROR(1019, "Lỗi khởi tạo bucket MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_UPLOAD_ERROR(1020, "Lỗi tải file lên MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_DOWNLOAD_ERROR(1021, "Lỗi tải file từ MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_DELETE_ERROR(1022, "Lỗi xóa file trên MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_LIST_ERROR(1023, "Lỗi lấy danh sách file trong bucket MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_METADATA_ERROR(1024, "Lỗi lấy metadata của file từ MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_COPY_ERROR(1025, "Lỗi sao chép file trong MinIO", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_MOVE_COPY_ERROR(1026, "Lỗi di chuyển file: Không thể sao chép", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_MOVE_DELETE_ERROR(1027, "Lỗi di chuyển file: Không thể xóa", HttpStatus.INTERNAL_SERVER_ERROR),
    MINIO_PRESIGNED_URL_ERROR(1028, "Lỗi tạo presigned URL từ MinIO", HttpStatus.INTERNAL_SERVER_ERROR),

    ROOM_NOT_FOUND(1029, "Không tìm thấy phòng", HttpStatus.NOT_FOUND),
    BOARDING_HOUSE_NOT_FOUND(1030, "Không tìm thấy nhà trọ", HttpStatus.NOT_FOUND),
    TENANT_NOT_FOUND(1031, "Không tìm thấy người thuê", HttpStatus.NOT_FOUND),
    BILL_NOT_FOUND(1032, "Không tìm thấy hóa đơn", HttpStatus.NOT_FOUND),
    CONTRACT_NOT_FOUND(1033, "Không tìm thấy hợp đồng", HttpStatus.NOT_FOUND),
    ELECTRIC_WATER_RECORD_NOT_FOUND(1034, "Không tìm thấy bản ghi điện nước", HttpStatus.NOT_FOUND),
    BOARDING_HOUSE_ALREADY_EXISTS(1035, "Nhà trọ đã tồn tại", HttpStatus.CONFLICT),
    ROOM_ALREADY_EXISTS(1036, "Phòng đã tồn tại", HttpStatus.CONFLICT),
    TENANT_ALREADY_EXISTS(1037, "Người thuê đã tồn tại", HttpStatus.CONFLICT),
    CONTRACT_ALREADY_EXISTS(1038, "Hợp đồng đã tồn tại", HttpStatus.CONFLICT),
    BILL_ALREADY_EXISTS(1039, "Hóa đơn đã tồn tại", HttpStatus.CONFLICT),
    ELECTRIC_WATER_RECORD_ALREADY_EXISTS(1040, "Bản ghi điện nước đã tồn tại", HttpStatus.CONFLICT),
    BUILDING_NOT_FOUND(1041, "Không tìm thấy tòa nhà", HttpStatus.NOT_FOUND),
    AMENITY_NOT_FOUND(1042, "Không tìm thấy tiện ích", HttpStatus.NOT_FOUND),
    AMENITY_NAME_ALREADY_EXISTS(1043, "Tên tiện ích đã tồn tại trong nhà trọ này", HttpStatus.CONFLICT),
    INVALID_ROOM_FOR_BOARDING_HOUSE(1044, "Phòng không thuộc nhà trọ", HttpStatus.CONFLICT),
    UTILITY_NOT_FOUND(1045, "Không tìm thấy tiện ích", HttpStatus.NOT_FOUND),
    ROOM_UTILITY_NOT_FOUND(1046, "Không tìm thấy tiện ích của phòng", HttpStatus.NOT_FOUND),
    ROOM_UTILITY_ALREADY_EXISTS(1047, "Tiện ích của phòng đã tồn tại", HttpStatus.CONFLICT),
    ROOM_STATUS_INVALID(1092, "Trạng thái phòng không hợp lệ cho thao tác hiện tại", HttpStatus.BAD_REQUEST),

    CONTRACT_ROOM_ALREADY_ACTIVE(1048, "Phòng đã có hợp đồng đang hoạt động", HttpStatus.CONFLICT),
    CONTRACT_START_DATE_REQUIRED(1049, "Yêu cầu ngày bắt đầu", HttpStatus.BAD_REQUEST),
    CONTRACT_END_DATE_INVALID(1050, "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu", HttpStatus.BAD_REQUEST),
    CONTRACT_RENT_PRICE_INVALID(1051, "Giá thuê phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    CONTRACT_DEPOSIT_PAYMENT_METHOD_REQUIRED(
            1052, "Yêu cầu phương thức thanh toán tiền cọc khi tiền cọc > 0", HttpStatus.BAD_REQUEST),
    CONTRACT_PAYMENT_CYCLE_INVALID(1053, "Chu kỳ thanh toán (tháng) phải >= 1", HttpStatus.BAD_REQUEST),
    CONTRACT_MONTHLY_PAYMENT_DAY_INVALID(1054, "Ngày thanh toán hàng tháng phải từ 1 đến 28", HttpStatus.BAD_REQUEST),
    CONTRACT_DEPOSIT_INVALID(1055, "Tiền cọc phải >= 0", HttpStatus.BAD_REQUEST),
    YOU_HAVE_ACTIVE_CONTRACT(1056, "Bạn đã có hợp đồng đang hoạt động", HttpStatus.CONFLICT),
    YOU_DO_NOT_HAVE_ACTIVE_CONTRACT(1057, "Không tìm thấy hợp đồng đang hoạt động", HttpStatus.NOT_FOUND),
    YOU_DONT_HAVE_ANY_ROOM_RENTED(1058, "Bạn chưa thuê phòng nào", HttpStatus.BAD_REQUEST),
    CANNOT_EDIT_RESOLVED_INCIDENT(
            1059, "Không thể chỉnh sửa sự cố đã được xử lý hoặc bị từ chối", HttpStatus.BAD_REQUEST),
    BUILDING_CREATE_FORBIDDEN(
            1060, "Bạn không được phép tạo tòa nhà trong nhà trọ này", HttpStatus.FORBIDDEN),
    ELECTRIC_WATER_RECORD_EXISTS(
            1061,
            "Bản ghi điện nước của phòng này trong tháng và năm đã tồn tại",
            HttpStatus.CONFLICT),
    METER_READING_ALREADY_EXISTS_FOR_PERIOD(
            1062, "Chỉ số công tơ cho phòng, tiện ích, tháng và năm này đã tồn tại", HttpStatus.CONFLICT),
    INVALID_METER_READING_VALUE(
            1063,
            "Chỉ số công tơ hiện tại phải lớn hơn hoặc bằng chỉ số trước đó",
            HttpStatus.BAD_REQUEST),
    PERIOD_ALREADY_EXISTS(1064, "Kỳ ghi chỉ số cho tháng và năm này đã tồn tại", HttpStatus.CONFLICT),
    PERIOD_ALREADY_CONFIRMED(1065, "Chỉ các kỳ ở trạng thái DRAFT mới có thể được xác nhận", HttpStatus.BAD_REQUEST),
    PERIOD_MUST_BE_CONFIRMED_BEFORE_LOCK(1066, "Chỉ các kỳ đã được CONFIRMED mới có thể khóa", HttpStatus.BAD_REQUEST),
    PERIOD_NOT_FOUND(1067, "Không tìm thấy kỳ ghi chỉ số", HttpStatus.NOT_FOUND),
    PERIOD_LOCKED_CANNOT_EDIT(1068, "Không thể thêm hoặc chỉnh sửa chỉ số cho kỳ đã bị khóa", HttpStatus.BAD_REQUEST),
    RESOURCE_LIMIT_EXCEEDED(1069, "Vượt quá giới hạn tài nguyên", HttpStatus.BAD_REQUEST),
    SUBSCRIPTION_PLAN_CODE_ALREADY_EXISTS(1070, "Mã gói đăng ký đã tồn tại", HttpStatus.CONFLICT),
    SUBSCRIPTION_PLAN_NOT_FOUND(1071, "Không tìm thấy gói đăng ký", HttpStatus.NOT_FOUND),
    SUBSCRIPTION_NOT_FOUND(1072, "Không tìm thấy đăng ký", HttpStatus.NOT_FOUND),
    NO_ACTIVE_SUBSCRIPTION(1073, "Không tìm thấy đăng ký đang hoạt động", HttpStatus.NOT_FOUND),
    NOT_AN_OWNER(1074, "Người dùng không phải là chủ sở hữu", HttpStatus.FORBIDDEN),
    ALREADY_HAS_ACTIVE_SUBSCRIPTION(1075, "Chủ sở hữu đã có đăng ký đang hoạt động", HttpStatus.CONFLICT),
    GOOGLE_ID_TOKEN_INVALID(1076, "ID token của Google không hợp lệ", HttpStatus.UNAUTHORIZED),
    GOOGLE_EMAIL_NOT_VERIFIED(1077, "Email Google chưa được xác minh", HttpStatus.UNAUTHORIZED),
    SYSTEM_CONFIG_NOT_FOUND(1078, "Không tìm thấy cấu hình hệ thống", HttpStatus.NOT_FOUND),
    SYSTEM_CONFIG_INVALID_VALUE(1079, "Giá trị cấu hình hệ thống không hợp lệ", HttpStatus.BAD_REQUEST),
    DEFAULT_SUBSCRIPTION_PLAN_INACTIVE(1080, "Gói đăng ký mặc định phải đang hoạt động", HttpStatus.BAD_REQUEST),
    SYSTEM_CONFIG_KEY_ALREADY_EXISTS(1081, "Khóa cấu hình hệ thống đã tồn tại", HttpStatus.CONFLICT),
    PROPERTY_ASSET_NOT_FOUND(1082, "Không tìm thấy tài sản", HttpStatus.NOT_FOUND),
    PROPERTY_ASSET_CODE_ALREADY_EXISTS(1083, "Mã tài sản đã tồn tại", HttpStatus.CONFLICT),
    PROPERTY_ASSET_SERIAL_ALREADY_EXISTS(1084, "Số serial tài sản đã tồn tại", HttpStatus.CONFLICT),
    INVALID_BUILDING_FOR_BOARDING_HOUSE(
            1085, "Tòa nhà không thuộc nhà trọ được chỉ định", HttpStatus.CONFLICT),
    CONTRACT_TENANT_PASSWORD_REQUIRED(1086, "Yêu cầu mật khẩu của người thuê", HttpStatus.BAD_REQUEST),
    CONTRACT_ROOM_CHANGE_NOT_ALLOWED(1087, "Không được phép thay đổi phòng trong hợp đồng", HttpStatus.BAD_REQUEST),
    CONTRACT_TENANT_CHANGE_NOT_ALLOWED(1088, "Không được phép thay đổi người thuê trong hợp đồng", HttpStatus.BAD_REQUEST),
    CONTRACT_UTILITIES_UPDATE_NOT_ALLOWED(1089, "Không được phép cập nhật tiện ích trong hợp đồng", HttpStatus.BAD_REQUEST),
    ROOM_FLOOR_INVALID(1090, "Tầng của phòng không khớp với cấu hình tòa nhà", HttpStatus.BAD_REQUEST),
    ROOM_DELETE_NOT_ALLOWED(
            1091, "Không thể xóa phòng vì đã có dữ liệu vận hành", HttpStatus.BAD_REQUEST),
    BOARDING_HOUSE_DELETE_NOT_ALLOWED(
            1093, "Không thể xóa nhà trọ vì đã có dữ liệu liên quan", HttpStatus.BAD_REQUEST),
    BUILDING_DELETE_NOT_ALLOWED(
            1094, "Không thể xóa tòa nhà vì đã có phòng", HttpStatus.BAD_REQUEST),
    UTILITY_NOT_BELONG_TO_ROOM_BOARDING_HOUSE(
            1095, "Tiện ích không thuộc nhà trọ của phòng", HttpStatus.CONFLICT),
    ROOM_UTILITY_REQUEST_ID_MISMATCH(1096, "ID yêu cầu tiện ích phòng không khớp với đường dẫn", HttpStatus.BAD_REQUEST),
    CONTRACT_EFFECTIVE_DATE_INVALID(
            1097, "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu", HttpStatus.BAD_REQUEST),
    CONTRACT_BILLING_RULE_NOT_FOUND(1098, "Không tìm thấy quy tắc tính phí hợp đồng", HttpStatus.NOT_FOUND),
    DEPOSIT_TRANSACTION_AMOUNT_INVALID(
            1099, "Số tiền giao dịch đặt cọc phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    CONTRACT_SETTLEMENT_INSUFFICIENT_DEPOSIT(
            1100, "Số dư tiền đặt cọc không đủ để tất toán hợp đồng", HttpStatus.BAD_REQUEST),
    CONTRACT_TRANSFER_OPEN_BILLS_NOT_ALLOWED(
            1101, "Các hóa đơn chưa thanh toán phải được xử lý trước khi chuyển tiền đặt cọc", HttpStatus.BAD_REQUEST),
    CONTRACT_RENEWAL_DATE_INVALID(
            1102, "Ngày hiệu lực gia hạn phải sau ngày kết thúc hợp đồng hiện tại", HttpStatus.BAD_REQUEST),
    CONTRACT_ALREADY_RENEWED_FOR_PERIOD(
            1103, "Hợp đồng đã được gia hạn cho khoảng thời gian này", HttpStatus.CONFLICT),
    CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED(
            1104, "Không được phép thực hiện thao tác vòng đời hợp đồng với trạng thái hiện tại", HttpStatus.BAD_REQUEST),
    CONTRACT_OPERATION_ALREADY_PROCESSING(
            1105, "Một thao tác hợp đồng với idempotency key này đang được xử lý", HttpStatus.CONFLICT),
    CONTRACT_EFFECTIVE_OUT_OF_RANGE(
            1110, "Thời gian hiệu lực phải nằm trong vòng đời hợp đồng", HttpStatus.BAD_REQUEST),
    CONTRACT_AMENDMENT_DATA_INVALID(
            1111, "Dữ liệu điều chỉnh hợp đồng không hợp lệ", HttpStatus.BAD_REQUEST),
    CONTRACT_AMENDMENT_CONFLICT(
            1112, "Điều chỉnh hợp đồng bị xung đột với các điều chỉnh hiện có", HttpStatus.CONFLICT),
    CONTRACT_BILLING_RULE_CONFLICT(
            1113, "Quy tắc tính phí hợp đồng bị xung đột với các quy tắc hiện có", HttpStatus.CONFLICT),
    DEPOSIT_TRANSACTION_REFERENCE_REQUIRED(
            1114, "Giao dịch đặt cọc yêu cầu lý do/tham chiếu", HttpStatus.BAD_REQUEST),
    DEPOSIT_TRANSACTION_INSUFFICIENT_BALANCE(
            1115, "Số dư tiền đặt cọc không đủ cho giao dịch này", HttpStatus.BAD_REQUEST),

    PAYMENT_NOT_FOUND(1106, "Không tìm thấy thanh toán", HttpStatus.NOT_FOUND),
    PAYMENT_ALREADY_EXISTS(1107, "Thanh toán đã tồn tại", HttpStatus.CONFLICT),
    PAYMENT_INVALID_STATE(1108, "Trạng thái thanh toán không hợp lệ cho thao tác này", HttpStatus.BAD_REQUEST),
    PAYMENT_ALLOCATION_INVALID(1109, "Phân bổ thanh toán không hợp lệ", HttpStatus.BAD_REQUEST),

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
