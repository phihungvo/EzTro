package carevn.luv2code.ez_tro.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // SPA routing: forward client-side routes to index.html, but never intercept backend endpoints
        // like `/api/**` (REST) or `/ws/**` (SockJS/WebSocket).
        registry.addViewController("/{path:(?!api$|ws$)[^\\.]+}").setViewName("forward:/index.html");
        registry.addViewController("/{path:(?!api$|ws$)[^\\.]+}/**").setViewName("forward:/index.html");
    }
}
