package com.vhu.backend.controller;

import com.vhu.backend.dto.academics.request.MajorRequest;
import com.vhu.backend.dto.academics.response.MajorResponse;
import com.vhu.backend.service.MajorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/majors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
public class MajorController {

    private final MajorService majorService;

    @PostMapping
    public ResponseEntity<MajorResponse> createMajor(@Valid @RequestBody MajorRequest request) {
        return new ResponseEntity<>(majorService.createMajor(request), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<Page<MajorResponse>> getAllMajors(
            @PageableDefault(sort = "id") Pageable pageable,
            @RequestParam(defaultValue = "vi") String lang) {
        return ResponseEntity.ok(majorService.getAllMajors(pageable, lang));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MajorResponse> getMajorById(@PathVariable Long id) {
        return ResponseEntity.ok(majorService.getMajorById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MajorResponse> updateMajor(@PathVariable Long id, @Valid @RequestBody MajorRequest request) {
        return ResponseEntity.ok(majorService.updateMajor(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMajor(@PathVariable Long id) {
        majorService.deleteMajor(id);
        return ResponseEntity.noContent().build();
    }
}