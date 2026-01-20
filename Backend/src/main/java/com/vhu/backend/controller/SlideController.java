// Công dụng: Cung cấp các API endpoint cho việc quản lý Slide.
package com.vhu.backend.controller;

import com.vhu.backend.dto.slide.request.SlideCreateRequest;
import com.vhu.backend.dto.slide.request.SlideUpdateRequest;
import com.vhu.backend.dto.slide.response.SlideResponse;
import com.vhu.backend.service.SlideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slides")
@RequiredArgsConstructor
public class SlideController {

    private final SlideService slideService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<List<SlideResponse>> getAllSlides() {
        return ResponseEntity.ok(slideService.getAllSlidesForAdmin());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<SlideResponse> createSlide(@Valid @RequestBody SlideCreateRequest request) {
        return new ResponseEntity<>(slideService.createSlide(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<SlideResponse> updateSlide(@PathVariable Long id, @Valid @RequestBody SlideUpdateRequest request) {
        return ResponseEntity.ok(slideService.updateSlide(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSlide(@PathVariable Long id) {
        slideService.deleteSlide(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<SlideResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(slideService.toggleStatus(id));
    }

    @PostMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<Void> reorderSlides(@RequestBody List<Long> slideIds) {
        slideService.reorderSlides(slideIds);
        return ResponseEntity.ok().build();
    }
}