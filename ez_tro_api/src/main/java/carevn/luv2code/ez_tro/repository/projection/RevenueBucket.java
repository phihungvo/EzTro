package carevn.luv2code.ez_tro.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface RevenueBucket {
    LocalDate getBucketDate();

    BigDecimal getTotalAmount();
}
