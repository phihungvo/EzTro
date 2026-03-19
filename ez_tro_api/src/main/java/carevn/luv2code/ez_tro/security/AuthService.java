package carevn.luv2code.ez_tro.security;

import java.util.Date;
import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.AuthRequest;
import carevn.luv2code.ez_tro.dto.requests.GoogleLoginRequest;
import carevn.luv2code.ez_tro.dto.requests.RegisterRequest;
import carevn.luv2code.ez_tro.dto.response.AuthResponse;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.PermissionRepository;
import carevn.luv2code.ez_tro.repository.RoleRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.SystemConfigService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SystemConfigService systemConfigService;

    @org.springframework.beans.factory.annotation.Value("${google.client-id:}")
    private String googleClientId;

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();
        String jwt = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUserName(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = new User();
        user.setUserName(request.getUsername());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setOriginalPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setCreateAt(new Date());
        user.setEnabled(true);

        // Gán vai trò mặc định
        Role userRole = roleRepository.findByName("USER").orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        user.setRoles(Set.of(userRole));

        User savedUser = userRepository.save(user);
        systemConfigService.ensureDefaultSubscriptionForOwner(savedUser);
        String jwt = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(jwt)
                .username(savedUser.getUsername())
                .roles(savedUser.getRoles().stream().map(Role::getName).toList())
                .build();
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        GoogleTokenInfo info = GoogleTokenInfo.fetchAndValidate(request.getIdToken(), googleClientId);

        if (!info.emailVerified()) {
            throw new AppException(ErrorCode.GOOGLE_EMAIL_NOT_VERIFIED);
        }

        User user = userRepository.findByEmail(info.email()).orElseGet(() -> createUserFromGoogle(info));

        String jwt = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .build();
    }

    private User createUserFromGoogle(GoogleTokenInfo info) {
        Role userRole =
                roleRepository.findByName("OWNER").orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        String baseUsername = deriveUsernameFromEmail(info.email());
        String username = baseUsername;
        int suffix = 0;
        while (userRepository.existsByUserName(username)) {
            suffix++;
            username = baseUsername + suffix;
            if (suffix > 9999) {
                username = baseUsername + "-" + System.currentTimeMillis();
                break;
            }
        }

        String randomPassword = java.util.UUID.randomUUID().toString();
        User user = new User();
        user.setUserName(username);
        user.setEmail(info.email());
        user.setFullName(info.name());
        user.setPassword(passwordEncoder.encode(randomPassword));
        user.setOriginalPassword(null);
        user.setCreateAt(new Date());
        user.setEnabled(true);
        user.setRoles(Set.of(userRole));

        User savedUser = userRepository.save(user);
        systemConfigService.ensureDefaultSubscriptionForOwner(savedUser);
        return savedUser;
    }

    private String deriveUsernameFromEmail(String email) {
        String local = email == null ? "user" : email.split("@", 2)[0];
        String cleaned = local.toLowerCase(java.util.Locale.ROOT).replaceAll("[^a-z0-9_\\.]", "_");
        cleaned = cleaned.replaceAll("_+", "_");
        if (cleaned.isBlank()) {
            return "user";
        }
        return cleaned;
    }

    private record GoogleTokenInfo(String email, boolean emailVerified, String name) {
        private static final java.net.http.HttpClient HTTP = java.net.http.HttpClient.newBuilder()
                .followRedirects(java.net.http.HttpClient.Redirect.NORMAL)
                .build();

        static GoogleTokenInfo fetchAndValidate(String idToken, String expectedAud) {
            if (idToken == null || idToken.isBlank()) {
                throw new AppException(ErrorCode.GOOGLE_ID_TOKEN_INVALID);
            }
            if (expectedAud == null || expectedAud.isBlank()) {
                // Misconfiguration should not leak details; treat as invalid in runtime
                throw new AppException(ErrorCode.GOOGLE_ID_TOKEN_INVALID);
            }

            try {
                String url = "https://oauth2.googleapis.com/tokeninfo?id_token="
                        + java.net.URLEncoder.encode(idToken, java.nio.charset.StandardCharsets.UTF_8);
                java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(url))
                        .timeout(java.time.Duration.ofSeconds(10))
                        .GET()
                        .build();
                java.net.http.HttpResponse<String> res =
                        HTTP.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
                if (res.statusCode() != 200) {
                    throw new AppException(ErrorCode.GOOGLE_ID_TOKEN_INVALID);
                }

                com.fasterxml.jackson.databind.JsonNode node =
                        new com.fasterxml.jackson.databind.ObjectMapper().readTree(res.body());
                String aud = node.path("aud").asText(null);
                if (!expectedAud.equals(aud)) {
                    throw new AppException(ErrorCode.GOOGLE_ID_TOKEN_INVALID);
                }

                String email = node.path("email").asText(null);
                boolean emailVerified =
                        "true".equalsIgnoreCase(node.path("email_verified").asText("false"))
                                || node.path("email_verified").asBoolean(false);
                String name = node.path("name").asText("");
                if (email == null || email.isBlank()) {
                    throw new AppException(ErrorCode.GOOGLE_ID_TOKEN_INVALID);
                }

                long exp = node.path("exp").asLong(0);
                long now = java.time.Instant.now().getEpochSecond();
                if (exp > 0 && exp < now) {
                    throw new AppException(ErrorCode.GOOGLE_ID_TOKEN_INVALID);
                }

                return new GoogleTokenInfo(email, emailVerified, name);
            } catch (AppException e) {
                throw e;
            } catch (Exception e) {
                throw new AppException(ErrorCode.GOOGLE_ID_TOKEN_INVALID);
            }
        }
    }
}
