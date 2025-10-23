package carevn.luv2code.ez_tro.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomAmenityResponse {
    Integer id;

    Integer roomId;

    String roomName;

    Integer amenityId;

    String amenityName;

    Boolean isActive;
}
