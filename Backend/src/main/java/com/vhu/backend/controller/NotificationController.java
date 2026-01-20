package com.vhu.backend.controller;

import com.vhu.backend.dto.notification.NotificationResponse;
import com.vhu.backend.entity.NotificationType;
import com.vhu.backend.entity.User;
import com.vhu.backend.repository.UserRepository;
import com.vhu.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(notificationService.getNotificationsForCurrentUser(page, size));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<NotificationResponse>> getRecentNotifications() {
        return ResponseEntity.ok(notificationService.getRecentNotificationsForCurrentUser());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = notificationService.getUnreadNotificationCountForCurrentUser();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllNotificationsAsReadForCurrentUser();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribeToTopic(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        if (token != null && !token.isBlank()) {
            System.out.println("!!! DEBUG: Đang đăng ký token: " + token);
            notificationService.subscribeToTopic(token);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllNotifications() {
        notificationService.deleteAllNotificationsForCurrentUser();
        return ResponseEntity.noContent().build();
    }
}