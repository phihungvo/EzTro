package carevn.luv2code.ez_tro.controller.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeterReadingPrevDTO {
    private String utilityName; // "Điện", "Nước",...
    private Integer previousIndex;
    private String unit; // "kWh", "m³",...
}
