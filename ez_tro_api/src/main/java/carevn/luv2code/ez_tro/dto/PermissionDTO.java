package carevn.luv2code.ez_tro.dto;

import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.HttpMethod;
import lombok.Data;

@Data
public class PermissionDTO {
    private Integer id;
    private String name;
    private String description;
    private String apiEndpoint;
    private HttpMethod httpMethod;
    private String resourcePattern;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
