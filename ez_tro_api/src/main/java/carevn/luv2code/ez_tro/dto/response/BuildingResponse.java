package carevn.luv2code.ez_tro.dto.response;

import java.util.Date;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingResponse {
    Integer id;

    String name;

    String description;

    Integer totalFloors;

    Integer boardingHouseId;

    String boardingHouseName;

    Date createdAt;

    Date updatedAt;
}
