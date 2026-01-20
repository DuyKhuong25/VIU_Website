package com.vhu.backend.controller.publics;

import com.vhu.backend.dto.slide.response.SlideResponse;
import com.vhu.backend.service.SlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/slides")
@RequiredArgsConstructor
public class PublicSlideController {

    private final SlideService slideService;

    @GetMapping("/active")
    public ResponseEntity<List<SlideResponse>> getActiveSlides() {
        return ResponseEntity.ok(slideService.getActiveSlides());
    }
}