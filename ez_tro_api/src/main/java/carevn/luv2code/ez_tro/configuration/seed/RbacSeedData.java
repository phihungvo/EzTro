package carevn.luv2code.ez_tro.configuration.seed;

import java.util.ArrayList;
import java.util.List;

import carevn.luv2code.ez_tro.enums.HttpMethod;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RbacSeedData {

    private List<RoleSeed> roles = new ArrayList<>();
    private List<PermissionSeed> permissions = new ArrayList<>();
    private List<RolePermissionSeed> rolePermissions = new ArrayList<>();

    @Getter
    @Setter
    public static class RoleSeed {
        private String name;
        private String description;
    }

    @Getter
    @Setter
    public static class PermissionSeed {
        private String key;
        private String name;
        private String description;
        private String apiEndpoint;
        private HttpMethod httpMethod;
        private String resourcePattern;
    }

    @Getter
    @Setter
    public static class RolePermissionSeed {
        private String roleName;
        private List<String> permissionKeys = new ArrayList<>();
    }
}
