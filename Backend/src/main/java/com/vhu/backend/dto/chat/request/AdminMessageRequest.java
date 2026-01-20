package com.vhu.backend.dto.chat.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminMessageRequest {
    @NotBlank
    private String text;
}