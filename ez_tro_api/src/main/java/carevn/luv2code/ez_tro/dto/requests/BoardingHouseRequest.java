package carevn.luv2code.ez_tro.dto.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardingHouseRequest {
    String name;

    String address;

    Integer ownerId;

    String description;

    Integer totalRooms;
}
