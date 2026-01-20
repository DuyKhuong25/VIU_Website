package com.vhu.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

//@Service
public class S3Service {

    private final S3Client s3Client;
    private final String bucketName;
    private final Region region;

    private static final Set<String> ALLOWED_FOLDERS = Set.of("slides", "articles", "avatars", "others");

    public S3Service(
            @Value("${aws.accessKeyId}") String accessKeyId,
            @Value("${aws.secretKey}") String secretKey,
            @Value("${aws.region}") String region,
            @Value("${aws.s3.bucket-name}") String bucketName
    ) {
        this.bucketName = bucketName;
        this.region = Region.of(region);
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretKey);
        this.s3Client = S3Client.builder()
                .region(this.region)
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }

    public String uploadFile(MultipartFile file, String folderName) {
        if (!ALLOWED_FOLDERS.contains(folderName.toLowerCase())) {
            throw new IllegalArgumentException("Thư mục upload không hợp lệ: " + folderName);
        }
        try {
            String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String key = folderName.toLowerCase() + "/" + uniqueFileName;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            return key;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tải file lên S3", e);
        }
    }

    public void deleteFile(String fileKey) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .build();
        s3Client.deleteObject(deleteObjectRequest);
    }

    public String getFileUrl(String fileKey) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region.id(), fileKey);
    }
}