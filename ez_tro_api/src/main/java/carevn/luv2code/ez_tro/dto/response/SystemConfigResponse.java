package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SystemConfigResponse {
    Integer id;
    String key;
    String value;
    String description;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
