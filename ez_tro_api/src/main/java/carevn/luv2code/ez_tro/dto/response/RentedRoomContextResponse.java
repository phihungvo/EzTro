package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.List;

import carevn.luv2code.ez_tro.enums.RoomStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RentedRoomContextResponse {
    Integer id;
    String roomNumber;
    Integer floor;
    Integer maxPeople;
    RoomStatus status;

    //    TenantBasicResponse tenant;           // người thuê hiện tại
    ContractResponse currentContract; // hợp đồng đang active
    Integer monthsLeft; // còn lại bao nhiêu tháng
    BigDecimal rentPrice; // giá thuê theo hợp đồng
    List<String> services; // dịch vụ áp dụng (wifi, parking,...)

    Integer elecPrev;
    Integer waterPrev;

    // Thêm field này vào 2 DTO
    private List<String> usageBasedServices; // danh sách tên Utility cần đọc chỉ số
    private List<MeterReadingPrevDTO> prevMeterReadings; // chỉ số cũ cho từng loại

    boolean hasBillThisMonth; // đã có bill tháng này chưa
    BillBasicResponse lastBill; // bill gần nhất (nếu có)
}
