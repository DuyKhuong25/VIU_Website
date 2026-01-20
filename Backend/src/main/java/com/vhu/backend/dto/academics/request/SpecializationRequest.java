package com.vhu.backend.dto.academics.request;

import com.vhu.backend.dto.request.TranslationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SpecializationRequest {
    @Valid
    @NotEmpty(message = "Chuyên ngành phải có ít nhất một bản dịch")
    private List<TranslationRequest> translations;
}