package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ContractNotificationService {

    private final ContractRepository contractRepository;
    private final NotificationService notificationService;

    @Value("${app.contracts.notification.expiring-days:7,3,1}")
    private String expiringDaysConfig;

    public int sendOwnerContractExpiringReminders() {
        List<Integer> daysList = parseDays(expiringDaysConfig);
        int sent = 0;

        for (Integer day : daysList) {
            LocalDate targetDate = LocalDate.now().plusDays(day);
            List<Contract> contracts = contractRepository.findByStatusAndEndDate(ContractStatus.ACTIVE, targetDate);
            for (Contract contract : contracts) {
                try {
                    User owner = resolveOwner(contract);
                    if (owner == null || owner.getId() == null) {
                        continue;
                    }
                    if (contract.getEndDate() == null) {
                        continue;
                    }

                    String roomNumber =
                            contract.getRoom() != null ? contract.getRoom().getRoomNumber() : null;
                    String tenantName =
                            contract.getTenant() != null && contract.getTenant().getUser() != null
                                    ? contract.getTenant().getUser().getFullName()
                                    : null;

                    String message = "Hợp đồng "
                            + (contract.getContractCode() != null
                                    ? contract.getContractCode()
                                    : ("#" + contract.getId()))
                            + (roomNumber != null ? " (phòng " + roomNumber + ")" : "")
                            + " sẽ hết hạn vào ngày " + contract.getEndDate() + ".";

                    Map<String, Object> payload = new LinkedHashMap<>();
                    payload.put("contractId", contract.getId());
                    payload.put("contractCode", contract.getContractCode());
                    payload.put("endDate", contract.getEndDate().toString());
                    payload.put(
                            "roomId",
                            contract.getRoom() != null ? contract.getRoom().getId() : null);
                    payload.put("roomNumber", roomNumber);
                    payload.put(
                            "tenantId",
                            contract.getTenant() != null ? contract.getTenant().getId() : null);
                    payload.put("tenantName", tenantName);
                    payload.put(
                            "dedupeKey", "owner-contract-expiring-" + contract.getId() + "-" + contract.getEndDate());

                    notificationService.sendToUser(
                            owner.getId(), "Hợp đồng sắp hết hạn", message, "OWNER_CONTRACT_EXPIRING", payload);
                    sent++;
                } catch (Exception ex) {
                    log.warn(
                            "Failed to send contract expiring reminder for contract {}: {}",
                            contract != null ? contract.getId() : null,
                            ex.getMessage());
                }
            }
        }

        return sent;
    }

    private User resolveOwner(Contract contract) {
        if (contract == null || contract.getRoom() == null || contract.getRoom().getBoardingHouse() == null) {
            return null;
        }
        return contract.getRoom().getBoardingHouse().getOwner();
    }

    private List<Integer> parseDays(String config) {
        if (config == null || config.isBlank()) {
            return List.of();
        }
        return Arrays.stream(config.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(this::safeParseDay)
                .filter(day -> day != null && day >= 0)
                .distinct()
                .toList();
    }

    private Integer safeParseDay(String value) {
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
