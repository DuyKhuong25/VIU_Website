package com.vhu.backend.repository.specification;

import com.vhu.backend.entity.Article;
import com.vhu.backend.entity.ArticleTranslation;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class ArticleSpecification {
    public static Specification<Article> searchByTitle(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            // Join Article với ArticleTranslation
            Join<Article, ArticleTranslation> translationJoin = root.join("translations");
            // Điều kiện tìm kiếm trên trường 'title'
            return criteriaBuilder.like(criteriaBuilder.lower(translationJoin.get("title")), "%" + keyword.toLowerCase() + "%");
        };
    }
}