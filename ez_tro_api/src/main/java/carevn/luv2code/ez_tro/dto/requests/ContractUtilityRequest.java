package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractUtilityRequest {
    Integer utilityId;

    @NotBlank(message = "Utility name is required")
    String name;

    @NotBlank(message = "Utility type is required")
    String type;

    @NotNull(message = "Utility unit price is required")
    BigDecimal unitPrice;

    String unit;

    @Min(value = 1, message = "Utility quantity must be >= 1")
    Integer quantity = 1;

    BigDecimal usageAmount;

    String note;
}
