package com.vhu.backend.dto.academics.response;

import lombok.Data;
import java.util.List;

@Data
public class SpecializationResponse {
    private Long id;

    private String name;

    private List<TranslationResponse> translations;
}