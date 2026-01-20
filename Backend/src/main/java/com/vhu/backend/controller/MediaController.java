package com.vhu.backend.controller;

import com.vhu.backend.entity.Media;
import com.vhu.backend.repository.MediaRepository;
import com.vhu.backend.service.FileSystemStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final FileSystemStorageService storageService;
    private final MediaRepository mediaRepository;

    // Upload file to Amazon S3 and create a media record in the database
//    @PostMapping("/upload")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
//    @Transactional
//    public ResponseEntity<Map<String, Object>> uploadFile(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam(defaultValue = "others") String folder
//    ) {
//        // 1. Tải file lên S3 và lấy về key (ví dụ: slides/uuid_image.jpg)
//        String s3Key = s3Service.uploadFile(file, folder);
//
//        // 2. Tạo một bản ghi trong bảng media (phòng chờ)
//        Media newMedia = new Media();
//        newMedia.setS3Key(s3Key);
//        newMedia.setUrl(s3Service.getFileUrl(s3Key));
//        Media savedMedia = mediaRepository.save(newMedia);
//
//
//        return ResponseEntity.ok(Map.of(
//                "mediaId", savedMedia.getId(),
//                "location", savedMedia.getUrl()
//        ));
//    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    @Transactional
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file
    ) {
        String relativePath = storageService.store(file, FileSystemStorageService.TEMP_FOLDER);

        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/").path(relativePath).toUriString();

        Media newMedia = new Media();
        newMedia.setS3Key(relativePath);
        newMedia.setUrl(fileUrl);
        // owner_id và owner_type sẽ là NULL, chờ được gán sau
        Media savedMedia = mediaRepository.save(newMedia);

        return ResponseEntity.ok(Map.of(
                "mediaId", savedMedia.getId(),
                "location", savedMedia.getUrl()
        ));
    }
}