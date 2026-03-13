package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomPeriodSummaryResponse {

    private Integer roomId;
    private String roomNumber;
    private Integer floorNumber;
    private Integer currentOccupants; // số người đang ở (từ hợp đồng active)

    private String roomStatus; // "AVAILABLE", "OCCUPIED", "MAINTENANCE", ...

    private String periodStatus; // "Phòng trống" | "Chưa có HĐ" | "Đã tạo HĐ" | "Đã thanh toán" | "Quá hạn"
    private Boolean hasBillThisPeriod; // true nếu đã có bill tháng/năm này

    private String billStatus; // UNPAID / PAID / OVERDUE / ...
    private BigDecimal billAmount; // tổng tiền bill (nếu có)
    private String dueDate; // ngày đến hạn (nếu có bill)
    private Boolean isOverdue;

    private String tenantName;
    private String tenantPhone;
    private String contractStartDate; // dd/MM/yyyy
    private String contractEndDate; // dd/MM/yyyy hoặc "Vô thời hạn"
    private Integer monthsRemaining; // số tháng còn lại (nếu có endDate)
}
