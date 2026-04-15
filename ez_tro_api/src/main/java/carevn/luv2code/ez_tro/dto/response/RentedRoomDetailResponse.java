package carevn.luv2code.ez_tro.dto.response;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RentedRoomDetailResponse {
    Integer id;
    String roomNumber;
    Integer floor;
    Long rentPrice;
    //    TenantBasicResponse tenant;
    ContractResponse currentContract;
    Integer monthsLeft;
    List<String> services;

    Integer elecPrev;
    Integer waterPrev;

    // Thêm field này vào 2 DTO
    private List<String> usageBasedServices; // danh sách tên Utility cần đọc chỉ số
    private List<MeterReadingPrevDTO> prevMeterReadings; // chỉ số cũ cho từng loại

    boolean hasBillThisMonth;
    BillBasicResponse lastBill;
    //    List<PaymentHistoryResponse> paymentHistory;
}
