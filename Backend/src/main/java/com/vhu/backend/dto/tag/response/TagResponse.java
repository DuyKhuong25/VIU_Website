package com.vhu.backend.dto.tag.response;

import lombok.Data;
import java.util.List;

@Data
public class TagResponse {
    private Integer id;
    private List<TagTranslationResponse> translations;
}