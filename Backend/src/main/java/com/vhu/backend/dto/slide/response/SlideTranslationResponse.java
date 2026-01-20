package com.vhu.backend.dto.slide.response;

import lombok.Data;

@Data
public class SlideTranslationResponse {
    private String languageCode;
    private String title;
    private String description;
    private Long linkedArticleId;
    private String linkUrl;
}