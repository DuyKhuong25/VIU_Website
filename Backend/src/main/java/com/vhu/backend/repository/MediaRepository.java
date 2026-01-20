package com.vhu.backend.repository;

import com.vhu.backend.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByOwnerIdIsNullAndCreatedAtBefore(LocalDateTime threshold);

    List<Media> findByUrlIn(List<String> urls);

    List<Media> findByOwnerIdAndOwnerType(Long ownerId, String ownerType);

    Optional<Media> findByS3Key(String s3Key);
}
