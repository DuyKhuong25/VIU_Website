package com.vhu.backend.dto.article.response;

import lombok.Data;

@Data
public class UserSimpleResponse {
    private Long id;
    private String username;
    private String fullName;
}
