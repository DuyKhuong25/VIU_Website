package com.vhu.backend.controller.publics;

import com.vhu.backend.dto.article.response.ArticleResponse;
import com.vhu.backend.dto.tag.response.TagResponse;
import com.vhu.backend.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/tags")
@RequiredArgsConstructor
public class PublicTagController {

    private final TagService tagService;

    @GetMapping("/slug/{slug}")
    public ResponseEntity<TagResponse> getTagInfoBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(tagService.getPublicTagBySlug(slug));
    }

    @GetMapping("/{slug}/articles/{languageCode}")
    public ResponseEntity<List<ArticleResponse>> getArticlesByTagSlug(
            @PathVariable String slug,
            @PathVariable String languageCode) {
        return ResponseEntity.ok(tagService.getPublicArticlesByTagSlug(slug, languageCode));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<TagResponse>> getPopularTags(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(tagService.getPublicPopularTags(limit));
    }
}