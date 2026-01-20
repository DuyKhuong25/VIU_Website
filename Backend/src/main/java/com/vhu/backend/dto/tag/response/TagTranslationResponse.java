package com.vhu.backend.dto.tag.response;

import lombok.Data;

@Data
public class TagTranslationResponse {
    private Integer id;
    private String languageCode;
    private String name;
    private String slug;
}