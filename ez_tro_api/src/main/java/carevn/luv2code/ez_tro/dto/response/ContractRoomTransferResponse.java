package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRoomTransferResponse {
    Integer sourceContractId;
    String sourceContractCode;
    Integer targetContractId;
    String targetContractCode;
    Integer targetRoomId;
    String targetRoomNumber;
    BigDecimal transferredDepositAmount;
}
