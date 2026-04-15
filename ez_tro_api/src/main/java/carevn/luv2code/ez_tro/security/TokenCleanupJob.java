package carevn.luv2code.ez_tro.security;

import java.util.Date;
import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.entity.InvalidatedToken;
import carevn.luv2code.ez_tro.repository.InvalidatedTokenRepository;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
// Cho phép tắt job khi chạy test để giảm noise/log và tránh side-effect không cần thiết.
@ConditionalOnProperty(name = "app.jobs.token-cleanup.enabled", havingValue = "true", matchIfMissing = true)
public class TokenCleanupJob {

    private final InvalidatedTokenRepository invalidatedTokenRepository;

    public TokenCleanupJob(InvalidatedTokenRepository invalidatedTokenRepository) {
        this.invalidatedTokenRepository = invalidatedTokenRepository;
    }

    @Scheduled(fixedRate = 60000) // chạy mỗi 1 phút
    @Transactional
    public void cleanupExpiredTokens() {
        Date now = new Date();
        log.info("==============================");
        log.info("🔄 Bắt đầu job cleanupExpiredTokens tại: {}", now);

        // Lấy danh sách token hết hạn
        List<InvalidatedToken> expired = invalidatedTokenRepository.findByExpiryTimeBefore(now);
        log.info("📌 Có {} token hết hạn trong DB", expired.size());

        if (!expired.isEmpty()) {
            expired.forEach(t -> log.info("➡ Xoá token id={} expiry={}", t.getId(), t.getExpiryTime()));
            invalidatedTokenRepository.deleteAll(expired);
            log.info("✅ Đã xoá {} token hết hạn", expired.size());

            log.info("------------------------------");

            int deletedCount = invalidatedTokenRepository.deleteByExpiryTimeBefore(now);
            log.info("✅ Đã xoá {} token ", deletedCount);
        } else {
            log.info("⚡ Không có token nào cần xoá");
        }
    }
}
