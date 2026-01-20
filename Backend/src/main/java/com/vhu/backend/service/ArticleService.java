package com.vhu.backend.service;

import com.vhu.backend.dto.article.request.ArticleCreateRequest;
import com.vhu.backend.dto.article.request.ArticleUpdateRequest;
import com.vhu.backend.dto.article.response.ArticleResponse;
import com.vhu.backend.dto.article.response.ArticleTitleResponse;
import com.vhu.backend.entity.Article;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Locale;

public interface ArticleService {
    Page<ArticleResponse> getAllArticles(int page, int size, String search);
    ArticleResponse togglePinStatus(Long articleId);
    ArticleResponse getArticleBySlug(String slug);
    ArticleResponse createArticle(ArticleCreateRequest request);
    ArticleResponse updateArticle(Long articleId, ArticleUpdateRequest request);
    void deleteArticle(Long articleId);
    List<ArticleTitleResponse> getAllArticleTitles();
    ArticleResponse getArticleById(Long articleId, Locale locale);

    List<ArticleResponse> getPinnedArticles(String languageCode, int limit);

    List<ArticleResponse> getLatestArticles(String languageCode, int limit);

    List<ArticleResponse> searchPublicArticles(String query, String languageCode);

    List<ArticleResponse> getLatestArticlesByCategoryId(Integer categoryId, String languageCode, int limit);

    List<ArticleResponse> getLatestArticlesByCategorySlug(String slug, String languageCode, int limit);

    List<ArticleResponse> getRelatedArticles(Long articleId, Integer categoryId, String languageCode, int limit);

    ArticleResponse mapToArticleResponse(Article article, String languageCode);
}