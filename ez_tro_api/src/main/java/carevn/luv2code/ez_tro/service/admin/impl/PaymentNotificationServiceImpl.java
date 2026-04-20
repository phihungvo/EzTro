package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.PaymentAllocation;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.service.admin.PaymentNotificationService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentNotificationServiceImpl implements PaymentNotificationService {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final Gson gson = new Gson();

    @Override
    public void notifyTenantSubmitted(Payment payment) {
        if (payment == null || payment.getId() == null) {
            return;
        }

        User owner = resolveOwner(payment);
        List<Integer> adminIds = userRepository.findAllAdmins().stream()
                .map(User::getId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<String, Object> metadata = parseMetadata(payment);
        boolean hasProof = metadataInteger(metadata, "proofFileId") != null;
        String billCode = metadataString(metadata, "billCode");
        String roomLabel = resolveRoomLabel(payment);
        String title = hasProof ? "Có chứng từ thanh toán mới" : "Có xác nhận thanh toán mới";
        String message = "Tenant "
                + coalesce(resolveTenantName(payment), "không rõ tenant")
                + " vừa gửi xác nhận thanh toán"
                + (billCode != null ? " cho hóa đơn " + billCode : "")
                + (roomLabel != null ? " (" + roomLabel + ")" : "")
                + "."
                + (hasProof ? " Có đính kèm chứng từ để đối soát." : "");

        Map<String, Object> extra = new LinkedHashMap<>();
        extra.put("source", "TENANT_SUBMITTED");
        Map<String, Object> ownerExtra = new LinkedHashMap<>(extra);
        ownerExtra.put("dedupeKey", "owner-payment-submitted-" + payment.getId());

        if (owner != null && owner.getId() != null) {
            notificationService.sendToUser(
                    owner.getId(), title, message, "OWNER_PAYMENT_SUBMITTED", buildPayload(payment, ownerExtra));
        }

        if (!adminIds.isEmpty()) {
            notificationService.sendToUsers(
                    new ArrayList<>(adminIds),
                    title,
                    message,
                    "PAYMENT_SUBMITTED_BY_TENANT",
                    buildPayload(payment, extra));
        }
    }

    @Override
    public void notifyBackofficePaymentReceived(Payment payment) {
        User tenantUser = resolveTenantUser(payment);
        if (tenantUser == null || tenantUser.getId() == null) {
            return;
        }

        String message = "Ban quản lý đã ghi nhận khoản thanh toán"
                + " " + formatPaymentReference(payment)
                + (resolveRoomLabel(payment) != null ? " cho " + resolveRoomLabel(payment) : "")
                + ". Khoản thanh toán đang chờ xác nhận.";

        Map<String, Object> extra = new LinkedHashMap<>();
        extra.put("source", "BACKOFFICE_RECEIVE");
        notificationService.sendToUser(
                tenantUser.getId(),
                "Đã ghi nhận khoản thanh toán",
                message,
                "PAYMENT_RECEIVED_BY_BACKOFFICE",
                buildPayload(payment, extra));
    }

    @Override
    public void notifyPaymentConfirmed(Payment payment) {
        if (payment == null || payment.getId() == null) {
            return;
        }

        User tenantUser = resolveTenantUser(payment);
        if (tenantUser != null && tenantUser.getId() != null) {
            String message = "Khoản thanh toán "
                    + formatPaymentReference(payment)
                    + " đã được xác nhận"
                    + (resolveSubmittedBillCode(payment) != null
                            ? " cho hóa đơn " + resolveSubmittedBillCode(payment)
                            : "")
                    + ".";
            Map<String, Object> extra = new LinkedHashMap<>();
            extra.put("source", "PAYMENT_CONFIRM");
            notificationService.sendToUser(
                    tenantUser.getId(),
                    "Thanh toán đã được xác nhận",
                    message,
                    "PAYMENT_CONFIRMED",
                    buildPayload(payment, extra));
        }

        User actor = SecurityUtils.getCurrentUser();
        User owner = resolveOwner(payment);
        if (actor != null
                && isAdmin(actor)
                && owner != null
                && owner.getId() != null
                && !owner.getId().equals(actor.getId())) {
            String message = "Admin đã xác nhận khoản thanh toán "
                    + formatPaymentReference(payment)
                    + " của tenant "
                    + coalesce(resolveTenantName(payment), "không rõ tenant")
                    + ".";
            Map<String, Object> extra = new LinkedHashMap<>();
            extra.put("source", "ADMIN_CONFIRM");
            notificationService.sendToUser(
                    owner.getId(),
                    "Admin đã xác nhận thanh toán",
                    message,
                    "OWNER_PAYMENT_CONFIRMED",
                    buildPayload(payment, extra));
        }
    }

    @Override
    public void notifyPaymentAllocated(Payment payment, List<PaymentAllocation> allocations, boolean autoAllocation) {
        User tenantUser = resolveTenantUser(payment);
        if (tenantUser == null || tenantUser.getId() == null || allocations == null || allocations.isEmpty()) {
            return;
        }

        List<Bill> affectedBills = allocations.stream()
                .map(PaymentAllocation::getBill)
                .filter(bill -> bill != null && bill.getId() != null)
                .distinct()
                .toList();
        if (affectedBills.isEmpty()) {
            return;
        }

        String billSummary = affectedBills.size() == 1
                ? "hóa đơn "
                        + coalesce(
                                affectedBills.getFirst().getBillCode(),
                                "#" + affectedBills.getFirst().getId())
                : affectedBills.size() + " hóa đơn";
        String title =
                payment.getStatus() == PaymentStatus.FULLY_ALLOCATED || payment.getStatus() == PaymentStatus.OVERPAID
                        ? "Thanh toán đã được đối soát"
                        : "Thanh toán đã được phân bổ";
        String message = "Khoản thanh toán "
                + formatPaymentReference(payment)
                + " đã được "
                + (autoAllocation ? "tự động " : "")
                + "phân bổ vào "
                + billSummary
                + ".";

        Map<String, Object> extra = new LinkedHashMap<>();
        extra.put("source", "PAYMENT_ALLOCATE");
        extra.put("allocationMode", autoAllocation ? "AUTO" : "MANUAL");
        extra.put("billIds", affectedBills.stream().map(Bill::getId).toList());
        extra.put("billId", affectedBills.getFirst().getId());
        notificationService.sendToUser(
                tenantUser.getId(), title, message, "PAYMENT_ALLOCATED", buildPayload(payment, extra));
    }

    @Override
    public void notifyPaymentReversed(Payment payment, String note) {
        if (payment == null || payment.getId() == null) {
            return;
        }

        User tenantUser = resolveTenantUser(payment);
        if (tenantUser != null && tenantUser.getId() != null) {
            StringBuilder message = new StringBuilder("Khoản thanh toán ")
                    .append(formatPaymentReference(payment))
                    .append(" đã bị hoàn tác hoặc từ chối đối soát.");
            String normalizedNote = trimToNull(note);
            if (normalizedNote != null) {
                message.append(" Lý do: ").append(normalizedNote).append(".");
            }

            Map<String, Object> extra = new LinkedHashMap<>();
            extra.put("source", "PAYMENT_REVERSE");
            extra.put("reverseNote", normalizedNote);
            notificationService.sendToUser(
                    tenantUser.getId(),
                    "Thanh toán đã bị hoàn tác",
                    message.toString(),
                    "PAYMENT_REVERSED",
                    buildPayload(payment, extra));
        }

        User actor = SecurityUtils.getCurrentUser();
        User owner = resolveOwner(payment);
        if (actor != null
                && isAdmin(actor)
                && owner != null
                && owner.getId() != null
                && !owner.getId().equals(actor.getId())) {
            String message = "Admin đã hoàn tác khoản thanh toán "
                    + formatPaymentReference(payment)
                    + " của tenant "
                    + coalesce(resolveTenantName(payment), "không rõ tenant")
                    + ".";
            Map<String, Object> extra = new LinkedHashMap<>();
            extra.put("source", "ADMIN_REVERSE");
            extra.put("reverseNote", trimToNull(note));
            notificationService.sendToUser(
                    owner.getId(),
                    "Admin đã hoàn tác thanh toán",
                    message,
                    "OWNER_PAYMENT_REVERSED",
                    buildPayload(payment, extra));
        }
    }

    private Map<String, Object> buildPayload(Payment payment, Map<String, Object> extra) {
        Map<String, Object> metadata = parseMetadata(payment);
        List<PaymentAllocation> persistedAllocations =
                paymentAllocationRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId());
        List<Integer> allocatedBillIds = persistedAllocations.stream()
                .map(PaymentAllocation::getBill)
                .filter(bill -> bill != null && bill.getId() != null)
                .map(Bill::getId)
                .distinct()
                .toList();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("paymentId", payment.getId());
        payload.put(
                "contractId",
                payment.getContract() != null ? payment.getContract().getId() : null);
        payload.put(
                "tenantId", payment.getTenant() != null ? payment.getTenant().getId() : null);
        payload.put(
                "roomId",
                payment.getContract() != null && payment.getContract().getRoom() != null
                        ? payment.getContract().getRoom().getId()
                        : null);
        payload.put("roomNumber", resolveRoomNumber(payment));
        payload.put(
                "paymentStatus",
                payment.getStatus() != null ? payment.getStatus().name() : null);
        payload.put(
                "paymentSource",
                payment.getSource() != null ? payment.getSource().name() : null);
        payload.put("amount", payment.getAmount());
        payload.put("currency", payment.getCurrency());
        payload.put("externalReference", payment.getExternalReference());
        payload.put("billId", metadataInteger(metadata, "billId"));
        payload.put("billCode", metadataString(metadata, "billCode"));
        payload.put("paymentMethod", metadataString(metadata, "paymentMethod"));
        payload.put("proofFileId", metadataInteger(metadata, "proofFileId"));
        payload.put("proofFileName", metadataString(metadata, "proofFileName"));
        payload.put("billIds", allocatedBillIds);
        if (extra != null) {
            payload.putAll(extra);
        }
        return payload;
    }

    private Map<String, Object> parseMetadata(Payment payment) {
        if (payment == null
                || payment.getMetadataJson() == null
                || payment.getMetadataJson().isBlank()) {
            return Map.of();
        }
        try {
            return gson.fromJson(payment.getMetadataJson(), new TypeToken<Map<String, Object>>() {}.getType());
        } catch (RuntimeException ex) {
            return Map.of();
        }
    }

    private String resolveSubmittedBillCode(Payment payment) {
        return metadataString(parseMetadata(payment), "billCode");
    }

    private String resolveTenantName(Payment payment) {
        if (payment == null
                || payment.getTenant() == null
                || payment.getTenant().getUser() == null) {
            return null;
        }
        User tenantUser = payment.getTenant().getUser();
        if (tenantUser.getFullName() != null && !tenantUser.getFullName().isBlank()) {
            return tenantUser.getFullName();
        }
        return trimToNull(((tenantUser.getFirstName() != null ? tenantUser.getFirstName() : "")
                        + " "
                        + (tenantUser.getLastName() != null ? tenantUser.getLastName() : ""))
                .trim());
    }

    private String resolveRoomNumber(Payment payment) {
        if (payment == null
                || payment.getContract() == null
                || payment.getContract().getRoom() == null) {
            return null;
        }
        return payment.getContract().getRoom().getRoomNumber();
    }

    private String resolveRoomLabel(Payment payment) {
        if (payment == null
                || payment.getContract() == null
                || payment.getContract().getRoom() == null) {
            return null;
        }
        String roomNumber = payment.getContract().getRoom().getRoomNumber();
        String buildingName = payment.getContract().getRoom().getBuilding() != null
                ? payment.getContract().getRoom().getBuilding().getName()
                : null;
        return buildingName != null ? roomNumber + " - " + buildingName : roomNumber;
    }

    private String formatPaymentReference(Payment payment) {
        if (payment == null || payment.getId() == null) {
            return "không rõ tham chiếu";
        }
        return "#" + payment.getId()
                + (payment.getExternalReference() != null
                                && !payment.getExternalReference().isBlank()
                        ? " (" + payment.getExternalReference() + ")"
                        : "");
    }

    private User resolveTenantUser(Payment payment) {
        if (payment == null || payment.getTenant() == null) {
            return null;
        }
        return payment.getTenant().getUser();
    }

    private User resolveOwner(Payment payment) {
        if (payment == null
                || payment.getContract() == null
                || payment.getContract().getRoom() == null
                || payment.getContract().getRoom().getBoardingHouse() == null) {
            return null;
        }
        return payment.getContract().getRoom().getBoardingHouse().getOwner();
    }

    private boolean isAdmin(User user) {
        return user != null
                && user.getRoles() != null
                && user.getRoles().stream()
                        .anyMatch(role -> role != null
                                && role.getName() != null
                                && "ADMIN".equals(role.getName().toUpperCase(Locale.ROOT)));
    }

    private Integer metadataInteger(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String stringValue && !stringValue.isBlank()) {
            try {
                return Integer.valueOf(stringValue);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private String metadataString(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        return value == null ? null : trimToNull(String.valueOf(value));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String coalesce(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
