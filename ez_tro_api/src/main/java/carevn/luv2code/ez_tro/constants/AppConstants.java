package carevn.luv2code.ez_tro.constants;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppConstants {

    @Value("${app.default.role}")
    private String defaultRole;

    @Value("${app.default.default-room-start-number}")
    private int defaultRoomStartNumber;

    @Value("${app.prefix.contract}")
    private String contractCodePrefix;

    @Value("${app.prefix.bill}")
    private String billCodePrefix;

    @Value("${app.timestamp.code-format}")
    private String codeTimestampFormat;

    // ===== Getter =====
    public String getDefaultRole() {
        return defaultRole;
    }

    public int getDefaultRoomStartNumber() {
        return defaultRoomStartNumber;
    }

    public String getContractCodePrefix() {
        return contractCodePrefix;
    }

    public String getBillCodePrefix() {
        return billCodePrefix;
    }

    public String getCodeTimestampFormat() {
        return codeTimestampFormat;
    }
}
