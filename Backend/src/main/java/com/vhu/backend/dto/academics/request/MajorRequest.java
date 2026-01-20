package com.vhu.backend.dto.academics.request;

import com.vhu.backend.dto.request.TranslationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MajorRequest {

    @NotNull(message = "Chương trình đào tạo không được để trống")
    private Long programLevelId;

    @Valid
    @NotEmpty(message = "Ngành học phải có ít nhất một bản dịch")
    private List<TranslationRequest> translations;

    @Valid
    private List<SpecializationRequest> specializations;
}