package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.CreditLedgerEntryType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditLedgerEntryResponse {
    Integer id;
    Integer paymentId;
    Integer billId;
    CreditLedgerEntryType entryType;
    BigDecimal amount;
    String note;
    Date createdAt;
}
