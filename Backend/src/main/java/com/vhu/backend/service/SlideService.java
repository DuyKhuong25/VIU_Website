package com.vhu.backend.service;

import com.vhu.backend.dto.slide.request.SlideCreateRequest;
import com.vhu.backend.dto.slide.request.SlideUpdateRequest;
import com.vhu.backend.dto.slide.response.SlideResponse;
import java.util.List;

public interface SlideService {
    SlideResponse createSlide(SlideCreateRequest request);
    List<SlideResponse> getAllSlidesForAdmin();
    void deleteSlide(Long slideId);
    SlideResponse updateSlide(Long slideId, SlideUpdateRequest request);
    SlideResponse toggleStatus(Long slideId);
    void reorderSlides(List<Long> slideIds);

    List<SlideResponse> getActiveSlides();
}