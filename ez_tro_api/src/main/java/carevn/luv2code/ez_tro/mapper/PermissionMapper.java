package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.PermissionDTO;
import carevn.luv2code.ez_tro.dto.RoleDTO;
import carevn.luv2code.ez_tro.entity.Permission;
import carevn.luv2code.ez_tro.entity.Role;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionDTO toDTO(Permission entity);

    Permission toEntity(PermissionDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateProjectFromDto(RoleDTO dto, @MappingTarget Role entity);
}
