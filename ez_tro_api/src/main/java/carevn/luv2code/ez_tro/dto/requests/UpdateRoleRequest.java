package carevn.luv2code.ez_tro.dto.requests;

import java.util.Set;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateRoleRequest {
    String name;

    String description;

    Set<Integer> permissionIds;
}
