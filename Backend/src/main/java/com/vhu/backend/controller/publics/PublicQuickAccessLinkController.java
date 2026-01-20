package com.vhu.backend.controller.publics;

import com.vhu.backend.dto.quick_access.response.QuickAccessLinkResponse;
import com.vhu.backend.service.QuickAccessLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/quick-links")
@RequiredArgsConstructor
public class PublicQuickAccessLinkController {

    private final QuickAccessLinkService linkService;

    @GetMapping
    public ResponseEntity<List<QuickAccessLinkResponse>> getActiveLinks() {
        // Gọi phương thức mới và trả về DTO bạn đã định nghĩa
        return ResponseEntity.ok(linkService.getActiveLinks());
    }
}