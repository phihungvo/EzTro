package carevn.luv2code.ez_tro.controller.admin;

import lombok.Builder;
import lombok.Data;

/**
 * DTO mô tả chỉ số kỳ trước của một tiện ích (ví dụ: điện/nước) để hỗ trợ UI nhập chỉ số.
 */
@Data
@Builder
public class MeterReadingPrevDTO {
    private String utilityName; // "Điện", "Nước",...
    private Integer previousIndex;
    private String unit; // "kWh", "m³",...
}
