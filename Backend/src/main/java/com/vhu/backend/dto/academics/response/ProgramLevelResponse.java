package com.vhu.backend.dto.academics.response;

import lombok.Data;
import java.util.List;

@Data
public class ProgramLevelResponse {
    private Long id;
    private String code;

    private String name;

    private List<TranslationResponse> translations;
}