package com.vhu.backend.dto.tag.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class TagCreateRequest {
    @Valid
    @NotEmpty
    @Size(min = 2, max = 2, message = "Phải có đúng 2 bản dịch Việt và Anh")
    private List<TagTranslationRequest> translations;
}