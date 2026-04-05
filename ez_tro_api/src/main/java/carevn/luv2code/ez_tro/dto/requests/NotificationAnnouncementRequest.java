package carevn.luv2code.ez_tro.dto.requests;

import java.util.List;

import carevn.luv2code.ez_tro.enums.NotificationAnnouncementTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationAnnouncementRequest {
    @NotNull
    NotificationAnnouncementTargetType targetType;

    List<Integer> targetIds;

    @NotBlank
    String title;

    @NotBlank
    String message;

    String category;

    String priority;
}
