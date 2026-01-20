package com.vhu.backend.dto.article.response;

import com.vhu.backend.dto.category.response.CategoryResponse;
import com.vhu.backend.dto.response.UserResponse;
import com.vhu.backend.dto.tag.response.TagResponse;
import com.vhu.backend.entity.ArticleStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
public class ArticleResponse {
    private Long id;
    private UserSimpleResponse author;
    private CategorySimpleResponse category;
    private String thumbnailUrl;
    private Long thumbnailMediaId;
    private ArticleStatus status;
    private boolean isPinned;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ArticleTranslationResponse> translations;
    private Set<TagSimpleResponse> tags;
}
