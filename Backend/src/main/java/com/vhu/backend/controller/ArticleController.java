package com.vhu.backend.controller;

import com.vhu.backend.dto.article.request.ArticleCreateRequest;
import com.vhu.backend.dto.article.request.ArticleUpdateRequest;
import com.vhu.backend.dto.article.response.ArticleResponse;
import com.vhu.backend.dto.article.response.ArticleTitleResponse;
import com.vhu.backend.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<ArticleResponse> createArticle(@Valid @RequestBody ArticleCreateRequest request) {
        return new ResponseEntity<>(articleService.createArticle(request), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<Page<ArticleResponse>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String search
    ) {
        return ResponseEntity.ok(articleService.getAllArticles(page, size, search));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ArticleResponse> getArticleBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(articleService.getArticleBySlug(slug));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<ArticleResponse> updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleUpdateRequest request) {
        return ResponseEntity.ok(articleService.updateArticle(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/list-titles")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<List<ArticleTitleResponse>> getAllArticleTitles() {
        return ResponseEntity.ok(articleService.getAllArticleTitles());
    }

    @GetMapping("/id/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<ArticleResponse> getArticleById(@PathVariable("id") Long articleId, Locale locale) {
        return ResponseEntity.ok(articleService.getArticleById(articleId, locale));
    }

    @PatchMapping("/{id}/toggle-pin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<ArticleResponse> togglePinStatus(@PathVariable Long id) {
        ArticleResponse updatedArticle = articleService.togglePinStatus(id);
        return ResponseEntity.ok(updatedArticle);
    }
}