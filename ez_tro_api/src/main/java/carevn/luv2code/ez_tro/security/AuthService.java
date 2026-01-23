package carevn.luv2code.ez_tro.security;

import java.util.Date;
import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.AuthRequest;
import carevn.luv2code.ez_tro.dto.requests.RegisterRequest;
import carevn.luv2code.ez_tro.dto.response.AuthResponse;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.PermissionRepository;
import carevn.luv2code.ez_tro.repository.RoleRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
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
        String jwt = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(jwt)
                .username(savedUser.getUsername())
                .roles(savedUser.getRoles().stream().map(Role::getName).toList())
                .build();
    }
}
