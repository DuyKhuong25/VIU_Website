package com.vhu.backend.dto.translate.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranslateResponse {
    private Map<String, String> translatedTexts;
}