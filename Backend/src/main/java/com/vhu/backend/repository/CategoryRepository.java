
package com.vhu.backend.repository;

import com.vhu.backend.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer>, JpaSpecificationExecutor<Category> {

//    List<Category> findByParentIsNull();
//
//    @Query("SELECT DISTINCT c FROM Category c JOIN c.translations t WHERE c.parent IS NULL AND LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
//    Page<Category> findRootCategories(@Param("keyword") String keyword, Pageable pageable);
//
//    Page<Category> findDistinctByTranslations_NameContainingIgnoreCase(String keyword, Pageable pageable);
//
//    Page<Category> findByParentIsNull(Pageable pageable);

    List<Category> findByParentIsNullOrderByDisplayOrderAsc();

    @Query("SELECT DISTINCT c FROM Category c JOIN c.translations t WHERE c.parent IS NULL AND LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Category> findRootCategories(@Param("keyword") String keyword, Pageable pageable);

    Page<Category> findDistinctByTranslations_NameContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Category> findByParentIsNull(Pageable pageable);

    @Query("SELECT MAX(c.displayOrder) FROM Category c WHERE c.parent IS NULL")
    Optional<Integer> findMaxDisplayOrderForRootCategories();
}