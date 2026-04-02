package carevn.luv2code.ez_tro.mapper;

import java.math.BigDecimal;
import java.util.Date;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;

@Mapper(componentModel = "spring")
public abstract class BillMapper {

    @Autowired
    protected InvoiceBalanceCalculator invoiceBalanceCalculator;

    @Mapping(source = "contract.id", target = "contractId")
    @Mapping(source = "room.id", target = "roomId")
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    @Mapping(source = "tenant.id", target = "tenantId")
    @Mapping(target = "tenantName", expression = "java(resolveTenantName(bill))")
    @Mapping(target = "allocatedAmount", expression = "java(resolveAllocatedAmount(bill))")
    @Mapping(target = "outstandingAmount", expression = "java(resolveOutstandingAmount(bill))")
    @Mapping(target = "lifecycleStatus", expression = "java(resolveLifecycleStatus(bill))")
    @Mapping(target = "issuedAt", expression = "java(resolveIssuedAt(bill))")
    public abstract BillResponse toResponse(Bill bill);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Bill toEntity(BillRequest request);

    protected String resolveTenantName(Bill bill) {
        if (bill == null || bill.getTenant() == null || bill.getTenant().getUser() == null) {
            return null;
        }
        User user = bill.getTenant().getUser();
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }
        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "")
                        + " "
                        + (user.getLastName() != null ? user.getLastName() : ""))
                .trim();
        return fullName.isBlank() ? user.getUsername() : fullName;
    }

    protected BigDecimal resolveAllocatedAmount(Bill bill) {
        InvoiceBalanceResponse balance = resolveBalance(bill);
        return balance != null ? balance.getAllocatedAmount() : BigDecimal.ZERO;
    }

    protected BigDecimal resolveOutstandingAmount(Bill bill) {
        InvoiceBalanceResponse balance = resolveBalance(bill);
        return balance != null ? balance.getOutstandingAmount() : BigDecimal.ZERO;
    }

    protected BillLifecycleStatus resolveLifecycleStatus(Bill bill) {
        if (bill == null) {
            return null;
        }
        if (bill.getLifecycleStatus() != null) {
            return bill.getLifecycleStatus();
        }
        if (bill.getStatus() == BillStatus.CANCELLED) {
            return BillLifecycleStatus.CANCELLED;
        }
        if (bill.getSentAt() != null) {
            return BillLifecycleStatus.SENT;
        }
        return bill.getId() != null || bill.getCreatedAt() != null ? BillLifecycleStatus.ISSUED : null;
    }

    protected Date resolveIssuedAt(Bill bill) {
        if (bill == null) {
            return null;
        }
        if (bill.getIssuedAt() != null) {
            return bill.getIssuedAt();
        }
        return resolveLifecycleStatus(bill) == null ? null : bill.getCreatedAt();
    }

    private InvoiceBalanceResponse resolveBalance(Bill bill) {
        if (bill == null || bill.getId() == null) {
            return null;
        }
        return invoiceBalanceCalculator.calculate(bill);
    }
}
