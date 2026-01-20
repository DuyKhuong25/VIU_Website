package com.vhu.backend.dto.notification;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String message;
    private String link;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String type;
}