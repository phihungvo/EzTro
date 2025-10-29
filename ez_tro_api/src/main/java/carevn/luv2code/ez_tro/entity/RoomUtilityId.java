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
public class RoomUtilityId implements Serializable {
    @Column(name = "room_id")
    Integer roomId;

    @Column(name = "utility_id")
    Integer utilityId;
}
