package carevn.luv2code.ez_tro.configuration;

import java.util.Date;
import java.util.Set;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.repository.RoleRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    UserRepository userRepository;
    RoleRepository roleRepository;

    @Bean
    ApplicationRunner applicationRunner() {
        return args -> {
            String adminEmail = "admin@example.com";

            Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
                Role role = Role.builder()
                        .name("ADMIN")
                        .description("Administrator role with full access")
                        .build();
                return roleRepository.save(role);
            });

            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User user = User.builder()
                        .userName("admin1")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("admin_example"))
                        .createAt(new Date())
                        .roles(Set.of(adminRole))
                        .enabled(true)
                        .accountNonExpired(true)
                        .credentialsNonExpired(true)
                        .accountNonLocked(true)
                        .build();

                userRepository.save(user);
                log.warn(
                        "Admin user created with email: {} and password: admin_example (please change it!)",
                        adminEmail);
            }
        };
    }
}
