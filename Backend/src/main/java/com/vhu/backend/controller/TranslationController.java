package com.vhu.backend.controller;

import com.vhu.backend.dto.translate.request.TranslateRequest;
import com.vhu.backend.dto.translate.response.TranslateResponse;
import com.vhu.backend.service.TranslationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/translate")
@RequiredArgsConstructor
public class TranslationController {

    private final TranslationService translationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<TranslateResponse> translateText(@Valid @RequestBody TranslateRequest request) {
        Map<String, String> translatedMap = translationService.translateToEnglish(request.getTexts());
        return ResponseEntity.ok(new TranslateResponse(translatedMap));
    }
}