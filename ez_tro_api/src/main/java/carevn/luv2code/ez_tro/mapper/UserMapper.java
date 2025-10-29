package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.dto.UserDTO;
import carevn.luv2code.ez_tro.dto.requests.CreateUserRequest;
import carevn.luv2code.ez_tro.dto.requests.UserUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.UserInfoDTO;
import carevn.luv2code.ez_tro.entity.User;

@Component
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roleIds", ignore = true)
    @Mapping(target = "profilePicture", ignore = true)
    UserDTO toDTO(User user);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "profilePicture", ignore = true)
    User toEntity(UserDTO userDTO);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "profilePicture", ignore = true)
    void updateUserFromDto(UserUpdateRequest request, @MappingTarget User user);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "profilePicture", ignore = true)
    User toEntity(CreateUserRequest request);

    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    //    @Mapping(target = "profilePicture", ignore = true)
    UserInfoDTO toBasicInfoDTO(User user);
}
