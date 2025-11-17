package carevn.luv2code.ez_tro.util;

import java.time.LocalDate;

public class DateUtils {
    public static LocalDate calculateDueDateFromContract(int paymentDay) {
        LocalDate today = LocalDate.now();
        LocalDate dueDate = LocalDate.of(today.getYear(), today.getMonth(), paymentDay);

        // Nếu ngày đến hạn đã qua → sang tháng sau
        if (dueDate.isBefore(today)) {
            dueDate = dueDate.plusMonths(1);
        }
        return dueDate;
    }
}
