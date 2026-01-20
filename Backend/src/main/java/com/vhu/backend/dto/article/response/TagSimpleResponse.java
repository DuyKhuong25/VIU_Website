package com.vhu.backend.dto.article.response;

import lombok.Data;

@Data
public class TagSimpleResponse {
    private Integer id;
    private String name;
    private String slug;
}
