package com.vhu.backend.dto.article.request;

import com.vhu.backend.entity.ArticleStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
public class ArticleUpdateRequest {
    @NotNull(message = "ID danh mục không được để trống")
    private Integer categoryId;

    @NotNull(message = "ID ảnh đại diện không được để trống")
    private Long thumbnailMediaId;

    private Set<Integer> tagIds = new HashSet<>();

    @NotNull(message = "Trạng thái không được để trống")
    private ArticleStatus status;

    private boolean isPinned;

    @Valid
    @NotEmpty
    @Size(min = 2, max = 2)
    private List<ArticleTranslationRequest> translations;
}
