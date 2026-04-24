package carevn.luv2code.ez_tro.configuration.seed;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RbacSeedDataLoader {

    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;
    private final SeedProperties seedProperties;

    /**
     * Đọc file seed RBAC từ resource đã cấu hình.
     */
    public RbacSeedData load() {
        Resource resource = resourceLoader.getResource(seedProperties.getRbacResource());
        if (!resource.exists()) {
            throw new IllegalStateException("Không tìm thấy file seed RBAC tại: " + seedProperties.getRbacResource());
        }

        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, RbacSeedData.class);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Không thể đọc file seed RBAC tại: " + seedProperties.getRbacResource(), exception);
        }
    }
}
