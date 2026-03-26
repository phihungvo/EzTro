package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import carevn.luv2code.ez_tro.enums.InvoiceType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceFinalizeRequest {

    @NotNull(message = "Contract ID không được để trống")
    Integer contractId;

    LocalDate asOfDate;

    LocalDate billingPeriodStart;

    LocalDate billingPeriodEnd;

    LocalDate dueDate;

    InvoiceType invoiceType;

    BigDecimal extraAmount;

    BigDecimal discountAmount;

    String discountReason;

    String publicNote;

    String internalNote;
}
