package com.vhu.backend.dto.slide.response;

import lombok.Data;
import java.util.List;

@Data
public class SlideResponse {
    private Long id;
    private Integer displayOrder;
    private boolean isActive;
    private String imageUrl;
    private Long mediaId;
    private List<SlideTranslationResponse> translations;
}