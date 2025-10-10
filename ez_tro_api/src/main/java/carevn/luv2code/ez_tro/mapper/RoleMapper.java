package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.RoleDTO;
import carevn.luv2code.ez_tro.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    RoleDTO toDTO(Role entity);

    //    Role toEntity(RoleDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateProjectFromDto(RoleDTO dto, @MappingTarget Role entity);
}
