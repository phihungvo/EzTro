package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.BillDeliveryStatus;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponse {
    Integer id;

    String billTitle;

    String billCode;

    Integer roomId;

    String roomNumber;

    Integer tenantId;

    String tenantName;

    InvoiceType invoiceType;

    LocalDate billingPeriodStart;

    LocalDate billingPeriodEnd;

    BigDecimal amount;

    BigDecimal allocatedAmount;

    BigDecimal outstandingAmount;

    Date paymentDate;

    LocalDate dueDate;

    BillStatus status;

    BillLifecycleStatus lifecycleStatus;

    BillDeliveryStatus deliveryStatus;

    Integer contractId;

    String publicNote;

    String paymentInstructions;

    Date issuedAt;

    Date sentAt;

    Date createdAt;

    Date updatedAt;
}
