package com.vhu.backend.controller.publics;

import com.vhu.backend.dto.article.response.ArticleResponse;
import com.vhu.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/articles")
@RequiredArgsConstructor
public class PublicArticleController {

    private final ArticleService articleService;

    @GetMapping("/featured/{languageCode}")
    public ResponseEntity<List<ArticleResponse>> getFeaturedArticles(
            @PathVariable String languageCode,
            @RequestParam(defaultValue = "3") int limit) {
        return ResponseEntity.ok(articleService.getPinnedArticles(languageCode, limit));
    }

//    @GetMapping("/announcements/{languageCode}")
//    public ResponseEntity<List<ArticleResponse>> getLatestAnnouncements(
//            @PathVariable String languageCode,
//            @RequestParam(defaultValue = "21") Integer categoryId,
//            @RequestParam(defaultValue = "5") int limit) {
//        return ResponseEntity.ok(articleService.getLatestArticlesByCategoryId(categoryId, languageCode, limit));
//    }

    @GetMapping("/search")
    public ResponseEntity<List<ArticleResponse>> searchArticles(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "vi") String lang) {
        return ResponseEntity.ok(articleService.searchPublicArticles(query, lang));
    }

    @GetMapping("/latest/{languageCode}")
    public ResponseEntity<List<ArticleResponse>> getLatestArticles(
            @PathVariable String languageCode,
            @RequestParam(defaultValue = "6") int limit) { // <-- Lấy 6 bài theo yêu cầu của bạn
        return ResponseEntity.ok(articleService.getLatestArticles(languageCode, limit));
    }

    @GetMapping("/by-category-slug/{slug}/{languageCode}")
    public ResponseEntity<List<ArticleResponse>> getLatestByCategorySlug(
            @PathVariable String slug,
            @PathVariable String languageCode,
            @RequestParam(defaultValue = "3") int limit) { // Lấy 3 bài cho mỗi mục
        return ResponseEntity.ok(articleService.getLatestArticlesByCategorySlug(slug, languageCode, limit));
    }

    @GetMapping("/slug/{slug}/{languageCode}")
    public ResponseEntity<ArticleResponse> getPublicArticleBySlug(
            @PathVariable String slug,
            @PathVariable String languageCode) {

        ArticleResponse articleResponse = articleService.getArticleBySlug(slug);

        return ResponseEntity.ok(articleResponse);
    }

    @GetMapping("/related/{articleId}/{categoryId}/{languageCode}")
    public ResponseEntity<List<ArticleResponse>> getRelatedArticles(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId,
            @PathVariable String languageCode,
            @RequestParam(defaultValue = "5") int limit) {

        return ResponseEntity.ok(articleService.getRelatedArticles(articleId, categoryId, languageCode, limit));
    }
}