package com.vhu.backend.controller.publics;

import com.vhu.backend.dto.partner.response.PartnerResponse;
import com.vhu.backend.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/partners")
@RequiredArgsConstructor
public class PublicPartnerController {

    private final PartnerService partnerService;

    @GetMapping
    public ResponseEntity<List<PartnerResponse>> getPublicPartners(@RequestParam(defaultValue = "vi") String lang) {
        return ResponseEntity.ok(partnerService.getPublicPartners(lang));
    }
}