package com.vhu.backend.repository;

import com.vhu.backend.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.vhu.backend.entity.ArticleStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long>, JpaSpecificationExecutor<Article> {

    List<Article> findByIsPinnedTrueAndStatusOrderByPublishedAtDesc(ArticleStatus status, Pageable pageable);

    List<Article> findByCategoryIdAndStatus(Integer categoryId, ArticleStatus status, Pageable pageable);

    List<Article> findByCategoryIdInAndStatus(List<Integer> categoryIds, ArticleStatus status, Pageable pageable);

    List<Article> findByCategoryIdAndStatusAndIdNot(Integer categoryId, ArticleStatus status, Long articleId, Pageable pageable);

    List<Article> findByStatus(ArticleStatus status, Pageable pageable);
}