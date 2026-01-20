package com.vhu.backend.repository;

import com.vhu.backend.entity.TagTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagTranslationRepository extends JpaRepository<TagTranslation, Integer> {
    Optional<TagTranslation> findBySlug(String slug);
}