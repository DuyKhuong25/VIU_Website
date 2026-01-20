package com.vhu.backend.dto.partner.response;

import com.vhu.backend.dto.academics.response.TranslationResponse;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PartnerResponse {
    private Long id;
    private String name;
    private String websiteUrl;
    private String logoUrl;
    private int displayOrder;
    private LocalDateTime createdAt;

    // Dùng cho form Sửa
    private Long logoMediaId;
    private List<TranslationResponse> translations;
}