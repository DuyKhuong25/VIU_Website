package com.vhu.backend.service;

import com.vhu.backend.entity.Media;
import com.vhu.backend.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaCleanupService {

    private final MediaRepository mediaRepository;
    private final FileSystemStorageService storageService;
    private static final Logger logger = LoggerFactory.getLogger(MediaCleanupService.class);

    @Scheduled(cron = "0 0/60 * * * ?")  // 60 phút
    @Transactional
    public void cleanupOrphanedMedia() {
        logger.info("Bắt đầu tác vụ dọn dẹp file Media trống...");
        LocalDateTime threshold = LocalDateTime.now().minusHours(24); // 24 giờ
        List<Media> orphanedMedia = mediaRepository.findByOwnerIdIsNullAndCreatedAtBefore(threshold);

        if (orphanedMedia.isEmpty()) {
            logger.info("Không tìm thấy file Media trống nào để dọn dẹp.");
            return;
        }

        logger.info("Tìm thấy {} file Media trống. Bắt đầu xóa...", orphanedMedia.size());

        for (Media media : orphanedMedia) {
            try {
                // s3Service.deleteFile(media.getS3Key()); // Xóa file trên S3

                // Xóa file vật lý trên server
                storageService.delete(media.getS3Key());

                // Xóa bản ghi trong database
                mediaRepository.delete(media);
                logger.info("Đã xóa thành công file: {}", media.getS3Key());
            } catch (Exception e) {
                logger.error("Lỗi khi xóa file Media trống {}: {}", media.getS3Key(), e.getMessage());
            }
        }
        logger.info("Hoàn tất tác vụ dọn dẹp file Media trống.");
    }
}