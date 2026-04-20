package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillRequest {

    private String billTitle;

    @NotNull(message = "Contract ID không được để trống")
    private Integer contractId;

    private BigDecimal serviceAmount;
    private BigDecimal extraAmount;
    private BigDecimal discountAmount;
    private String discountReason;
    private String publicNote;
    private String internalNote;
    private String paymentInstructions;

    private String note;

    @NotNull(message = "Due date không được để trống")
    private LocalDate dueDate;
}
