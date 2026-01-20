package com.vhu.backend.controller;

import com.vhu.backend.dto.quick_access.request.QuickAccessLinkRequest;
import com.vhu.backend.dto.quick_access.response.QuickAccessLinkResponse;
import com.vhu.backend.service.QuickAccessLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quick-access")
@RequiredArgsConstructor
public class QuickAccessLinkController {

    private final QuickAccessLinkService linkService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<QuickAccessLinkResponse> createLink(@Valid @RequestBody QuickAccessLinkRequest request) {
        return new ResponseEntity<>(linkService.createLink(request), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<Page<QuickAccessLinkResponse>> getAllLinks(
            @PageableDefault(sort = "displayOrder") Pageable pageable,
            @RequestParam(defaultValue = "vi") String lang) {
        return ResponseEntity.ok(linkService.getAllLinks(pageable, lang));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<QuickAccessLinkResponse> getLinkById(
            @PathVariable Long id) {
        return ResponseEntity.ok(linkService.getLinkById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<QuickAccessLinkResponse> updateLink(@PathVariable Long id, @Valid @RequestBody QuickAccessLinkRequest request) {
        return ResponseEntity.ok(linkService.updateLink(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLink(@PathVariable Long id) {
        linkService.deleteLink(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<Void> reorderLinks(@RequestBody List<Long> linkIds) {
        linkService.updateLinkOrder(linkIds);
        return ResponseEntity.ok().build();
    }
}