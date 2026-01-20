package com.vhu.backend.dto.slide.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SlideTranslationRequest {
    @NotBlank(message = "Mã ngôn ngữ không được để trống!")
    private String languageCode;
    @NotBlank(message = "Tiêu đề không được để trống!")
    private String title;
    private String description;
    private Long linkedArticleId;
    private String externalLinkUrl;
}