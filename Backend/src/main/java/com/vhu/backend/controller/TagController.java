package com.vhu.backend.controller;

import com.vhu.backend.dto.tag.request.TagCreateRequest;
import com.vhu.backend.dto.tag.request.TagUpdateRequest;
import com.vhu.backend.dto.tag.response.TagResponse;
import com.vhu.backend.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody TagCreateRequest request) {
        return new ResponseEntity<>(tagService.createTag(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<TagResponse>> getAllTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String search
    ) {
        return ResponseEntity.ok(tagService.getAllTags(page, size, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getTagById(@PathVariable("id") Integer tagId) {
        return ResponseEntity.ok(tagService.getTagById(tagId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<TagResponse> updateTag(@PathVariable("id") Integer tagId, @Valid @RequestBody TagUpdateRequest request) {
        return ResponseEntity.ok(tagService.updateTag(tagId, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTag(@PathVariable("id") Integer tagId) {
        tagService.deleteTag(tagId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/popular")
    public ResponseEntity<List<TagResponse>> getPopularTags(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(tagService.findPopularTags(limit));
    }
}