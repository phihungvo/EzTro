package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomUtilityRequest {

    @NotNull(message = "ID phòng bắt buộc")
    Integer roomId;

    @NotNull(message = "ID tiện ích bắt buộc")
    Integer utilityId;

    @Min(value = 1, message = "Số lượng phải >= 1")
    @NotNull
    Integer quantity = 1;

    @Min(value = 0, message = "Lượng sử dụng phải >= 0")
    BigDecimal usageAmount;

    @NotNull(message = "Ngày bắt đầu bắt buộc")
    LocalDate startDate;

    LocalDate endDate;

    String note;
}
