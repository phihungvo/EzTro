package carevn.luv2code.ez_tro.dto.requests;

import java.time.LocalDate;

import carevn.luv2code.ez_tro.enums.IncidentStatus;
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

    IncidentStatus status;

    LocalDate expectedResolveDate; // Ngày dự kiến giải quyết sự cố
}
