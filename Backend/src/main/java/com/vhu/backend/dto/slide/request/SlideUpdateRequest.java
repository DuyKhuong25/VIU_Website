package com.vhu.backend.dto.slide.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class SlideUpdateRequest {
    @NotNull(message = "Hình ảnh không được để trống")
    private Long mediaId;

    private boolean isActive;

    @Valid
    @NotEmpty
    @Size(min = 2, max = 2)
    private List<SlideTranslationRequest> translations;
}