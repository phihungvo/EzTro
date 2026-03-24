package carevn.luv2code.ez_tro.dto.requests;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractTerminateRequest {
    @NotNull
    private LocalDate terminationDate;

    private String note;
}
