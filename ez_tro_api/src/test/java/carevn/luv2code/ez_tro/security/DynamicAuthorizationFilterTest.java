package carevn.luv2code.ez_tro.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;

import carevn.luv2code.ez_tro.entity.Permission;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.HttpMethod;
import carevn.luv2code.ez_tro.service.admin.PermissionService;
import jakarta.servlet.FilterChain;

@ExtendWith(MockitoExtension.class)
class DynamicAuthorizationFilterTest {

    @Mock
    private PermissionService permissionService;

    @Mock
    private FilterChain filterChain;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAllowWhenPermissionUsesOnlyResourcePattern() throws Exception {
        DynamicAuthorizationFilter filter = new DynamicAuthorizationFilter(permissionService, new ObjectMapper());
        authenticate("owner1");

        Permission permission = Permission.builder()
                .resourcePattern("/api/payments")
                .httpMethod(HttpMethod.GET)
                .build();
        when(permissionService.getUserPermissions("owner1")).thenReturn(List.of(permission));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/payments");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void shouldAllowSubPathWhenPermissionIsBaseResourcePath() throws Exception {
        DynamicAuthorizationFilter filter = new DynamicAuthorizationFilter(permissionService, new ObjectMapper());
        authenticate("owner2");

        Permission permission = Permission.builder()
                .resourcePattern("/api/payments")
                .httpMethod(HttpMethod.POST)
                .build();
        when(permissionService.getUserPermissions("owner2")).thenReturn(List.of(permission));

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/payments/123/allocate");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void shouldDenyWhenNoPermissionMatches() throws Exception {
        DynamicAuthorizationFilter filter = new DynamicAuthorizationFilter(permissionService, new ObjectMapper());
        authenticate("owner3");

        Permission permission = Permission.builder()
                .resourcePattern("/api/bills")
                .httpMethod(HttpMethod.GET)
                .build();
        when(permissionService.getUserPermissions("owner3")).thenReturn(List.of(permission));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/payments");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        assertEquals(403, response.getStatus());
    }

    private void authenticate(String username) {
        Role role = Role.builder().name("OWNER").build();
        User user = User.builder().userName(username).roles(Set.of(role)).build();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
