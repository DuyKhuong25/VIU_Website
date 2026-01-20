package com.vhu.backend.dto.academics.request;

import com.vhu.backend.dto.request.TranslationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProgramLevelRequest {

    @NotBlank(message = "Mã chương trình không được để trống")
    @Size(max = 100, message = "Mã chương trình không được vượt quá 100 ký tự")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Mã chỉ được chứa chữ thường, số và dấu gạch nối")
    private String code;

    @Valid
    @NotEmpty(message = "Cần ít nhất một bản dịch")
    private List<TranslationRequest> translations;
}