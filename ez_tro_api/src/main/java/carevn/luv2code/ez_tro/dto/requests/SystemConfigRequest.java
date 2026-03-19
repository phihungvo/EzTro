package carevn.luv2code.ez_tro.dto.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SystemConfigRequest {
    @NotBlank(message = "Config key không được để trống")
    private String key;

    @NotBlank(message = "Config value không được để trống")
    private String value;

    private String description;
}
