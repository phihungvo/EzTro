package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.Mapper;

import carevn.luv2code.ez_tro.dto.response.NotificationResponse;
import carevn.luv2code.ez_tro.entity.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification entity);
}
