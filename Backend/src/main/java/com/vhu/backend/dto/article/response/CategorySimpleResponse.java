package com.vhu.backend.dto.article.response;

import lombok.Data;

@Data
public class CategorySimpleResponse {
    private Integer id;
    private String name;
    private String slug;
}
