package com.vhu.backend.repository;

import com.vhu.backend.entity.CategoryTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryTranslationRepository extends JpaRepository<CategoryTranslation, Integer> {
    Optional<CategoryTranslation> findBySlug(String slug);
}