package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "files")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "file_name", nullable = false, unique = true)
    String fileName;

    @Column(name = "original_name", nullable = false)
    String originalName;

    @Column(name = "relative_path", nullable = false)
    String relativePath;

    @Column(name = "content_type", nullable = false)
    String contentType;

    @Column(name = "size", nullable = false)
    Long size;

    @Column(name = "upload_date", updatable = false)
    @CreationTimestamp
    LocalDateTime uploadDate;

    @Column(name = "last_modified")
    @UpdateTimestamp
    LocalDateTime lastModified;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    User uploadedBy;

    @Column(name = "is_deleted", nullable = false)
    boolean isDeleted = false;

    public File() {}

    public File(
            String fileName, String originalName, String contentType, String relativePath, Long size, User uploadedBy) {
        this.fileName = fileName;
        this.originalName = originalName;
        this.contentType = contentType;
        this.relativePath = relativePath;
        this.size = size;
        this.uploadedBy = uploadedBy;
    }
}
