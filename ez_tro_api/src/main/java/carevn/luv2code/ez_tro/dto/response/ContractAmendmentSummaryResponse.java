package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDate;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.ContractAmendmentType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractAmendmentSummaryResponse {
    Integer id;
    ContractAmendmentType amendmentType;
    LocalDate effectiveFrom;
    LocalDate effectiveTo;
    String dataJson;
    String note;
    Integer createdBy;
    Date createdAt;
}
