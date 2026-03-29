package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingNotificationService {

    private final BillRepository billRepository;
    private final NotificationService notificationService;

    @Value("${app.billing.notification.reminder-days:3,1}")
    private String reminderDaysConfig;

    public void sendUpcomingDueReminders() {
        List<Integer> daysList = parseReminderDays();

        for (Integer day : daysList) {
            LocalDate targetDate = LocalDate.now().plusDays(day);
            List<Bill> bills = billRepository.findByStatusInAndDueDate(
                    List.of(BillStatus.UNPAID, BillStatus.PARTIALLY_PAID), targetDate);
            if (bills.isEmpty()) {
                continue;
            }
            log.info("Sending {} reminders for bills due in {} days ({}).", bills.size(), day, targetDate);
            bills.forEach(bill -> {
                try {
                    notificationService.sendBillReminder(bill.getId());
                    User owner = resolveOwner(bill);
                    if (owner != null) {
                        notificationService.sendToUser(
                                owner.getId(),
                                "Hóa đơn sắp đến hạn",
                                "Phòng " + bill.getRoom().getRoomNumber() + " - " + bill.getAmount()
                                        + "đ đến hạn vào ngày " + bill.getDueDate(),
                                "BILL_REMINDER_OWNER",
                                Map.of(
                                        "billId", bill.getId(),
                                        "tenantName",
                                                bill.getTenant() != null
                                                        ? bill.getTenant()
                                                                .getUser()
                                                                .getFullName()
                                                        : null,
                                        "outstanding", bill.getAmount()));
                    }
                } catch (Exception e) {
                    log.error("Failed to send reminder for bill {}: {}", bill.getId(), e.getMessage(), e);
                }
            });
        }
    }

    private List<Integer> parseReminderDays() {
        return Arrays.stream(reminderDaysConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(this::safeParseDay)
                .filter(day -> day != null && day >= 0)
                .collect(Collectors.toList());
    }

    private Integer safeParseDay(String value) {
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException ex) {
            log.warn("Invalid reminder day config '{}'", value);
            return null;
        }
    }

    private User resolveOwner(Bill bill) {
        if (bill == null
                || bill.getContract() == null
                || bill.getContract().getRoom() == null
                || bill.getContract().getRoom().getBoardingHouse() == null) {
            return null;
        }
        return bill.getRoom().getBoardingHouse().getOwner();
    }
}
