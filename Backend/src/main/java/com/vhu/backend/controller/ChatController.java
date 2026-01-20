package com.vhu.backend.controller;

import com.vhu.backend.dto.chat.request.AdminMessageRequest;
import com.vhu.backend.dto.chat.request.StartChatRequest;
import com.vhu.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // Endpoint để Admin lấy token Firebase khi đăng nhập
    @PostMapping("/auth/firebase-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getFirebaseToken(@AuthenticationPrincipal UserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_EDITOR") || a.getAuthority().equals("ROLE_MANAGER"));
        System.out.println("Admin: " + isAdmin);
        String token = chatService.generateFirebaseToken(userDetails.getUsername(), isAdmin);
        return ResponseEntity.ok(Map.of("token", token));
    }

    // Endpoint public cho Sinh viên bắt đầu chat
    @PostMapping("/public/chat/start")
    public ResponseEntity<Map<String, String>> startConversation(@Valid @RequestBody StartChatRequest request) {
        String token = chatService.startConversation(request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    // Endpoint cho Admin gửi tin nhắn
    @PostMapping("/admin/chat/conversations/{firestoreId}/messages")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<Void> postAdminMessage(
            @PathVariable String firestoreId,
            @Valid @RequestBody AdminMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        chatService.handleAdminMessage(firestoreId, userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }

    // Endpoint cho Admin đánh dấu đã đọc
    @PostMapping("/admin/chat/conversations/{firestoreId}/mark-as-read")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<Void> markAsRead(@PathVariable String firestoreId) {
        chatService.markConversationAsReadByAdmin(firestoreId);
        return ResponseEntity.ok().build();
    }

    // Endpoint nội bộ cho Cloud Function
    @DeleteMapping("/internal/chat/conversations/{firestoreId}")
    public ResponseEntity<Void> deleteConversationRecord(@PathVariable String firestoreId) {
        chatService.deleteConversationByFirestoreId(firestoreId);
        return ResponseEntity.ok().build();
    }
}