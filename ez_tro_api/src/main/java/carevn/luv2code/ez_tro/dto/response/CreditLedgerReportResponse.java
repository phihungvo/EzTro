package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditLedgerReportResponse {
    Integer contractId;
    BigDecimal currentBalance;
    List<CreditLedgerEntryResponse> entries;
}
