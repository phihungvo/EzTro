package carevn.luv2code.ez_tro.configuration;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPassword;

    @Value("${spring.data.redis.ssl}")
    private boolean redisSsl;

    @Value("${spring.data.redis.cluster.enabled}")
    private boolean redisClusterEnabled;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        LettucePoolingClientConfiguration.LettucePoolingClientConfigurationBuilder builder =
                LettucePoolingClientConfiguration.builder()
                        .commandTimeout(Duration.ofMillis(2000))
                        .shutdownTimeout(Duration.ofMillis(100));

        if (redisSsl) {
            builder.useSsl();
        }

        LettucePoolingClientConfiguration poolingConfig = builder.build();

        if (redisClusterEnabled) {
            RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration();
            clusterConfig.clusterNode(redisHost, redisPort);
            clusterConfig.setPassword(redisPassword);
            return new LettuceConnectionFactory(clusterConfig, poolingConfig);
        } else {
            RedisStandaloneConfiguration standaloneConfig = new RedisStandaloneConfiguration();
            standaloneConfig.setHostName(redisHost);
            standaloneConfig.setPort(redisPort);
            standaloneConfig.setPassword(redisPassword);
            return new LettuceConnectionFactory(standaloneConfig, poolingConfig);
        }
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
