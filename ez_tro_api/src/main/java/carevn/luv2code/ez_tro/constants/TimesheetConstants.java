package carevn.luv2code.ez_tro.constants;

import java.util.regex.Pattern;

public final class TimesheetConstants {
    public static final double STANDARD_HOURS_PER_DAY = 8.0;
    public static final double OVERTIME_RATE = 1.5;
    public static final double STANDARD_HOURS_PER_MONTH = 160.0;
    public static final Pattern PERIOD_PATTERN = Pattern.compile("\\d{4}-\\d{2}");

    private TimesheetConstants() {
        // Prevent instantiation
    }
}
