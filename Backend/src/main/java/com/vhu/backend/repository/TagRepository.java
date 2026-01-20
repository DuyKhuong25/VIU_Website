package com.vhu.backend.repository;

import com.vhu.backend.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Integer>, JpaSpecificationExecutor<Tag> {
    Page<Tag> findDistinctByTranslations_NameContainingIgnoreCase(String keyword, Pageable pageable);

    @Query("SELECT t FROM Tag t JOIN t.articles a GROUP BY t.id ORDER BY COUNT(a) DESC")
    List<Tag> findPopularTags(Pageable pageable);
}