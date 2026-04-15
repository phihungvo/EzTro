package carevn.luv2code.ez_tro.configuration;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

@Configuration
public class MailTemplateConfig {

    @Bean
    public ClassLoaderTemplateResolver mailTemplateResolver() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("mail-templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode("HTML");
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(true);
        resolver.setOrder(10);
        return resolver;
    }

    @Bean
    public SpringTemplateEngine templateEngine(
            @Qualifier("mailTemplateResolver") ClassLoaderTemplateResolver mailTemplateResolver,
            @Qualifier("documentTemplateResolver") ClassLoaderTemplateResolver documentTemplateResolver) {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.addTemplateResolver(mailTemplateResolver);
        engine.addTemplateResolver(documentTemplateResolver);
        return engine;
    }
}
