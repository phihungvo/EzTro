package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.FileDTO;
import carevn.luv2code.ez_tro.entity.File;

@Mapper(componentModel = "spring")
public interface FileMapper {

    @Mapping(
            target = "uploadedById",
            source = "uploadedBy.id",
            nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    FileDTO toDTO(File file);

    @Mapping(target = "uploadedBy", ignore = true)
    File toEntity(FileDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateInterviewFromDto(FileDTO dto, @MappingTarget File entity);
}
