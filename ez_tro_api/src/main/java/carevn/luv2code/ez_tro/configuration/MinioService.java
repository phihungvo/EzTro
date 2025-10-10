package carevn.luv2code.ez_tro.configuration;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.entity.File;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.FileMapper;
import carevn.luv2code.ez_tro.repository.FileRepository;
import io.minio.*;
import io.minio.CopySource;
import io.minio.http.Method;
import io.minio.messages.Item;
import jakarta.annotation.PostConstruct;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private FileRepository fileRepository;

    @Value("${minio.bucket}")
    private String bucket;

    @Autowired
    private String minioBasePath;

    @Autowired
    private String minioUrl;

    //    @Autowired
    //    private EmployeeRepository employeeRepository;
    //
    //    @Autowired
    //    private ContractRepository contractRepository;

    @Autowired
    private FileMapper fileMapper;

    @PostConstruct
    public void init() {
        try {
            boolean found = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.MINIO_INIT_ERROR);
        }
    }

    /** Uploads a file to MinIO and saves its metadata in the database.
     * @param file the MultipartFile to upload
     * @param uploadedBy the User who is uploading the file
     * @return the name of the uploaded file in MinIO
     */
    public String uploadFile(MultipartFile file, User uploadedBy) {
        try (InputStream inputStream = file.getInputStream()) {
            LocalDate today = LocalDate.now();
            String relativePath =
                    minioBasePath + "/" + today.getYear() + "/" + String.format("%02d", today.getMonthValue()) + "/";
            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            String fullObjectName = relativePath + fileName;

            minioClient.putObject(PutObjectArgs.builder().bucket(bucket).object(fullObjectName).stream(
                            inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            File fileEntity = new File(
                    fullObjectName,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    relativePath,
                    file.getSize(),
                    uploadedBy);
            fileRepository.save(fileEntity);

            return fullObjectName;
        } catch (Exception e) {
            throw new AppException(ErrorCode.MINIO_UPLOAD_ERROR);
        }
    }

    /**
     * Generates a presigned URL for accessing a file, valid for 24 hours.
     * @param fileName the name of the file in the MinIO bucket
     * @return the presigned URL as a String
     */
    public String generatePresignedUrl(String fileName) {
        try {
            GetPresignedObjectUrlArgs args = GetPresignedObjectUrlArgs.builder()
                    .bucket(bucket)
                    .object(fileName)
                    .method(Method.GET)
                    .expiry(24 * 60 * 60)
                    .build();

            return minioClient.getPresignedObjectUrl(args);
        } catch (Exception e) {
            throw new AppException(ErrorCode.MINIO_PRESIGNED_URL_ERROR);
        }
    }

    /**
     * Download a file from the MinIO bucket.
     * @param fileName the name of the file in the MinIO bucket
     * @return InputStream of the downloaded file
     */
    public InputStream downloadFile(String fileName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucket).object(fileName).build());
        } catch (Exception e) {
            throw new AppException(ErrorCode.MINIO_DOWNLOAD_ERROR);
        }
    }

    /**
     * Delete a file from the MinIO bucket and mark it as deleted in the database.
     * @param fileName the name of the file in the MinIO bucket
     */
    public void deleteFile(String fileName) {
        try {
            File fileEntity = fileRepository
                    .findByFileName(fileName)
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
            minioClient.removeObject(
                    RemoveObjectArgs.builder().bucket(bucket).object(fileName).build());
            fileEntity.setDeleted(true);
            fileRepository.save(fileEntity);
        } catch (Exception e) {
            throw new AppException(ErrorCode.MINIO_DELETE_ERROR);
        }
    }

    /**
     * List all files in the MinIO bucket.
     * @return List of file names
     */
    public List<String> listFiles() {
        try {
            List<String> fileNames = new ArrayList<>();
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder().bucket(bucket).build());
            for (Result<Item> result : results) {
                fileNames.add(result.get().objectName());
            }
            return fileNames;
        } catch (Exception e) {
            throw new AppException(ErrorCode.MINIO_LIST_ERROR);
        }
    }

    public boolean fileExists(String fileName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder().bucket(bucket).object(fileName).build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get metadata of a file in the MinIO bucket.
     * @param fileName the name of the file in the MinIO bucket
     * @return StatObjectResponse containing file metadata
     */
    public StatObjectResponse getFileMetadata(String fileName) {
        try {
            return minioClient.statObject(
                    StatObjectArgs.builder().bucket(bucket).object(fileName).build());
        } catch (Exception e) {
            throw new AppException(ErrorCode.MINIO_METADATA_ERROR);
        }
    }

    /**
     * Copy a file within the MinIO bucket and create a new database record for the copied file.
     * @param sourceFileName the name of the source file in the MinIO bucket
     * @param targetFileName the name of the target file in the MinIO bucket
     */
    public void copyFile(String sourceFileName, String targetFileName) {
        try {
            File sourceFile = fileRepository
                    .findByFileName(sourceFileName)
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
            String targetRelativePath = sourceFile.getRelativePath();
            String fullTargetName = targetRelativePath + targetFileName;

            minioClient.copyObject(CopyObjectArgs.builder()
                    .source(CopySource.builder()
                            .bucket(bucket)
                            .object(sourceFileName)
                            .build())
                    .bucket(bucket)
                    .object(fullTargetName)
                    .build());

            File newFile = new File(
                    fullTargetName,
                    sourceFile.getOriginalName(),
                    sourceFile.getContentType(),
                    targetRelativePath,
                    sourceFile.getSize(),
                    sourceFile.getUploadedBy());
            fileRepository.save(newFile);
        } catch (Exception e) {
            throw new AppException(ErrorCode.MINIO_COPY_ERROR);
        }
    }

    /**
     * Move a file within the MinIO bucket by copying it to the new location and deleting the original.
     * Update the database record to reflect the new file name.
     * @param sourceFileName the name of the source file in the MinIO bucket
     * @param targetFileName the name of the target file in the MinIO bucket
     */
    public void moveFile(String sourceFileName, String targetFileName) {
        try {
            File sourceFile = fileRepository
                    .findByFileName(sourceFileName)
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
            String targetRelativePath = sourceFile.getRelativePath();
            String fullTargetName = targetRelativePath + targetFileName;

            copyFile(sourceFileName, fullTargetName);
            deleteFile(sourceFileName);

            File targetFile = fileRepository
                    .findByFileName(fullTargetName)
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
            targetFile.setFileName(fullTargetName);
            fileRepository.save(targetFile);
        } catch (AppException e) {
            throw new AppException(ErrorCode.MINIO_MOVE_DELETE_ERROR);
        }
    }
}
