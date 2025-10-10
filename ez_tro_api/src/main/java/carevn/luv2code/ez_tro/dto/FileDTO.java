package carevn.luv2code.ez_tro.dto;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileDTO {
    Integer id;

    String fileName;

    String originalName;

    String relativePath;

    String contentType;

    Long size;

    LocalDateTime uploadDate;

    boolean isDeleted;

    Integer uploadedById;
}
