package com.vhu.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TranslationRequest {
    @NotBlank
    private String languageCode;
    @NotBlank(message = "Tên không được để trống!")
    private String title;
}