package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DefaultPlanConfigResponse {
    String key;
    String value;
    Integer planId;
    String planCode;
    String planName;
    Boolean planActive;
    LocalDateTime updatedAt;
}
