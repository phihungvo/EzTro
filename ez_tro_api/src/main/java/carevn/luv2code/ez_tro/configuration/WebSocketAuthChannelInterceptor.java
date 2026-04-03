package carevn.luv2code.ez_tro.configuration;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.security.JwtService;
import carevn.luv2code.ez_tro.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return message;
        }

        String token = authorization.substring(7);
        String username = jwtService.extractUsername(token);
        User user = (User) userDetailsService.loadUserByUsername(username);

        if (!jwtService.validateToken(token, user)) {
            return message;
        }

        accessor.setUser(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        return message;
    }
}
