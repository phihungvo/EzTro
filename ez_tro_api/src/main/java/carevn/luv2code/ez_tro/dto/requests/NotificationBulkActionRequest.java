package carevn.luv2code.ez_tro.dto.requests;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationBulkActionRequest {
    List<Integer> ids;
}
