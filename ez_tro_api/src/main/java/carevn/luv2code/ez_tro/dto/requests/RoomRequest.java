package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.util.List;

import carevn.luv2code.ez_tro.enums.RoomStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRequest {
    @Size(max = 50, message = "Số phòng tối đa 50 ký tự")
    String roomNumber;

    @NotNull(message = "Khu nhà trọ là bắt buộc")
    Integer boardingHouseId;

    @NotNull(message = "Tòa nhà là bắt buộc")
    Integer buildingId;

    @NotNull(message = "Diện tích phòng là bắt buộc")
    @DecimalMin(value = "0.01", message = "Diện tích phải lớn hơn 0")
    BigDecimal area;

    @NotNull(message = "Giá thuê là bắt buộc")
    @DecimalMin(value = "1", message = "Giá thuê phải lớn hơn 0")
    BigDecimal price;

    RoomStatus status;

    String note;

    List<Integer> utilityIds;

    @Min(value = 1, message = "Tầng phải lớn hơn hoặc bằng 1")
    Integer floorNumber;

    @NotNull(message = "Sức chứa tối đa là bắt buộc")
    @Min(value = 1, message = "Sức chứa tối đa phải lớn hơn 0")
    Integer maxOccupants;

    Boolean hasAirConditioner = false;

    Boolean hasBathroom = true;

    Boolean hasKitchen = true;
}
