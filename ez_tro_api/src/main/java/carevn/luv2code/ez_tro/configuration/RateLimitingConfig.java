package carevn.luv2code.ez_tro.configuration;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

@Configuration
public class RateLimitingConfig {

    @Bean
    public Bucket apiRateLimiter() {
        Bandwidth limit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1))); // 100 requests per minute
        return Bucket.builder().addLimit(limit).build();
    }
}
