package carevn.luv2code.ez_tro.dto.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardingHouseRequest {
    @NotBlank(message = "Boarding house name is required")
    String name;

    @NotBlank(message = "Address is required")
    String address;

    @NotBlank(message = "Contact phone is required")
    String contactPhone;

    Integer ownerId;

    String description;

    @Min(value = 0, message = "Total buildings must be greater than or equal to 0")
    Integer totalBuildings = 0;

    @Min(value = 0, message = "Total rooms must be greater than or equal to 0")
    Integer totalRooms;
}
