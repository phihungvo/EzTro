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

/**
 * REST Controller cho các luồng xác thực (authentication) của hệ thống.
 *
 * <p>Lớp này ủy quyền phần lớn nghiệp vụ cho {@link AuthService}. Riêng luồng logout sẽ
 * đưa JWT vào blacklist thông qua {@link TokenBlacklist} để chặn các request về sau.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklist tokenBlacklist;
    private final JwtService jwtService;

    /**
     * Đăng nhập bằng username/password.
     *
     * @param request payload đăng nhập
     * @return response chứa thông tin đăng nhập (ví dụ: access token, refresh token...)
     */
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .result(response)
                .build();
    }

    /**
     * Đăng ký tài khoản mới.
     *
     * @param request payload đăng ký
     * @return response chứa thông tin tài khoản sau khi đăng ký
     */
    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Register successful")
                .result(response)
                .build();
    }

    /**
     * Đăng nhập bằng Google.
     *
     * @param request payload chứa thông tin đăng nhập từ Google
     * @return response chứa thông tin đăng nhập
     */
    @PostMapping("/google")
    public ApiResponse<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request);
        return ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Login successful")
                .result(response)
                .build();
    }

    /**
     * Đăng xuất người dùng bằng cách blacklist JWT và clear {@code SecurityContext}.
     *
     * <p>Nếu token không được cung cấp hoặc đã hết hạn, API trả về lỗi 400.
     *
     * @param request payload chứa JWT cần logout
     * @return response logout
     */
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
