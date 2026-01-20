package com.vhu.backend.dto.tag.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TagTranslationRequest {
    @NotBlank(message = "Mã ngôn ngữ không được để trống")
    private String languageCode;
    @NotBlank(message = "Tên thẻ không được để trống")
    private String name;
}