package carevn.luv2code.ez_tro.constants;

import java.util.regex.Pattern;

public final class AppConstants {
    public static final Pattern PERIOD_PATTERN = Pattern.compile("\\d{4}-\\d{2}");
    public static final String DATE_FORMAT = "yyyy-MM-dd";

    public static final String CODE_TIMESTAMP_FORMAT = "yyyyMMddHHmmss";

    public static final String CONTRACT_CODE_PREFIX = "HD-";
    public static final String BILL_CODE_PREFIX = "BL-";

    public static final int DEFAULT_ROOM_START_NUMBER = 101;

    private AppConstants() {
        // Ngăn khởi tạo
    }
}
