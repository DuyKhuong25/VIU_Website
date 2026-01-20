package com.vhu.backend.repository;

import com.vhu.backend.entity.ProgramLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProgramLevelRepository extends JpaRepository<ProgramLevel, Long> {
    Optional<ProgramLevel> findByCode(String code);

    @Query("SELECT pl FROM ProgramLevel pl JOIN pl.translations t WHERE t.languageCode = ?1 AND t.name = ?2")
    Optional<ProgramLevel> findByTranslation(String languageCode, String name);
}