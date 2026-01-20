package com.vhu.backend.dto.quick_access.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuickAccessLinkResponse {
    private Long id;
    private String title;
    private Long logoMediaId;
    private String linkUrl;
    private String iconUrl;
    private int displayOrder;
    private boolean isActive;
    private LocalDateTime createdAt;
    private List<TranslationResponse> translations;
}