package carevn.luv2code.ez_tro.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomAmenityId implements Serializable {
    @Column(name = "room_id")
    Integer roomId;

    @Column(name = "amenity_id")
    Integer amenityId;
}
