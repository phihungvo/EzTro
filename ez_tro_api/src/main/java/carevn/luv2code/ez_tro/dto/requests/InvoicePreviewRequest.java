package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import carevn.luv2code.ez_tro.enums.InvoiceType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoicePreviewRequest {

    @NotNull(message = "Contract ID không được để trống")
    Integer contractId;

    LocalDate asOfDate;

    LocalDate billingPeriodStart;

    LocalDate billingPeriodEnd;

    LocalDate dueDate;

    InvoiceType invoiceType;

    List<InvoiceServiceRequest> fixedServices;

    BigDecimal extraAmount;

    BigDecimal discountAmount;

    String discountReason;

    String publicNote;

    String internalNote;

    String paymentInstructions;
}
