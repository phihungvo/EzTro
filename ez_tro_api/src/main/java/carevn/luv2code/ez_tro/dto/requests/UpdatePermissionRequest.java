package carevn.luv2code.ez_tro.dto.requests;

import carevn.luv2code.ez_tro.enums.HttpMethod;
import lombok.Data;

@Data
public class UpdatePermissionRequest {
    private String description;
    private String apiEndpoint;
    private HttpMethod httpMethod;
    private String resourcePattern;
}
