package carevn.luv2code.ez_tro.configuration.seed;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Component
@ConfigurationProperties(prefix = "app.seed")
@Getter
@Setter
public class SeedProperties {

    private boolean enabled;
    private String rbacResource;
    private String subscriptionPlansResource;
    private String defaultPlanCode;
    private AdminSeedProperties admin = new AdminSeedProperties();

    @Getter
    @Setter
    public static class AdminSeedProperties {
        private String username;
        private String email;
        private String password;
        private String roleName;
    }
}
