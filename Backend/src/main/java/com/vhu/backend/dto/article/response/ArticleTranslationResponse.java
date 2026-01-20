package com.vhu.backend.dto.article.response;

import lombok.Data;

@Data
public class ArticleTranslationResponse {
    private String languageCode;
    private String title;
    private String excerpt;
    private String content;
    private String slug;
}