package carevn.luv2code.ez_tro.constants;

import java.util.regex.Pattern;

public final class AppConstants {
    public static final Pattern PERIOD_PATTERN = Pattern.compile("\\d{4}-\\d{2}");

    private AppConstants() {
        // Ngăn khởi tạo
    }
}
