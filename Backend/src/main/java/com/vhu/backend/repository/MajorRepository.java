package com.vhu.backend.repository;

import com.vhu.backend.entity.Major;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MajorRepository extends JpaRepository<Major, Long> {
    @Query("SELECT m FROM Major m JOIN m.translations t WHERE t.languageCode = ?1 AND t.name = ?2 AND m.programLevel.id = ?3")
    Optional<Major> findByTranslationAndProgramLevel(String languageCode, String name, Long programLevelId);
}