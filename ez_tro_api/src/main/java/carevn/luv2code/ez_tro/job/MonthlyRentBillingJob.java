package carevn.luv2code.ez_tro.job;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.service.admin.BillService;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.util.DateUtils;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MonthlyRentBillingJob {

    private final ContractRepository contractRepository;
    private final BillService billService;
    private final ContractSnapshotService contractSnapshotService;

    @Scheduled(cron = "0 0 1 * * ?") // 1h sáng ngày 1 hàng tháng
    public void generateRentBills() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        List<Contract> activeContracts = contractRepository.findActiveContractsForBilling(startOfMonth, endOfMonth);

        for (Contract contract : activeContracts) {
            ContractSnapshotResponse snapshot = contractSnapshotService.getSnapshot(contract.getId(), today);
            BillRequest billRequest = new BillRequest();
            billRequest.setContractId(contract.getId());
            billRequest.setServiceAmount(BigDecimal.ZERO);
            billRequest.setBillTitle("Tiền phòng tháng " + today.getMonthValue() + "/" + today.getYear());

            Integer monthlyPaymentDay = snapshot.getCurrentVersion() != null
                    ? snapshot.getCurrentVersion().getMonthlyPaymentDay()
                    : contract.getMonthlyPaymentDay();
            billRequest.setDueDate(DateUtils.calculateDueDateFromContract(monthlyPaymentDay));

            billService.create(billRequest);
        }
    }
}
