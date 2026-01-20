package com.vhu.backend.dto.article.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ArticleTranslationRequest {
    @NotBlank(message = "Mã ngôn ngữ không được để trống")
    private String languageCode;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String excerpt;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;
}