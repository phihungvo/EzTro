package carevn.luv2code.ez_tro.controller.admin;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.AuthRequest;
import carevn.luv2code.ez_tro.dto.requests.GoogleLoginRequest;
import carevn.luv2code.ez_tro.dto.requests.LogoutRequest;
import carevn.luv2code.ez_tro.dto.requests.RegisterRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.AuthResponse;
import carevn.luv2code.ez_tro.dto.response.LogoutResponse;
import carevn.luv2code.ez_tro.security.AuthService;
import carevn.luv2code.ez_tro.security.JwtService;
import carevn.luv2code.ez_tro.security.TokenBlacklist;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklist tokenBlacklist;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .result(response)
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Register successful")
                .result(response)
                .build();
    }

    @PostMapping("/google")
    public ApiResponse<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request);
        return ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .result(response)
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<LogoutResponse> logout(@Valid @RequestBody LogoutRequest request) {
        String jwt = request.getToken();
        if (jwt == null || jwt.trim().isEmpty()) {
            return ApiResponse.<LogoutResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Token không được cung cấp")
                    .result(null)
                    .build();
        }

        if (jwtService.isTokenExpired(jwt)) {
            return ApiResponse.<LogoutResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Token đã hết hạn")
                    .result(null)
                    .build();
        }

        tokenBlacklist.addToBlacklist(jwt);

        SecurityContextHolder.clearContext();

        LogoutResponse logoutResponse =
                LogoutResponse.builder().message("Đăng xuất thành công").build();

        return ApiResponse.<LogoutResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đăng xuất thành công")
                .result(logoutResponse)
                .build();
    }
}
