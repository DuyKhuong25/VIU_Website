package com.vhu.backend.dto.partner.request;

import com.vhu.backend.dto.request.TranslationRequest; // Tái sử dụng TranslationRequest
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.util.List;

@Data
public class PartnerRequest {

    @URL(message = "URL website không hợp lệ")
    private String websiteUrl;

    @NotNull(message = "Logo không được để trống")
    private Long logoMediaId;

    @Valid
    @NotEmpty(message = "Cần ít nhất một tên đối tác")
    private List<TranslationRequest> translations;
}