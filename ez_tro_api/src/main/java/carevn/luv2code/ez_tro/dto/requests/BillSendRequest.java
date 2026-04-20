package carevn.luv2code.ez_tro.dto.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillSendRequest {
    @Builder.Default
    private Boolean sendInApp = true;

    @Builder.Default
    private Boolean sendEmail = false;

    @Builder.Default
    private Boolean sendSms = false;

    @Builder.Default
    private Boolean sendZalo = false;

    @Builder.Default
    private Boolean resend = false;
}
