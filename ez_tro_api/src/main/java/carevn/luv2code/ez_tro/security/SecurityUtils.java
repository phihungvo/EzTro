package carevn.luv2code.ez_tro.security;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import carevn.luv2code.ez_tro.entity.User;

public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Lấy user hiện tại từ SecurityContext
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }

    /**
     * Lấy ID của user hiện tại (tiện cho service)
     */
    public static Integer getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    /**
     * Kiểm tra xem có user đang đăng nhập không
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    /**
     * Kiểm tra có role cụ thể không
     */
    public static boolean hasRole(String roleName) {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(auth -> auth.getAuthorities())
                .orElseThrow(() -> new IllegalStateException("No authentication found"))
                .stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + roleName));
    }

    /**
     * Kiểm tra là ADMIN
     */
    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Kiểm tra là OWNER
     */
    public static boolean isOwner() {
        return hasRole("OWNER");
    }

    /**
     * Lấy User hoặc throw exception (dùng trong service bắt buộc login)
     */
    public static User getCurrentUserOrThrow() {
        User user = getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("User không tồn tại. Vui lòng đăng nhập!");
        }
        return user;
    }

    /**
     * Lấy ID hoặc throw
     */
    public static Integer getCurrentUserIdOrThrow() {
        Integer id = getCurrentUserId();
        if (id == null) {
            throw new IllegalStateException("Không tìm thấy ID user!");
        }
        return id;
    }

    /**
     * Dùng trong Specification: tránh NPE
     */
    public static SpecificationSafeUser safeUser() {
        return new SpecificationSafeUser(getCurrentUser());
    }

    /**
     * Helper class để dùng trong Specification
     */
    public static class SpecificationSafeUser {
        private final User user;

        private SpecificationSafeUser(User user) {
            this.user = user;
        }

        public User get() {
            return user;
        }

        public Integer getId() {
            return user != null ? user.getId() : null;
        }

        public boolean isPresent() {
            return user != null;
        }

        public boolean isAdmin() {
            return user != null && user.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));
        }
    }
}
