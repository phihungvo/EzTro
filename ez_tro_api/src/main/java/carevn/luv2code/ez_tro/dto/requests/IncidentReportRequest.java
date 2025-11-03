package carevn.luv2code.ez_tro.dto.requests;

import java.time.LocalDate;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IncidentReportRequest {
    Integer tenantId;

    Integer roomId;

    String title;

    String description;

    LocalDate expectedResolveDate; // Ngày dự kiến giải quyết sự cố
}
