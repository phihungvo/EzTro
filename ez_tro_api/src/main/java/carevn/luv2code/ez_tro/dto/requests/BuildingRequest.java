package carevn.luv2code.ez_tro.dto.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingRequest {

    String name;

    String description;

    Integer totalFloors;

    Integer boardingHouseId; // ID nhà trọ chứa tòa nhà
}
