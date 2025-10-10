package carevn.luv2code.ez_tro.dto.requests;

import carevn.luv2code.ez_tro.enums.HttpMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePermissionRequest {
    @NotBlank(message = "Permission name is required")
    private String name;

    private String description;

    @NotBlank(message = "API endpoint is required")
    private String apiEndpoint;

    @NotNull(message = "HTTP method is required")
    private HttpMethod httpMethod;

    private String resourcePattern;
}
