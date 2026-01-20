package com.vhu.backend.repository;

import com.vhu.backend.entity.ArticleTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArticleTranslationRepository extends JpaRepository<ArticleTranslation, Long> {
    Optional<ArticleTranslation> findBySlug(String slug);
}