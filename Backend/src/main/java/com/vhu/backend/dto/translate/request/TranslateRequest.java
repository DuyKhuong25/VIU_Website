package com.vhu.backend.dto.translate.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.Map;

@Data
public class TranslateRequest {
    @NotEmpty(message = "Dữ liệu dịch không được để trống")
    private Map<String, String> texts;
}