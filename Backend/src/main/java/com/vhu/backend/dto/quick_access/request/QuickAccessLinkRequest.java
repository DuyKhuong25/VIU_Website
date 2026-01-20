package com.vhu.backend.dto.quick_access.request;

import com.vhu.backend.dto.request.TranslationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.util.List;

@Data
public class QuickAccessLinkRequest {
    @NotBlank(message = "URL không được để trống")
    @URL(message = "URL không hợp lệ")
    private String linkUrl;

    @NotNull(message = "Icon không được để trống")
    private Long iconMediaId;

    private boolean isActive = true;

    @Valid
    @NotEmpty
    @Size(min = 1, message = "Cần ít nhất một bản dịch")
    private List<TranslationRequest> translations;
}