package com.vhu.backend.controller;

import com.vhu.backend.dto.partner.request.PartnerRequest;
import com.vhu.backend.dto.partner.response.PartnerResponse;
import com.vhu.backend.service.PartnerService;
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
@RequestMapping("/api/admin/partners")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
public class PartnerController {

    private final PartnerService partnerService;

    @PostMapping
    public ResponseEntity<PartnerResponse> createPartner(@Valid @RequestBody PartnerRequest request) {
        return new ResponseEntity<>(partnerService.createPartner(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<PartnerResponse>> getAdminPartners(
            @PageableDefault(sort = "displayOrder") Pageable pageable,
            @RequestParam(defaultValue = "vi") String lang) {
        return ResponseEntity.ok(partnerService.getAdminPartners(pageable, lang));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartnerResponse> getPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(partnerService.getPartnerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartnerResponse> updatePartner(@PathVariable Long id, @Valid @RequestBody PartnerRequest request) {
        return ResponseEntity.ok(partnerService.updatePartner(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePartner(@PathVariable Long id) {
        partnerService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderPartners(@RequestBody List<Long> partnerIds) {
        partnerService.reorderPartners(partnerIds);
        return ResponseEntity.ok().build();
    }
}