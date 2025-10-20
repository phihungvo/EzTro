package carevn.luv2code.ez_tro.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardingHouseResponse {
    Integer id;

    String name;

    String address;

    String contactPhone;

    String description;

    Integer totalBuildings;

    Integer totalRooms;

    String ownerName;

    String ownerEmail;
}
