package com.vhu.backend.dto.category.response;

import lombok.Data;

@Data
public class CategoryTranslationResponse {
    private Integer id;
    private String languageCode;
    private String name;
    private String slug;
}