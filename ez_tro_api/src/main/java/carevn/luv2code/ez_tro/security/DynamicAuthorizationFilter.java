package carevn.luv2code.ez_tro.security;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import carevn.luv2code.ez_tro.entity.Permission;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.HttpMethod;
import carevn.luv2code.ez_tro.service.admin.PermissionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DynamicAuthorizationFilter extends OncePerRequestFilter {

    private final PermissionService permissionService;
    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private final List<String> publicEndpoints = List.of(
            "/ws/**",
            "/api/auth/login",
            "/api/auth/google",
            "/api/auth/register",
            "/api/auth/logout",
            "/api/public/**",
            "/actuator/health",
            "/swagger-ui/**",
            "/v3/api-docs/**");

    /**
     * Lọc các request để kiểm tra quyền truy cập động dựa trên user và endpoint
     *
     * @param request
     * @param response
     * @param filterChain
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = normalizePath(request.getRequestURI());
        String requestMethod = request.getMethod();

        // Always allow preflight requests
        if ("OPTIONS".equalsIgnoreCase(requestMethod)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Bỏ qua các endpoint công khai
        if (isPublicEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Nếu chưa authenticated thì để Spring Security xử lý
        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authentication.getPrincipal().equals("anonymousUser")) {
            log.debug("Anonymous user, access denied");
            sendAccessDeniedResponse(response, "Anonymous access not allowed");
            return;
        }

        User user = (User) authentication.getPrincipal();

        // Kiểm tra quyền truy cập động
        if (!hasPermission(user, requestPath, requestMethod)) {
            //            sendAccessDeniedResponse(response, "Insufficient permissions");
            sendAccessDeniedResponse(response, "");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String requestPath) {
        return publicEndpoints.stream().anyMatch(pattern -> pathMatcher.match(pattern, requestPath));
    }

    /**
     * Kiểm tra xem user có quyền truy cập vào requestPath với requestMethod không
     *
     * @param user          người dùng hiện tại
     * @param requestPath   đường dẫn của request
     * @param requestMethod phương thức HTTP của request
     * @return true nếu có quyền, false nếu không
     */
    private boolean hasPermission(User user, String requestPath, String requestMethod) {
        try {
            HttpMethod httpMethod = HttpMethod.valueOf(requestMethod.toUpperCase());

            List<Permission> userPermissions = permissionService.getUserPermissions(user.getUsername());

            return userPermissions.stream()
                    .anyMatch(permission -> matchesPermission(permission, requestPath, httpMethod));

        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Kiểm tra xem permission có khớp với requestPath và httpMethod không
     *
     * @param permission  quyền cần kiểm tra
     * @param requestPath đường dẫn của request
     * @param httpMethod  phương thức HTTP của request
     */
    private boolean matchesPermission(Permission permission, String requestPath, HttpMethod httpMethod) {
        if (!permission.getHttpMethod().equals(httpMethod)) {
            return false;
        }

        return matchesPath(permission.getApiEndpoint(), requestPath)
                || matchesPath(permission.getResourcePattern(), requestPath);
    }

    private boolean matchesPath(String rawPattern, String requestPath) {
        if (rawPattern == null || rawPattern.isBlank()) {
            return false;
        }

        String pattern = normalizePath(rawPattern);

        if (pathMatcher.match(pattern, requestPath)) {
            return true;
        }

        // Cho phép permission theo resource gốc như /api/payments cover luôn subpath /api/payments/{id}.
        return requestPath.equals(pattern) || requestPath.startsWith(pattern + "/");
    }

    private String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            return "/";
        }
        if (path.length() > 1 && path.endsWith("/")) {
            return path.substring(0, path.length() - 1);
        }
        return path;
    }

    /**
     * Gửi phản hồi Access Denied dưới dạng JSON
     *
     * @param response
     * @param message
     * @throws IOException
     */
    private void sendAccessDeniedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Access Denied");
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
