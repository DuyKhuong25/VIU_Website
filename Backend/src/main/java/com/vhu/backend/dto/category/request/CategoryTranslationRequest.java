package com.vhu.backend.dto.category.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryTranslationRequest {
    @NotBlank(message = "Mã ngôn ngữ không được để trống")
    private String languageCode;

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;
}