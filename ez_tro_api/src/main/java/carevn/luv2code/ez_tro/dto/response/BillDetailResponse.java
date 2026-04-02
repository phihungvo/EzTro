package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.BillDeliveryStatus;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.InvoicePaymentStatus;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillDetailResponse {
    Integer id;
    String billCode;
    String billTitle;
    Integer contractId;
    String contractCode;
    Integer roomId;
    String roomNumber;
    Integer roomMaxOccupants;
    Integer tenantId;
    String tenantName;
    String tenantPhone;
    String tenantEmail;
    String tenantIdentityNumber;
    String boardingHouseName;
    String boardingHouseAddress;
    String boardingHousePhone;
    String ownerName;
    String ownerPhone;
    String ownerEmail;
    String ownerAddress;
    String organizationName;
    InvoiceType invoiceType;
    LocalDate billingPeriodStart;
    LocalDate billingPeriodEnd;
    LocalDate dueDate;
    Date paymentDate;
    BigDecimal amount;
    BigDecimal serviceAmount;
    BigDecimal allocatedAmount;
    BigDecimal outstandingAmount;
    BigDecimal overpaidAmount;
    InvoicePaymentStatus paymentStatus;
    BillStatus status;
    BillLifecycleStatus lifecycleStatus;
    BillDeliveryStatus deliveryStatus;
    String publicNote;
    String internalNote;
    String paymentInstructions;
    String deliveryChannelsJson;
    Date issuedAt;
    Date sentAt;
    Date createdAt;
    Date updatedAt;
    List<BillLineDetailResponse> lines;
    List<BillAllocationDetailResponse> allocations;
    List<BillTimelineEventResponse> timeline;
    List<BillingOperationLogResponse> auditLogs;
}
